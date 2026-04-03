const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, val] = line.split('=');
  if (key && val) env[key] = val;
});
const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);
async function check() {
  const { data: camps, error: err1 } = await supabase.from('campaigns').select('*').limit(1);
  const { data: lists, error: err2 } = await supabase.from('creator_lists').select('*').limit(1);
  const { data: slots, error: err3 } = await supabase.from('calendar_slots').select('*').limit(1);
  console.log('err1', err1);
  console.log('err2', err2);
  console.log('err3', err3);
}
check();
