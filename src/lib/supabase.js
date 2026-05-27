import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://vmqhxyclcrofiphdriub.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('[Supabase] URL:', SUPABASE_URL);
console.log('[Supabase] Anon key present:', !!SUPABASE_ANON_KEY);

if (!SUPABASE_ANON_KEY) {
  console.error('[Supabase] VITE_SUPABASE_ANON_KEY is not set — auth will not work. Add it to Vercel env vars.');
}

// Supabase v2 throws if key is missing/empty, so only create client when key exists
export const supabase = SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
