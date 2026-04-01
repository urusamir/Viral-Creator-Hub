import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const userId = "d05ee0e0-4ecc-4712-baaf-77bd107c7ea1"; // Let's try inserting with a random UUID, since we might need a valid user ID.
  console.log("Testing insert into saved_creators...");
  
  // Actually, we should try selecting first
  const { data: users, error: userError } = await supabase.auth.admin?.listUsers() || await supabase.from('profiles').select('id').limit(1);
  const actualUserId = users?.[0]?.id || userId;
  
  console.log("Using user ID:", actualUserId);

  const { data, error } = await supabase.from("saved_creators").insert({
    user_id: actualUserId,
    creator_username: "test_creator_remove_me",
    creator_name: "Test Creator",
    platform: "instagram",
    followers: 1000,
  }).select();

  console.log("Insert result:", { data, error });

  if (!error) {
    console.log("Testing delete...");
    const { data: delData, error: delError } = await supabase
      .from("saved_creators")
      .delete()
      .eq("user_id", actualUserId)
      .eq("creator_username", "test_creator_remove_me")
      .select();

    console.log("Delete result:", { delData, delError });
  }

  console.log("Testing calendar_slots insert...");
  const { data: calData, error: calError } = await supabase.from("calendar_slots").insert({
    user_id: actualUserId,
    title: "Test Slot",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 3600000).toISOString(),
  }).select();

  console.log("Calendar insert result:", { calData, calError });
}

test();
