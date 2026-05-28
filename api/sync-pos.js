import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const config = { maxDuration: 60 };

const SQUARE_BASE = 'https://connect.squareup.com/v2';
const SQUARE_VERSION = '2024-06-04';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://vmqhxyclcrofiphdriub.supabase.co';

function db() {
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_KEY not configured');
  return createClient(SUPABASE_URL, key);
}

function sqHeaders() {
  return {
    'Authorization': `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
    'Square-Version': SQUARE_VERSION,
    'Content-Type': 'application/json',
  };
}

async function sq(method, path, body) {
  const res = await fetch(`${SQUARE_BASE}${path}`, {
    method,
    headers: sqHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json();
  if (!res.ok) {
    const detail = (data.errors || []).map(e => e.detail || e.code).join('; ') || JSON.stringify(data);
    throw new Error(`Square ${method} ${path} → ${res.status}: ${detail}`);
  }
  return data;
}

function idemKey(...parts) {
  return crypto.createHash('md5').update(parts.join('|')).digest('hex');
}

function getDiscountText(nivel) {
  const map = { alhambra: '5% descuento', versailles: '10% descuento', babilonia: '15% descuento' };
  return map[(nivel || '').toLowerCase()] || 'Sin descuento';
}

// ── 1. Sync customers ──────────────────────────────────────────────────────────
async function syncCustomers(supabase) {
  const { data: customers, error } = await supabase.from('customers').select('*');
  if (error) throw new Error(`Supabase fetchCustomers: ${error.message}`);

  const results = { created: 0, updated: 0, errors: [] };

  for (const c of customers || []) {
    const note = [
      (c.nivel_lealtad || 'sin_nivel').toUpperCase(),
      getDiscountText(c.nivel_lealtad),
      c.numero_socio,
    ].filter(Boolean).join(' · ');

    try {
      if (c.shopify_customer_id) {
        // Update existing Square customer note with current loyalty level
        await sq('PUT', `/customers/${c.shopify_customer_id}`, { note });
        results.updated++;
      } else {
        // Search Square for existing customer by reference_id (numero_socio)
        let squareId = null;
        if (c.numero_socio) {
          const search = await sq('POST', '/customers/search', {
            query: { filter: { reference_id: { exact: c.numero_socio } } },
            limit: 1,
          });
          squareId = search.customers?.[0]?.id || null;
        }

        if (squareId) {
          await sq('PUT', `/customers/${squareId}`, { note });
          results.updated++;
        } else {
          const created = await sq('POST', '/customers', {
            given_name: c.nombre || 'Cliente',
            ...(c.email    ? { email_address: c.email }        : {}),
            ...(c.telefono ? { phone_number:  c.telefono }     : {}),
            ...(c.numero_socio ? { reference_id: c.numero_socio } : {}),
            note,
            idempotency_key: idemKey('cust', c.id),
          });
          squareId = created.customer?.id;
          results.created++;
        }

        if (squareId) {
          await supabase.from('customers').update({ shopify_customer_id: squareId }).eq('id', c.id);
        }
      }
    } catch (err) {
      results.errors.push({ email: c.email, error: err.message });
    }
  }

  return { total: customers?.length || 0, ...results };
}

// ── 2. Sync products ───────────────────────────────────────────────────────────
async function syncProducts(supabase) {
  const { data: products, error } = await supabase
    .from('products').select('*').eq('sync_pos', true).eq('activo', true);
  if (error) throw new Error(`Supabase fetchProducts: ${error.message}`);

  const results = { created: 0, updated: 0, errors: [] };

  for (const p of products || []) {
    const displayName = [p.nombre, p.color, p.talla].filter(Boolean).join(' ');
    const amountCents = Math.round((p.precio_venta || 0) * 100);

    try {
      let itemId = `#item_${p.sku}`;
      let varId  = `#var_${p.sku}`;

      if (p.bc_item_id) {
        // Fetch existing item to retrieve the real variation ID for update
        const existing = await sq('GET', `/catalog/object/${p.bc_item_id}?include_related_objects=false`);
        itemId = p.bc_item_id;
        varId  = existing.object?.item_data?.variations?.[0]?.id || varId;
      }

      const result = await sq('POST', '/catalog/object', {
        idempotency_key: idemKey('catalog', p.sku, String(amountCents)),
        object: {
          type: 'ITEM',
          id: itemId,
          item_data: {
            name: displayName,
            ...(p.descripcion ? { description: p.descripcion } : {}),
            variations: [{
              type: 'ITEM_VARIATION',
              id: varId,
              item_variation_data: {
                name: p.talla || 'Estándar',
                pricing_type: 'FIXED_PRICING',
                price_money: { amount: amountCents, currency: 'USD' },
                ...(p.sku ? { sku: p.sku } : {}),
              },
            }],
          },
        },
      });

      const newId = result.catalog_object?.id;
      if (!p.bc_item_id && newId) {
        await supabase.from('products').update({ bc_item_id: newId }).eq('id', p.id);
        results.created++;
      } else {
        results.updated++;
      }
    } catch (err) {
      results.errors.push({ sku: p.sku, error: err.message });
    }
  }

  return { total: products?.length || 0, ...results };
}

// ── 3. Sync discounts ─────────────────────────────────────────────────────────
async function syncDiscounts() {
  const existing = await sq('POST', '/catalog/search', { object_types: ['DISCOUNT'], limit: 100 });
  const existingNames = (existing.objects || []).map(o => o.discount_data?.name);

  const toCreate = [
    { name: 'Alhambra 5%',    percentage: '5.0' },
    { name: 'Versailles 10%', percentage: '10.0' },
    { name: 'Babilonia 15%',  percentage: '15.0' },
  ].filter(d => !existingNames.includes(d.name));

  if (toCreate.length === 0) return { created: 0, skipped: 3 };

  await sq('POST', '/catalog/batch-upsert', {
    idempotency_key: idemKey('discounts', new Date().toDateString()),
    batches: [{
      objects: toCreate.map(d => ({
        type: 'DISCOUNT',
        id: `#discount_${d.name.replace(/\s+/g, '_').toLowerCase()}`,
        discount_data: {
          name: d.name,
          discount_type: 'FIXED_PERCENTAGE',
          percentage: d.percentage,
        },
      })),
    }],
  });

  return { created: toCreate.length, skipped: 3 - toCreate.length };
}

// ── Handler ───────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!process.env.SQUARE_ACCESS_TOKEN) return res.status(500).json({ error: 'SQUARE_ACCESS_TOKEN not configured' });
  if (!process.env.SUPABASE_SERVICE_KEY) return res.status(500).json({ error: 'SUPABASE_SERVICE_KEY not configured' });

  try {
    const supabase = db();

    const [productResults, customerResults, discountResults] = await Promise.allSettled([
      syncProducts(supabase),
      syncCustomers(supabase),
      syncDiscounts(),
    ]);

    return res.status(200).json({
      ok: true,
      products:  productResults.status  === 'fulfilled' ? productResults.value  : { error: productResults.reason?.message },
      customers: customerResults.status === 'fulfilled' ? customerResults.value : { error: customerResults.reason?.message },
      discounts: discountResults.status === 'fulfilled' ? discountResults.value : { error: discountResults.reason?.message },
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
