const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const env = fs.readFileSync('client/.env.local', 'utf8');
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);
const supabase = createClient(urlMatch[1], keyMatch[1]);

async function run() {
  console.log("Checking profiles table anon read access...");
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Error:", error);
  console.log("Data:", data);
}
run();
