import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";

export interface CreatorList {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
}

export interface CreatorListMember {
  id: string;
  list_id: string;
  creator_username: string;
  added_at: string;
}

export async function fetchLists(userId: string): Promise<CreatorList[]> {
  try {
    const { data: listsData, error } = await supabase
      .from("creator_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
      return [];
    }

    const lists = listsData || [];
    if (lists.length === 0) return lists;

    const listIds = lists.map((l: any) => l.id);

    // Fetch member counts only for this user's current lists!
    const { data: members, error: memberErr } = await supabase
      .from("creator_list_members")
      .select("list_id")
      .in("list_id", listIds);

    if (memberErr) {
      console.error("[fetchLists] member count error:", memberErr);
      lists.forEach((l: any) => { l.member_count = 0; });
    } else {
      const counts: Record<string, number> = {};
      (members || []).forEach((m: any) => { counts[m.list_id] = (counts[m.list_id] || 0) + 1; });
      lists.forEach((l: any) => { l.member_count = counts[l.id] || 0; });
    }

    return lists;
  } catch (err: any) {
    console.error("[fetchLists] Exception:", err.message);
    return [];
  }
}

export async function createList(userId: string, name: string): Promise<CreatorList | null> {
  try {
    const { data, error } = await supabase
      .from("creator_lists")
      .insert({ user_id: userId, name })
      .select()
      .single();

    if (error) {
      console.error("[createList] Error:", error);
      toast({ title: "Create List Failed", description: error.message, variant: "destructive" });
      return null;
    }

    toast({ title: "List Created", description: `"${name}" has been created.` });
    window.dispatchEvent(new Event("vairal-lists-updated"));
    return data;
  } catch (err: any) {
    console.error("[createList] Exception:", err.message);
    return null;
  }
}

export async function deleteList(listId: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("creator_lists").delete().eq("id", listId);
    if (error) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
      return false;
    }
    window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  } catch {
    return false;
  }
}

export async function renameList(listId: string, newName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("creator_lists")
      .update({ name: newName, updated_at: new Date().toISOString() })
      .eq("id", listId);

    if (error) {
      toast({ title: "Rename Failed", description: error.message, variant: "destructive" });
      return false;
    }
    window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  } catch {
    return false;
  }
}

export async function fetchListMembers(listId: string): Promise<CreatorListMember[]> {
  try {
    const { data, error } = await supabase
      .from("creator_list_members")
      .select("*")
      .eq("list_id", listId)
      .order("added_at", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

export async function addCreatorToList(listId: string, creatorUsername: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("creator_list_members")
      .insert({ list_id: listId, creator_username: creatorUsername });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already in List", description: "This creator is already in the list.", variant: "destructive" });
      } else {
        toast({ title: "Add Failed", description: error.message, variant: "destructive" });
      }
      return false;
    }
    
    // KEY FIX: Dispatch lists updated to force Lists/Discover array refresh
    toast({ title: "Creator Added", description: `Added to list successfully.` });
    window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  } catch {
    return false;
  }
}

export async function removeCreatorFromList(listId: string, creatorUsername: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("creator_list_members")
      .delete()
      .eq("list_id", listId)
      .eq("creator_username", creatorUsername);

    if (error) {
      toast({ title: "Remove Failed", description: error.message, variant: "destructive" });
      return false;
    }
    
    // KEY FIX: Dispatch lists updated to force member count refresh
    window.dispatchEvent(new Event("vairal-lists-updated"));
    return true;
  } catch {
    return false;
  }
}
