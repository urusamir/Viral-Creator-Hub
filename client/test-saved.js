import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
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

  // Get RLS status
  const { data: authData } = await supabase.auth.signUp({
     email: 'test' + Math.random() + '@test.com',
     password: 'password123'
  });
  
  if (authData?.user) {
    console.log("Got user", authData.user.id);
    const { data: insData, error: insErr } = await supabase.from("saved_creators").insert({
      user_id: authData.user.id,
      creator_username: 'testuser',
      creator_name: 'test',
      platform: 'YouTube'
    }).select();
    console.log("Insert result:", insData || insErr);
  } else {
    console.log("Could not create test auth user");
  }
}
test();
