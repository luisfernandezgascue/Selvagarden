// api/sync-product.js
// Supabase (products) -> Shopify. Supabase es la fuente de verdad.
//
// Variables de entorno en Vercel:
//   SHOPIFY_STORE_DOMAIN     3vhr9z-ni.myshopify.com
//   SHOPIFY_CLIENT_ID        Client ID de la app selva-sync (Dev Dashboard > Configuración)
//   SHOPIFY_CLIENT_SECRET    Client secret de la app selva-sync
//   WEBHOOK_SECRET           mismo valor que el header x-webhook-secret del webhook de Supabase
//   SUPABASE_URL             https://pjckvtkqzujczwkewgmq.supabase.co
//   SUPABASE_SERVICE_KEY     service_role key de Supabase

export const config = { runtime: 'edge' };

const SHOPIFY_STORE  = process.env.SHOPIFY_STORE_DOMAIN;
const CLIENT_ID      = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET  = process.env.SHOPIFY_CLIENT_SECRET;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SUPABASE_KEY   = process.env.SUPABASE_SERVICE_KEY;

const API_VERSION = '2026-10';
const SHOPIFY_API = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`;

// Canal "Tienda online" de Selva Garden
const ONLINE_STORE_PUBLICATION = 'gid://shopify/Publication/376787403084';

const COLLECTION_MAP = {
  'flores-temporada': 'gid://shopify/Collection/699841511756',
  'follaje-verde':    'gid://shopify/Collection/699841544524',
  'plantas-interior': 'gid://shopify/Collection/699841577292',
  'plantas-exterior': 'gid://shopify/Collection/699841610060',
  'materos-macetas':  'gid://shopify/Collection/699841642828',
  'aromas-difusores': 'gid://shopify/Collection/699841675596',
  'velas-fragancias': 'gid://shopify/Collection/699841708364',
  'sustratos':        'gid://shopify/Collection/699841741132',
  'herramientas':     'gid://shopify/Collection/699841773900',
  'accesorios-deco':  'gid://shopify/Collection/699841806668',
};

// ─── Handler ──────────────────────────────────────────────────────────────
export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  if (req.headers.get('x-webhook-secret') !== WEBHOOK_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const { type, record, old_record: oldRecord } = body;
  if (!record || !record.sku) {
    return new Response('No record or SKU', { status: 200 });
  }

  // Evita el rebote: al crear, escribimos shopify_product_id en Supabase y eso
  // dispara un UPDATE. Si solo cambió ese campo, no hay nada que sincronizar.
  if (type === 'UPDATE' && oldRecord && !oldRecord.shopify_product_id && record.shopify_product_id) {
    return json({ ok: true, skipped: 'shopify_product_id writeback' });
  }

  try {
    const isNew = type === 'INSERT' || !record.shopify_product_id;
    const result = isNew ? await createProduct(record) : await updateProduct(record);
    return json({ ok: true, ...result });
  } catch (e) {
    console.error('Sync error:', e);
    return json({ error: e.message }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Token de Shopify (client credentials, dura ~24 h) ────────────────────
let cachedToken = null; // { value, expiresAt }

async function getToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }

  const res = await fetch(`https://${SHOPIFY_STORE}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }

  const data = JSON.parse(text);
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 86399) * 1000,
  };
  return cachedToken.value;
}

// ─── Shopify GraphQL helper ───────────────────────────────────────────────
async function shopifyGql(query, variables = {}, isRetry = false) {
  const token = await getToken(isRetry);
  const res = await fetch(SHOPIFY_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({ query, variables }),
  });

  // Token caducado o revocado: pedir uno nuevo y reintentar una vez
  if (res.status === 401 && !isRetry) {
    return shopifyGql(query, variables, true);
  }

  const payload = await res.json();
  if (payload.errors) throw new Error(JSON.stringify(payload.errors));
  return payload.data;
}

function assertNoUserErrors(label, userErrors) {
  if (userErrors && userErrors.length) {
    throw new Error(`${label}: ` + userErrors.map(e => `${(e.field || []).join('.')} ${e.message}`).join('; '));
  }
}

// ─── Construir input del producto ─────────────────────────────────────────
function buildProductInput(record) {
  const input = {
    title: record.nombre,
    descriptionHtml: record.descripcion_editorial || '',
    status: record.activo ? 'ACTIVE' : 'DRAFT',
  };

  // Solo se une a colecciones; nunca se saca de ninguna (sync no destructivo)
  const collection = record.subfamilia && COLLECTION_MAP[record.subfamilia];
  if (collection) input.collectionsToJoin = [collection];

  return input;
}

// ─── Precio y SKU de la variante (Shopify crea una variante por defecto) ──
async function setVariant(productId, variantId, record) {
  const data = await shopifyGql(
    `mutation variantUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`,
    {
      productId,
      variants: [{
        id: variantId,
        price: String(record.precio_venta ?? '0'),
        // tracked:false => se puede comprar sin stock sincronizado (sync de stock = siguiente fase)
        inventoryItem: { sku: record.sku, tracked: false },
      }],
    },
  );
  assertNoUserErrors('productVariantsBulkUpdate', data.productVariantsBulkUpdate.userErrors);
}

// ─── Publicar en Tienda online ────────────────────────────────────────────
async function publish(productId) {
  const data = await shopifyGql(
    `mutation publish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id: productId, input: [{ publicationId: ONLINE_STORE_PUBLICATION }] },
  );
  assertNoUserErrors('publishablePublish', data.publishablePublish.userErrors);
}

// ─── Crear producto nuevo ─────────────────────────────────────────────────
async function createProduct(record) {
  const media = record.imagen_url
    ? [{ originalSource: record.imagen_url, mediaContentType: 'IMAGE', alt: record.nombre }]
    : [];

  const data = await shopifyGql(
    `mutation productCreate($product: ProductCreateInput!, $media: [CreateMediaInput!]) {
      productCreate(product: $product, media: $media) {
        product {
          id
          legacyResourceId
          variants(first: 1) { nodes { id } }
        }
        userErrors { field message }
      }
    }`,
    { product: buildProductInput(record), media },
  );
  assertNoUserErrors('productCreate', data.productCreate.userErrors);

  const product = data.productCreate.product;
  const variantId = product.variants.nodes[0]?.id;

  if (variantId) await setVariant(product.id, variantId, record);
  if (record.activo) await publish(product.id);

  // Guardar el ID de Shopify en Supabase para que los próximos cambios sean UPDATE
  if (SUPABASE_URL && SUPABASE_KEY) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/products?sku=eq.${encodeURIComponent(record.sku)}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ shopify_product_id: product.legacyResourceId }),
    });
    if (!res.ok) throw new Error(`Supabase writeback failed (${res.status}): ${await res.text()}`);
  }

  return { action: 'created', shopify_product_id: product.legacyResourceId };
}

// ─── Actualizar producto existente ────────────────────────────────────────
// Las imágenes solo se envían al crear, para no duplicarlas en cada UPDATE.
async function updateProduct(record) {
  const productId = `gid://shopify/Product/${record.shopify_product_id}`;

  const data = await shopifyGql(
    `mutation productUpdate($product: ProductUpdateInput!) {
      productUpdate(product: $product) {
        product {
          id
          variants(first: 1) { nodes { id } }
        }
        userErrors { field message }
      }
    }`,
    { product: { id: productId, ...buildProductInput(record) } },
  );
  assertNoUserErrors('productUpdate', data.productUpdate.userErrors);

  const variantId = data.productUpdate.product.variants.nodes[0]?.id;
  if (variantId) await setVariant(productId, variantId, record);
  if (record.activo) await publish(productId);

  return { action: 'updated', shopify_product_id: record.shopify_product_id };
}
