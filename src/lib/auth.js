import { supabase } from './supabase';

export async function signInWithGoogle() {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://selvagarden.vercel.app',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) {
    console.error('Google auth error:', error.message);
    throw error;
  }
}

export async function signUpWithEmail(nombre, email, telefono, password) {
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: nombre } },
  });
  if (error) throw error;

  const user = data.user;

  const { data: customer, error: custError } = await supabase
    .from('customers')
    .insert({ auth_id: user.id, nombre, email, telefono })
    .select()
    .single();

  if (custError) throw custError;

  return { customer, needsConfirmation: !data.session };
}

export async function signInWithEmail(email, password) {
  if (!supabase) throw new Error('Supabase not configured');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  // onAuthStateChange in App.jsx handles the rest
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getOrCreateCustomer(user) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: existing } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (existing) return { customer: existing, isNew: false };

  const { error: insertError } = await supabase
    .from('customers')
    .insert({
      auth_id: user.id,
      nombre: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente',
      email: user.email,
    });

  if (insertError) throw insertError;

  const { data: newCustomer, error: selectError } = await supabase
    .from('customers')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (selectError) throw selectError;

  await supabase.from('affiliate_links').insert({
    customer_id: newCustomer.id,
    codigo: newCustomer.numero_socio,
    tipo: 'cliente',
  });

  return { customer: newCustomer, isNew: true };
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
