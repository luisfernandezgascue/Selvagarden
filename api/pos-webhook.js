import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const config = { maxDuration: 30 };

const SQUARE_BASE = 'https://connect.squareup.com/v2';
const SQUARE_VERSION = '2024-06-04';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vmqhxyclcrofiphdriub.supabase.co';

function db() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY not configured');
  return createClient(SUPABASE_URL, key);
}

function calcNivel(consumo) {
  const c = consumo || 0;
  if (c >= 1500) return 'babilonia';
  if (c >= 600)  return 'versailles';
  if (c >= 200)  return 'alhambra';
  return 'sin_nivel';
}

function getDiscountText(nivel) {
  const map = { alhambra: '5% descuento', versailles: '10% descuento', babilonia: '15% descuento' };
  return map[(nivel || '').toLowerCase()] || 'Sin descuento';
}

function verifySignature(rawBody, signature, notificationUrl) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key) return true; // skip verification if not yet configured
  if (!signature) return false;
  const hmac = crypto.createHmac('sha256', key);
  hmac.update(notificationUrl + rawBody);
  const expected = hmac.digest('base64');
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

async function fetchSquareOrderItems(orderId) {
  if (!orderId || !process.env.SQUARE_ACCESS_TOKEN) return [];
  try {
    const res = await fetch(`${SQUARE_BASE}/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
        'Square-Version': SQUARE_VERSION,
      },
    });
    const data = await res.json();
    const lineItems = data.order?.line_items || [];
    return lineItems.map(li => ({
      product_id: null,
      nombre: li.name || 'Producto',
      precio_unit: (li.base_price_money?.amount || 0) / 100,
      precio_final: (li.total_money?.amount || 0) / 100,
      cantidad: parseFloat(li.quantity) || 1,
    }));
  } catch (err) {
    console.warn('[pos-webhook] Could not fetch Square order items:', err.message);
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Signature verification
    const signature = req.headers['x-square-hmacsha256-signature'];
    const rawBody = JSON.stringify(req.body);
    const notificationUrl = `https://${req.headers.host}/api/pos-webhook`;

    if (!verifySignature(rawBody, signature, notificationUrl)) {
      console.error('[pos-webhook] Invalid signature');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    console.log('[pos-webhook] Event type:', event?.type);

    const payment = event?.data?.object?.payment;
    if (!payment) {
      console.log('[pos-webhook] No payment object in payload — skipping');
      return res.status(200).json({ ok: true, skipped: 'no payment object' });
    }

    console.log('[pos-webhook] Processing payment:', payment.id);
    console.log('[pos-webhook] Status:', payment.status, '| Amount:', payment.total_money?.amount, payment.total_money?.currency);
    console.log('[pos-webhook] customer_id:', payment.customer_id, '| order_id:', payment.order_id);

    // Handle both payment.completed and payment.updated events —
    // Square sends payment.updated when a payment reaches COMPLETED status.
    const isCompleted = payment.status === 'COMPLETED';
    if (!isCompleted) {
      console.log('[pos-webhook] Payment status is', payment.status, '— skipping');
      return res.status(200).json({ ok: true, skipped: `payment status: ${payment.status}` });
    }

    const total = (payment.total_money?.amount || 0) / 100;
    if (total <= 0) {
      console.log('[pos-webhook] Zero total — skipping');
      return res.status(200).json({ ok: true, skipped: 'zero total' });
    }

    const supabase = db();

    // Look up our customer by Square customer ID stored in shopify_customer_id
    let customer = null;
    if (payment.customer_id) {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('shopify_customer_id', payment.customer_id)
        .maybeSingle();

      if (error) {
        console.warn('[pos-webhook] Customer lookup error:', error.message);
      } else {
        customer = data;
      }
    }

    if (customer) {
      console.log('[pos-webhook] Customer found:', customer.id, customer.email);
    } else {
      console.log('[pos-webhook] Customer not found for Square ID:', payment.customer_id, '— saving as anonymous order');
    }

    // Try to get line items from Square; fall back to a single summary item
    const lineItems = await fetchSquareOrderItems(payment.order_id);
    const items = lineItems.length > 0
      ? lineItems
      : [{
          product_id: null,
          nombre: `Venta Square${payment.receipt_number ? ' #' + payment.receipt_number : ''}`,
          precio_unit: total,
          precio_final: total,
          cantidad: 1,
        }];

    console.log('[pos-webhook] Items to insert:', items.length);

    // Insert order — always, even for anonymous sales
    const { data: order, error: orderError } = await supabase
      .from('ordenes')
      .insert({
        customer_id: customer?.id || null,
        items,
        total,
        estado: 'confirmado',
      })
      .select()
      .single();

    if (orderError) {
      console.error('[pos-webhook] Order insert error:', orderError.message);
      throw new Error(`Insert order: ${orderError.message}`);
    }

    console.log('[pos-webhook] Order inserted:', order.id);

    if (!customer) {
      return res.status(200).json({ ok: true, order_id: order.id, customer: null });
    }

    // Update loyalty
    const puntosGanados = Math.floor(total / 100) * 10;
    const nuevoConsumo  = parseFloat(((customer.consumo_anual || 0) + total).toFixed(2));
    const nuevosPuntos  = (customer.puntos || 0) + puntosGanados;
    const nuevoNivel    = calcNivel(nuevoConsumo);
    const descuento_activo = { alhambra: 5, versailles: 10, babilonia: 15 }[nuevoNivel] || 0;

    console.log('[pos-webhook] Loyalty update — puntos ganados:', puntosGanados, '| nuevo nivel:', nuevoNivel);

    await supabase.from('customers').update({
      consumo_anual:   nuevoConsumo,
      puntos:          nuevosPuntos,
      nivel_lealtad:   nuevoNivel,
      descuento_activo,
    }).eq('id', customer.id);

    if (puntosGanados > 0) {
      await supabase.from('loyalty_transactions').insert({
        customer_id:        customer.id,
        orden_id:           order.id,
        puntos_ganados:     puntosGanados,
        puntos_usados:      0,
        balance_resultante: nuevosPuntos,
        origen:             'compra',
      });
    }

    // Update Square customer note with new loyalty level
    if (process.env.SQUARE_ACCESS_TOKEN && customer.shopify_customer_id) {
      const note = [
        nuevoNivel.toUpperCase(),
        getDiscountText(nuevoNivel),
        customer.numero_socio,
      ].filter(Boolean).join(' · ');

      fetch(`${SQUARE_BASE}/customers/${customer.shopify_customer_id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
          'Square-Version': SQUARE_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      }).catch(err => console.warn('[pos-webhook] Square note update failed:', err.message));
    }

    console.log('[pos-webhook] Done — order:', order.id, '| customer:', customer.id, '| puntos:', puntosGanados);

    return res.status(200).json({
      ok: true,
      order_id:       order.id,
      customer_id:    customer.id,
      puntos_ganados: puntosGanados,
      nivel_nuevo:    nuevoNivel,
      consumo_anual:  nuevoConsumo,
    });

  } catch (err) {
    console.error('[pos-webhook] Unhandled error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
