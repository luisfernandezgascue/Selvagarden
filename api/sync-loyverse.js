import { createClient } from '@supabase/supabase-js';

export const config = { maxDuration: 60 };

const LOYVERSE_BASE = 'https://api.loyverse.com/v1';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vmqhxyclcrofiphdriub.supabase.co';

function supabase() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY not configured');
  return createClient(SUPABASE_URL, key);
}

async function loy(method, path, body) {
  const token = process.env.LOYVERSE_API_TOKEN;
  if (!token) throw new Error('LOYVERSE_API_TOKEN not configured');
  const res = await fetch(`${LOYVERSE_BASE}${path}`, {
    method,
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Loyverse ${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// ── 1. Sync products ──────────────────────────────────────────────────────────
async function syncProducts(db) {
  const { data: products, error } = await db.from('products').select('*').eq('sync_pos', true).eq('activo', true);
  if (error) throw new Error(`Supabase fetchProducts: ${error.message}`);

  const results = { created: 0, updated: 0, errors: [] };

  for (const p of products || []) {
    const displayName = [p.nombre, p.color, p.talla].filter(Boolean).join(' ');
    const variant = {
      price: p.precio_venta || 0,
      cost_of_goods: p.precio_compra || 0,
      sku: p.sku || '',
      barcode: p.sku || '',
    };

    try {
      let loyItem;
      if (p.bc_item_id) {
        // Update existing
        loyItem = await loy('PUT', `/items/${p.bc_item_id}`, {
          item_name: displayName,
          variants: [{ variant_id: p.bc_item_id + '_v1', ...variant }],
        });
        results.updated++;
      } else {
        // Create new
        loyItem = await loy('POST', '/items', {
          item_name: displayName,
          variants: [variant],
        });
        // Store Loyverse item_id back
        await db.from('products').update({ bc_item_id: loyItem.id }).eq('id', p.id);
        results.created++;
      }
    } catch (err) {
      results.errors.push({ sku: p.sku, error: err.message });
    }
  }

  return { total: products?.length || 0, ...results };
}

// ── 2. Sync customers ─────────────────────────────────────────────────────────
async function syncCustomers(db) {
  const { data: customers, error } = await db.from('customers').select('*');
  if (error) throw new Error(`Supabase fetchCustomers: ${error.message}`);

  const results = { created: 0, updated: 0, errors: [] };

  for (const c of customers || []) {
    const payload = {
      name: c.nombre || c.email || 'Cliente',
      email: c.email || undefined,
      phone_number: c.telefono || undefined,
      note: [c.nivel_lealtad, c.numero_socio].filter(Boolean).join(' | ') || undefined,
    };

    try {
      let loyCustomer;
      if (c.shopify_customer_id) {
        // Update existing Loyverse customer
        loyCustomer = await loy('PUT', `/customers/${c.shopify_customer_id}`, payload);
        results.updated++;
      } else {
        // Create new
        loyCustomer = await loy('POST', '/customers', payload);
        await db.from('customers').update({ shopify_customer_id: loyCustomer.id }).eq('id', c.id);
        results.created++;
      }
    } catch (err) {
      results.errors.push({ email: c.email, error: err.message });
    }
  }

  return { total: customers?.length || 0, ...results };
}

// ── 3. Sync discounts ─────────────────────────────────────────────────────────
async function syncDiscounts() {
  const { discounts: existing } = await loy('GET', '/discounts?limit=250');
  const existingNames = (existing || []).map(d => d.name);

  const toCreate = [
    { name: 'Alhambra 5%',    type: 'PERCENT', value: 5 },
    { name: 'Versailles 10%', type: 'PERCENT', value: 10 },
    { name: 'Babilonia 15%',  type: 'PERCENT', value: 15 },
  ].filter(d => !existingNames.includes(d.name));

  const results = { created: 0, skipped: 3 - toCreate.length };

  for (const d of toCreate) {
    await loy('POST', '/discounts', d);
    results.created++;
  }

  return results;
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = supabase();

    const [productResults, customerResults, discountResults] = await Promise.allSettled([
      syncProducts(db),
      syncCustomers(db),
      syncDiscounts(),
    ]);

    return res.status(200).json({
      ok: true,
      products: productResults.status === 'fulfilled' ? productResults.value : { error: productResults.reason?.message },
      customers: customerResults.status === 'fulfilled' ? customerResults.value : { error: customerResults.reason?.message },
      discounts: discountResults.status === 'fulfilled' ? discountResults.value : { error: discountResults.reason?.message },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
