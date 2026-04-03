const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envLocal = fs.readFileSync('.env', 'utf8');
const urlMatch = envLocal.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envLocal.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) throw new Error("Missing env");

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function test() {
  const { data, error } = await supabase
    .from("saved_creators")
    .select("*")
    .limit(1);
    
  console.log("Saved creators shape:", data ? data : error);
  
  if (data && data.length > 0) {
     console.log("Columns:", Object.keys(data[0]));
  }
}
test();
