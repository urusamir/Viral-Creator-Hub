import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://liesympjqygmzestgfoa.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo';

if(!supabaseUrl || !supabaseAnonKey) {
  console.log("No auth keys");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('*');
  console.log("PROFILES:", profiles, pErr);

  const { data: lists, error: lErr } = await supabase.from('creator_lists').select('*');
  console.log("LISTS:", lists, lErr);
}
check();
