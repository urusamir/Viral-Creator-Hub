const { createClient } = require('@supabase/supabase-js');

const url = 'https://liesympjqygmzestgfoa.supabase.co';
const key = 'sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo';
const supabase = createClient(url, key);

async function check() {
  console.log("Checking saved_creators...");
  const { data, error } = await supabase.from('saved_creators').select('*').limit(5);
  console.log("Existing saved rows:", data?.length, error);

  // Find a valid user profile
  const { data: users, error: userError } = await supabase.from('profiles').select('*').limit(1);
  if (!users || users.length === 0) {
    console.log("No users found to test with");
    return;
  }
  const userId = users[0].id;

  console.log("Testing insert with user_id:", userId);
  const testUsername = "debug_test_creator_" + Date.now();
  const { data: inserted, error: insertError } = await supabase.from('saved_creators').insert({
    user_id: userId,
    creator_username: testUsername,
    creator_name: "Test Creator",
    platform: "Instagram",
    followers: 1000,
    engagement_rate: 2.5,
    categories: ["Fashion"]
  }).select();

  console.log("Insert result:", inserted, insertError?.message || insertError);

  if (!insertError) {
    console.log("Testing delete...");
    const { data: deleted, error: deleteError } = await supabase.from('saved_creators').delete().eq('user_id', userId).eq('creator_username', testUsername).select();
    console.log("Delete result:", deleted, deleteError?.message || deleteError);
  }
}

check();
