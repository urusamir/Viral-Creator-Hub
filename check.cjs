const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: users, error: err1 } = await supabase.from('users').select('*').eq('email', 'msamir5230@gmail.com');
  const { data: profiles, error: err2 } = await supabase.from('profiles').select('*').eq('email', 'msamir5230@gmail.com');
  console.log('users count:', users?.length, users);
  console.log('profiles count:', profiles?.length, profiles);
  if (profiles && profiles.length > 0) {
    const { data: saved, error: err3 } = await supabase.from('saved_creators').select('*').eq('user_id', profiles[0].id);
    console.log('saved_creators count:', saved?.length, saved);
  }
}
run();
