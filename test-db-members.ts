import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://liesympjqygmzestgfoa.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo";
const supabase = createClient(supabaseUrl, supabaseKey);
async function test() {
  const { data, error } = await supabase.from('creator_list_members').select('*').limit(1);
  console.log("Members:", data, error);
}
test();
