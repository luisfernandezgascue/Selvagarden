import { supabase } from './supabase';

const PRODUCT_SELECT = `
  *,
  subfamily:product_subfamilies(
    id, nombre, slug, codigo, orden,
    family:product_families(id, nombre, slug, codigo, orden)
  )
`;

function sortProducts(products) {
  return (products || []).sort((a, b) => {
    const fo = p => p?.subfamily?.family?.orden ?? 99;
    const so = p => p?.subfamily?.orden ?? 99;
    if (fo(a) !== fo(b)) return fo(a) - fo(b);
    if (so(a) !== so(b)) return so(a) - so(b);
    return (a.nombre || '').localeCompare(b.nombre || '', 'es');
  });
}

export async function fetchProducts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('activo', true);
  if (error) console.error('[db] fetchProducts:', error.message);
  return sortProducts(data);
}

export async function fetchFeaturedProduct() {
  if (!supabase) return null;
  const { data: feat } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('activo', true)
    .eq('featured', true)
    .limit(1)
    .maybeSingle();
  if (feat) return feat;
  const { data: mons } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('activo', true)
    .ilike('nombre', '%monstera%')
    .limit(1)
    .maybeSingle();
  if (mons) return mons;
  const { data: first } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('activo', true)
    .limit(1)
    .maybeSingle();
  return first || null;
}

export async function fetchProductWithCare(productId) {
  if (!supabase || !productId) return null;
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      plant_care(*),
      subfamily:product_subfamilies(
        nombre, slug, codigo,
        family:product_families(nombre, slug, codigo)
      )
    `)
    .eq('id', productId)
    .single();
  if (error) console.error('[db] fetchProductWithCare:', error.message);
  return data;
}

export async function fetchEvents() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('activo', true)
    .gte('fecha', new Date().toISOString())
    .order('fecha');
  if (error) console.error('[db] fetchEvents:', error.message);
  return data || [];
}

export async function fetchOrders(customerId) {
  if (!supabase || !customerId) return [];
  const { data, error } = await supabase
    .from('ordenes')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) console.error('[db] fetchOrders:', error.message);
  return data || [];
}

export async function fetchLoyaltyTransactions(customerId) {
  if (!supabase || !customerId) return [];
  const { data, error } = await supabase
    .from('loyalty_transactions')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) console.error('[db] fetchLoyaltyTransactions:', error.message);
  return data || [];
}

export async function fetchPlantCare() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('plant_care')
    .select(`*, product:products(nombre, imagen_url, subfamily:product_subfamilies(nombre, family:product_families(nombre)))`)
    .order('id');
  if (error) console.error('[db] fetchPlantCare:', error.message);
  return data || [];
}
