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
  const { data: camps } = await supabase.from('campaigns').select('*').limit(1);
  const { data: lists } = await supabase.from('creator_lists').select('*').limit(1);
  const { data: slots } = await supabase.from('calendar_slots').select('*').limit(1);
  console.log('Camps columns:', camps && camps[0] ? Object.keys(camps[0]) : 'err or empty');
  console.log('Lists columns:', lists && lists[0] ? Object.keys(lists[0]) : 'err or empty');
  console.log('Slots columns:', slots && slots[0] ? Object.keys(slots[0]) : 'err or empty');
}
check();
