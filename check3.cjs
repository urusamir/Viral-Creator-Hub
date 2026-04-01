const { createClient } = require('@supabase/supabase-js');


const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseAnonKey) {
  console.log("no creds");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const email = `testuser_${Date.now()}@example.com`;
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email,
    password: 'testing123'
  });
  if (authErr) {
    console.error("Auth err:", authErr);
    return;
  }
  
  const userId = authData.user.id;
  console.log("Logged in user:", userId);
  
  const { data, error } = await supabase.from('saved_creators').insert({
    user_id: userId,
    creator_username: "tester123",
    creator_name: "Tester",
    platform: "Instagram",
    followers: 1234,
    engagement_rate: 1.5,
    categories: []
  }).select();

  if (error) {
    console.error("Insert err directly:", error);
  } else {
    console.log("Insert ok directly:", data);
  }

  const { data: calData, error: calErr } = await supabase.from('calendar_slots').insert({
    user_id: userId,
    date: '2026-05-01',
    influencer_name: 'Tester2',
    platform: 'Instagram',
    content_type: 'Reel',
    status: 'Pending',
    currency: 'USD',
    fee: 100,
    campaign: 'Test',
    notes: 'none',
    payment_status: 'pending'
  }).select();

  if (calErr) {
    console.error("Calendar insert err:", calErr);
  } else {
    console.log("Calendar insert ok:", calData);
  }
}
test();
