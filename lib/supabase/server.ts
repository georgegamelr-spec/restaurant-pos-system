/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient(supabaseUrl, supabaseKey);
}

// Lazy proxy: safe at build time, creates client on first real use
export const supabase = new Proxy({} as any, {
  get(_target: any, prop: string | symbol) {
    const client = getSupabaseClient();
    return (client as any)[prop];
  },
});

export { getSupabaseClient as createClient };
