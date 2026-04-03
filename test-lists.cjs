const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://liesympjqygmzestgfoa.supabase.co",
  "sb_publishable_AMxm5Uy0-sxqCuv5Ir6GqA_qV72JpVo"
);

async function test() {
  console.log("Testing fetchLists...");
  
  // Just test a user ID that might exist or get all lists
  const { data: lists, error: listErr } = await supabase.from("creator_lists").select("*").limit(5);
  console.log("Lists:", lists);
  if (listErr) console.error("List Error:", listErr);

  const { data: members, error: memErr } = await supabase.from("creator_list_members").select("*").limit(5);
  console.log("Members:", members);
  if (memErr) console.error("Member Error:", memErr);
}

test();
