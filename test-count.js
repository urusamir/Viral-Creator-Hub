const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: 'client/.env.local' });
dotenv.config({ path: 'client/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: lists, error } = await supabase
    .from("creator_lists")
    .select("*, creator_list_members(count)");
  
  if (error) console.error("Error:", error);
  else console.log("Lists with counts:", JSON.stringify(lists, null, 2));

  // Let's also check the .in approach
  const listIds = lists.map(l => l.id);
  const { data: members, error: memErr } = await supabase
    .from("creator_list_members")
    .select("list_id")
    .in("list_id", listIds);

  if (memErr) console.error("MemErr:", memErr);
  else console.log("Members length:", members.length);
}
test();
