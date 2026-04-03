import { supabase } from './client/src/lib/supabase.ts';

async function test() {
  console.log("Fetching lists...");
  const { data: lists, error: listErr } = await supabase.from('creator_lists').select('*').limit(5);
  console.log("Lists count:", lists?.length, listErr);

  if (lists && lists.length > 0) {
    const listIds = lists.map(l => l.id);
    console.log("List IDs:", listIds);
    const { data: members, error: memErr } = await supabase.from('creator_list_members').select('list_id').in('list_id', listIds);
    console.log("Members:", members?.length, "Error:", memErr);
  }
}
test();
