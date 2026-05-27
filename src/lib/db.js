import { supabase } from './supabase';

export async function fetchProducts() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      subfamily:product_subfamilies(
        id, nombre, slug,
        family:product_families(id, nombre, slug)
      )
    `)
    .eq('activo', true)
    .order('nombre');
  if (error) console.error('[db] fetchProducts:', error.message);
  return data || [];
}

export async function fetchProductWithCare(productId) {
  if (!supabase || !productId) return null;
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      plant_care(*),
      subfamily:product_subfamilies(
        nombre, slug,
        family:product_families(nombre, slug)
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
