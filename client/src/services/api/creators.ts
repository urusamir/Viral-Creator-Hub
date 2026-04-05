import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";

export async function fetchSavedCreators(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("saved_creators")
      .select("creator_username")
      .eq("user_id", userId);

    if (error) {
      console.error("[fetchSavedCreators] Error:", error.message);
      return [];
    }
    return data.map((d: { creator_username: string }) => d.creator_username);
  } catch (err: unknown) {
    console.error("[fetchSavedCreators] Exception:", err instanceof Error ? err.message : err);
    return [];
  }
}

export async function saveCreator(
  userId: string,
  creator: {
    username: string;
    fullname: string;
    platform: string;
    followers?: number;
    er?: number;
    categories?: string[];
  }
): Promise<boolean> {
  try {
    const { data, error } = await supabase.from("saved_creators").insert({
      user_id: userId,
      creator_username: creator.username,
      creator_name: creator.fullname,
      platform: creator.platform,
      followers: creator.followers || 0,
      engagement_rate: creator.er || 0,
      categories: creator.categories || [],
    }).select();

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already Saved", description: `${creator.fullname} is already in your saved creators.` });
        return true; 
      }
      console.error("[saveCreator] Supabase error:", error.code, error.message, error.details, error.hint);
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return false;
    }

    if (!data || data.length === 0) {
      console.warn("[saveCreator] Insert returned no data — possible SELECT RLS block or silent drop. Proceeding carefully.");
      // We will assume success if error was null!
    }

    window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "save", username: creator.username }}));
    return true;
  } catch (err: unknown) {
    console.error("[saveCreator] Exception:", err);
    const message = err instanceof Error ? err.message : "Unexpected error saving creator.";
    toast({ title: "Save Error", description: message, variant: "destructive" });
    return false;
  }
}

export async function unsaveCreator(userId: string, username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("saved_creators")
      .delete()
      .eq("user_id", userId)
      .eq("creator_username", username)
      .select();

    if (error) {
      console.error("[unsaveCreator] Supabase error:", error.code, error.message);
      toast({ title: "Unsave Failed", description: error.message, variant: "destructive" });
      return false;
    }

    if (!data || data.length === 0) {
      const { data: data2, error: error2 } = await supabase
        .from("saved_creators")
        .delete()
        .eq("user_id", userId)
        .ilike("creator_username", username)
        .select();

      if (error2) {
        console.error("[unsaveCreator] Fallback error:", error2.message);
      }
    }

    window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "unsave", username }}));
    return true;
  } catch (err: unknown) {
    console.error("[unsaveCreator] Exception:", err);
    return false;
  }
}
