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
  if (!key) return true; // skip if not yet configured
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

async function sqGet(path) {
  const res = await fetch(`${SQUARE_BASE}${path}`, {
    headers: {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Square-Version': SQUARE_VERSION,
    },
  });
  return res.json();
}

async function sqPut(path, body) {
  await fetch(`${SQUARE_BASE}${path}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      'Square-Version': SQUARE_VERSION,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Square signature verification
    const signature = req.headers['x-square-hmacsha256-signature'];
    const rawBody = JSON.stringify(req.body);
    const notificationUrl = `https://${req.headers.host}/api/pos-webhook`;

    if (!verifySignature(rawBody, signature, notificationUrl)) {
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;

    // Only process completed payments
    if (event?.type !== 'payment.completed') {
      return res.status(200).json({ ok: true, skipped: `unhandled event: ${event?.type}` });
    }

    const payment = event?.data?.object?.payment;
    if (!payment) return res.status(200).json({ ok: true, skipped: 'no payment object' });

    const total = (payment.total_money?.amount || 0) / 100;
    if (total <= 0) return res.status(200).json({ ok: true, skipped: 'zero total' });

    const squareCustomerId = payment.customer_id;
    const orderId = payment.order_id;

    // Fetch order line items from Square for receipt detail
    let lineItems = [];
    if (orderId && process.env.SQUARE_ACCESS_TOKEN) {
      const orderData = await sqGet(`/orders/${orderId}`);
      lineItems = orderData.order?.line_items || [];
    }

    const supabase = db();

    // Find our customer by Square customer ID
    let customer = null;
    if (squareCustomerId) {
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('shopify_customer_id', squareCustomerId)
        .maybeSingle();
      customer = data;
    }

    // Build line items array for ordenes
    const items = lineItems.map(li => ({
      product_id: null,
      nombre: li.name || 'Producto',
      precio_unit: (li.base_price_money?.amount || 0) / 100,
      precio_final: (li.total_money?.amount || 0) / 100,
      cantidad: parseFloat(li.quantity) || 1,
    }));

    // Insert order
    const { data: order, error: orderError } = await supabase
      .from('ordenes')
      .insert({
        customer_id: customer?.id || null,
        items,
        total,
        estado: 'confirmado',
        fuente: 'square',
        referencia: payment.id,
      })
      .select()
      .single();
    if (orderError) throw new Error(`Insert order: ${orderError.message}`);

    if (!customer) {
      return res.status(200).json({ ok: true, order_id: order.id, customer: null });
    }

    // Update loyalty
    const puntosGanados = Math.floor(total / 100) * 10;
    const nuevoConsumo  = (customer.consumo_anual || 0) + total;
    const nuevosPuntos  = (customer.puntos || 0) + puntosGanados;
    const nuevoNivel    = calcNivel(nuevoConsumo);

    await supabase.from('customers').update({
      consumo_anual: nuevoConsumo,
      puntos:        nuevosPuntos,
      nivel_lealtad: nuevoNivel,
    }).eq('id', customer.id);

    await supabase.from('loyalty_transactions').insert({
      customer_id:  customer.id,
      tipo:         'compra',
      puntos:       puntosGanados,
      descripcion:  `Compra Square · ${payment.id} · $${total.toFixed(2)}`,
      referencia:   order.id,
    });

    // Update the Square customer note to reflect new loyalty level
    if (process.env.SQUARE_ACCESS_TOKEN && customer.shopify_customer_id) {
      const note = [
        nuevoNivel.toUpperCase(),
        getDiscountText(nuevoNivel),
        customer.numero_socio,
      ].filter(Boolean).join(' · ');
      await sqPut(`/customers/${customer.shopify_customer_id}`, { note }).catch(() => {});
    }

    return res.status(200).json({
      ok: true,
      order_id:      order.id,
      customer_id:   customer.id,
      puntos_ganados: puntosGanados,
      nivel_nuevo:   nuevoNivel,
      consumo_anual: nuevoConsumo,
    });

  } catch (err) {
    console.error('[pos-webhook]', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
