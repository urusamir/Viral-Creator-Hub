import { createClient } from "@supabase/supabase-js";

// Make sure to use the correct credentials
const supabaseUrl = "https://liesympjqygmzestgfoa.supabase.co";
const supabaseAnonKey = "sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
  // Check the currently saved creators
  const { data, error } = await supabase.from('saved_creators').select('*');
  console.log("Existing Data:", data);
  if (error) console.error("Error fetching:", error);

  // Try to insert one
  const insertAttempt = await supabase.from("saved_creators").insert({
    user_id: "2d4b29a1-6ca6-4ee7-9ed2-2dc454f842b4",
    creator_username: "test_creator",
    creator_name: "Test Creator",
    platform: "Instagram",
    followers: 1000,
    engagement_rate: 2.5,
    categories: ["Comedy"]
  }).select();

  console.log("Insert result:", insertAttempt.data);
  if (insertAttempt.error) {
    console.error("Insert Error:", insertAttempt.error);
  }
}

check();
