import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.VITE_SUPABASE_URL as string;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const userId = "d5c64c1c-913a-44af-8800-410a5638c11e"; // Just assuming standard uuid syntax or auth.users? Wait, let's select a random user
  console.log("Checking saved_creators...");
  const { data: rows } = await supabase.from("saved_creators").select("*");
  console.log("Rows:", rows);
  
  if (rows && rows.length > 0) {
    console.log("Attempting to delete row id:", rows[0].id);
    const { data: delData, error: delErr } = await supabase
      .from("saved_creators")
      .delete()
      .eq("user_id", rows[0].user_id)
      .eq("creator_username", rows[0].creator_username)
      .select();
    
    console.log("Delete result:", delData, delErr);
    
    const { data: rowsAfter } = await supabase.from("saved_creators").select("*");
    console.log("Rows after:", rowsAfter);
  }
}

check();
