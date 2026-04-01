import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRows() {
  const { data: cal, error: calErr } = await supabase.from("calendar_slots").select("*");
  console.log("calendar_slots row count:", cal?.length, "error:", calErr);
  if (cal && cal.length > 0) {
    console.log("Sample slots:", cal.slice(0, 2));
  }

  const { data: sv, error: svErr } = await supabase.from("saved_creators").select("*");
  console.log("saved_creators row count:", sv?.length, "error:", svErr);
}

checkRows();
