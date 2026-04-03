const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://liesympjqygmzestgfoa.supabase.co', 'sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo');
async function check() {
  const { data, error } = await supabase.from('saved_creators').select('*').order('saved_at', { ascending: false }).limit(20);
  console.log("Recent saves length:", data ? data.length : error);
  console.log("Recent saves:", JSON.stringify(data, null, 2));
}
check();
