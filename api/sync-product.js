export const config = { runtime: 'edge' };

const SHOPIFY_STORE   = process.env.SHOPIFY_STORE_DOMAIN;   // 3vhr9z-ni.myshopify.com
const SHOPIFY_TOKEN   = process.env.SHOPIFY_ACCESS_TOKEN;   // atkn_5b80...
const WEBHOOK_SECRET  = process.env.WEBHOOK_SECRET;         // clave que tú eliges
const SUPABASE_URL    = process.env.SUPABASE_URL;           // https://pjckvtkqzujczwkewgmq.supabase.co
const SUPABASE_KEY    = process.env.SUPABASE_SERVICE_KEY;   // service_role key

const SHOPIFY_API = `https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json`;

// Mapa subfamilia slug → Shopify Collection GID
const COLLECTION_MAP = {
  'flores-temporada':  'gid://shopify/Collection/699841511756',
  'follaje-verde':     'gid://shopify/Collection/699841544524',
  'plantas-interior':  'gid://shopify/Collection/699841577292',
  'plantas-exterior':  'gid://shopify/Collection/699841610060',
  'materos-macetas':   'gid://shopify/Collection/699841642828',
  'aromas-difusores':  'gid://shopify/Collection/699841675596',
  'velas-fragancias':  'gid://shopify/Collection/699841708364',
  'sustratos':         'gid://shopify/Collection/699841741132',
  'herramientas':      'gid://shopify/Collection/699841773900',
  'accesorios-deco':   'gid://shopify/Collection/699841806668',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // Validar secreto
  const secret = req.headers.get('x-webhook-secret');
  if (secret !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }
  // DEBUG temporal - borrar después
  console.log('TOKEN exists:', !!SHOPIFY_TOKEN);
  console.log('TOKEN prefix:', SHOPIFY_TOKEN?.substring(0, 10));
  console.log('STORE:', SHOPIFY_STORE);
  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const { type, record } = body;
  if (!record || !record.sku) {
    return new Response('No record or SKU', { status: 200 });
  }

  try {
    const isNew = type === 'INSERT' || !record.shopify_product_id;
    if (isNew) {
      await createProduct(record);
    } else {
      await updateProduct(record);
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Sync error:', e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ─── Shopify GraphQL helper ────────────────────────────────────────────────
async function shopifyGql(query, variables = {}) {
  const res = await fetch(SHOPIFY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': SHOPIFY_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

// ─── Construir input de producto ──────────────────────────────────────────
function buildProductInput(record) {
  const collectionsToJoin = [];
  if (record.subfamilia && COLLECTION_MAP[record.subfamilia]) {
    collectionsToJoin.push(COLLECTION_MAP[record.subfamilia]);
  }

  return {
    title: record.nombre,
    bodyHtml: record.descripcion_editorial || '',
    status: record.activo ? 'ACTIVE' : 'DRAFT',
    collectionsToJoin,
    variants: [{
      sku: record.sku,
      price: String(record.precio_venta || '0'),
      inventoryManagement: 'SHOPIFY',
    }],
    ...(record.imagen_url ? {
      images: [{ src: record.imagen_url }],
    } : {}),
  };
}

// ─── Crear producto nuevo ─────────────────────────────────────────────────
async function createProduct(record) {
  const input = buildProductInput(record);

  const mutation = `
    mutation productCreate($product: ProductCreateInput!) {
      productCreate(product: $product) {
        product { id legacyResourceId }
        userErrors { field message }
      }
    }
  `;

  const data = await shopifyGql(mutation, { product: input });
  const errors = data?.productCreate?.userErrors;
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '));

  const shopifyId = data?.productCreate?.product?.legacyResourceId;
  if (shopifyId && SUPABASE_URL && SUPABASE_KEY) {
    // Escribir shopify_product_id de vuelta a Supabase
    await fetch(`${SUPABASE_URL}/rest/v1/products?sku=eq.${encodeURIComponent(record.sku)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ shopify_product_id: shopifyId }),
    });
  }
}

// ─── Actualizar producto existente ────────────────────────────────────────
async function updateProduct(record) {
  const productGid = `gid://shopify/Product/${record.shopify_product_id}`;
  const input = buildProductInput(record);

  const mutation = `
    mutation productUpdate($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product { id }
        userErrors { field message }
      }
    }
  `;

  const data = await shopifyGql(mutation, {
    product: { id: productGid, ...input },
  });

  const errors = data?.productUpdate?.userErrors;
  if (errors?.length) throw new Error(errors.map(e => e.message).join(', '));
}
