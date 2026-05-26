import { supabase } from './supabase';

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function getOrCreateCustomer(user) {
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (existing) return { customer: existing, isNew: false };

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      auth_id: user.id,
      nombre: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente',
      email: user.email,
    })
    .select()
    .single();

  if (error) throw error;

  const affiliateCode = customer.id.replace(/-/g, '').substring(0, 8);
  await supabase.from('affiliate_links').insert({
    customer_id: customer.id,
    codigo: affiliateCode,
    tipo: 'cliente',
  });

  return { customer, isNew: true };
}

export function nivelInfo(nivel = 'sin_nivel') {
  const map = {
    sin_nivel:  { label: 'Sin nivel',  emoji: '',   descuento: 0 },
    semilla:    { label: 'Semilla',    emoji: '🌱', descuento: 0 },
    versailles: { label: 'Versailles', emoji: '🥈', descuento: 10 },
    babilonia:  { label: 'Babilonia',  emoji: '🥇', descuento: 15 },
  };
  return map[nivel] || map.sin_nivel;
}
