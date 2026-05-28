import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 30 };

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vmqhxyclcrofiphdriub.supabase.co';

function supabase() {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body = req.body || {};

    // Support both wrapped { type, data } and raw receipt
    const eventType = body.type || '';
    const receipt = body.data || body;

    // Only process sale receipts
    if (eventType && !eventType.includes('receipt')) {
      return res.status(200).json({ ok: true, skipped: 'not a receipt event' });
    }

    const loyCustomerId = receipt.customer_id;
    const total = parseFloat(receipt.total_money) || 0;
    const receiptNumber = receipt.receipt_number || `LV-${Date.now()}`;
    const receiptDate = receipt.receipt_date || new Date().toISOString();

    if (!total || total <= 0) {
      return res.status(200).json({ ok: true, skipped: 'zero total' });
    }

    const db = supabase();

    // Find our customer by Loyverse ID (stored in shopify_customer_id)
    let customer = null;
    if (loyCustomerId) {
      const { data } = await db
        .from('customers')
        .select('*')
        .eq('shopify_customer_id', loyCustomerId)
        .maybeSingle();
      customer = data;
    }

    // Build line items from Loyverse receipt
    const items = (receipt.line_items || []).map(li => ({
      product_id: null,
      nombre: li.item_name || 'Producto',
      precio_unit: parseFloat(li.price) || 0,
      precio_final: parseFloat(li.net_total_money || li.gross_total_money || li.price) || 0,
      cantidad: parseFloat(li.quantity) || 1,
    }));

    // Insert order into ordenes
    const orderPayload = {
      customer_id: customer?.id || null,
      items,
      total,
      estado: 'confirmado',
      fuente: 'loyverse',
      referencia: receiptNumber,
      created_at: receiptDate,
    };
    const { data: order, error: orderError } = await db
      .from('ordenes')
      .insert(orderPayload)
      .select()
      .single();
    if (orderError) throw new Error(`Insert order: ${orderError.message}`);

    // If no customer, we're done
    if (!customer) {
      return res.status(200).json({ ok: true, order_id: order.id, customer: null });
    }

    // Calculate points and new loyalty level
    const puntosGanados = Math.floor(total / 100) * 10;
    const nuevoConsumo = (customer.consumo_anual || 0) + total;
    const nuevosPuntos = (customer.puntos || 0) + puntosGanados;
    const nuevoNivel = calcNivel(nuevoConsumo);

    // Update customer
    await db.from('customers').update({
      consumo_anual: nuevoConsumo,
      puntos: nuevosPuntos,
      nivel_lealtad: nuevoNivel,
    }).eq('id', customer.id);

    // Insert loyalty transaction
    await db.from('loyalty_transactions').insert({
      customer_id: customer.id,
      tipo: 'compra',
      puntos: puntosGanados,
      descripcion: `Compra en tienda · ${receiptNumber} · $${total.toFixed(2)}`,
      referencia: order.id,
    });

    return res.status(200).json({
      ok: true,
      order_id: order.id,
      customer_id: customer.id,
      puntos_ganados: puntosGanados,
      nivel_nuevo: nuevoNivel,
      consumo_anual: nuevoConsumo,
    });

  } catch (err) {
    console.error('[loyverse-webhook]', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
