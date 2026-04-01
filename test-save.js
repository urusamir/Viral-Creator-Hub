require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const userId = '8ddd1cd5-a638-442f-bd56-d33d9411adb4'; // msamir5230's profile ID
  // Try inserting
  const { error } = await supabase.from('saved_creators').insert({
    user_id: userId,
    creator_username: 'playwright_test',
    creator_name: 'Playwright',
    platform: 'Instagram',
    followers: 123,
    engagement_rate: 1,
    categories: []
  });
  console.log('Insert error:', error);
}
run();
