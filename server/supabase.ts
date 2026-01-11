import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    "⚠️ Supabase credentials not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.",
  );
}

// Service role client (for backend operations - has admin privileges)
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

export async function getSupabaseClient() {
  return supabase;
}
