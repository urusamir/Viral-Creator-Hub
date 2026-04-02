import { createClient } from "@supabase/supabase-js";

// Make sure to use the correct credentials
const supabaseUrl = "https://liesympjqygmzestgfoa.supabase.co";
const supabaseAnonKey = "sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data, error } = await supabase.from('profiles').select('*').eq('is_admin', true);
  console.log("Profiles Data:", data);
  if (error) console.error("Error fetching profiles:", error);
}

check();
