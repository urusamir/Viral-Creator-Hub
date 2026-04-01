const { createClient } = require('@supabase/supabase-js');

async function check() {
  require('dotenv').config();
  const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  const userId = '8ddd1cd5-a638-442f-bd56-d33d9411adb4';
  const username = 'zylkcr';
  
  console.log("Trying to delete:", username, userId);
  const { data, error } = await client
      .from("saved_creators")
      .delete()
      .match({ user_id: userId, creator_username: username })
      .select();
      
  console.log("Result:", data, error);
}

check();
