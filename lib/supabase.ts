import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side Supabase client for admin operations
export const createServerClient = (token?: string) => {
  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    },
  });
};
