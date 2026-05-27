import { supabase } from './supabase';

export async function fetchProducts() {
  if (!supabase) return [];
  const { data } = await supabase
    .from('products')
    .select(`*, subfamily:product_subfamilies(nombre, slug, family:product_families(nombre, slug))`)
    .eq('activo', true)
    .order('destacado', { ascending: false });
  return data || [];
}

export async function fetchProductWithCare(productId) {
  if (!supabase) return null;
  const { data } = await supabase
    .from('products')
    .select(`*, plant_care(*), subfamily:product_subfamilies(nombre, family:product_families(nombre))`)
    .eq('id', productId)
    .single();
  return data;
}

export async function fetchEvents() {
  if (!supabase) return [];
  const { data } = await supabase
    .from('events').select('*').eq('activo', true).order('fecha');
  return data || [];
}

export async function fetchOrders(customerId) {
  if (!supabase || !customerId) return [];
  const { data } = await supabase
    .from('ordenes').select('*').eq('customer_id', customerId).order('created_at', { ascending: false });
  return data || [];
}

export async function fetchLoyaltyTransactions(customerId) {
  if (!supabase || !customerId) return [];
  const { data } = await supabase
    .from('loyalty_transactions').select('*').eq('customer_id', customerId)
    .order('created_at', { ascending: false }).limit(10);
  return data || [];
}

export async function fetchAffiliateLink(customerId) {
  if (!supabase || !customerId) return null;
  const { data } = await supabase
    .from('affiliate_links').select('*').eq('customer_id', customerId).single();
  return data;
}
