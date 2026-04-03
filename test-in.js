import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: lists } = await supabase.from('creator_lists').select('*');
  console.log("Lists:", lists);
  
  if (!lists || lists.length === 0) return;
  const listIds = lists.map(l => l.id);
  
  console.log("List IDs:", listIds);
  
  const { data: members, error } = await supabase.from('creator_list_members').select('list_id').in('list_id', listIds);
  
  console.log("Members with .in:", members, "Error:", error);
}

check();
