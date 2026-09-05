import { createClient } from '@supabase/supabase-js';
import { ENV } from './env';

// Initialize the Supabase client using ONLY public anonymous credentials.
// The secret service-role key is NEVER included in client-side code.
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
