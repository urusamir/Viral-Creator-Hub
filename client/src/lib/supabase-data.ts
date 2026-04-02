/**
 * Supabase data layer — single source of truth for all features.
 * No localStorage, no debug logs, no getSession() calls.
 * Simple: write to Supabase, read from Supabase.
 */
import { supabase } from "./supabase";
import type { CalendarSlot } from "./calendar-slots";
import { toast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════
// CALENDAR SLOTS
// ═══════════════════════════════════════════════════════════════════

export async function fetchCalendarSlots(userId: string): Promise<CalendarSlot[]> {
  try {
    const { data, error } = await supabase
      .from("calendar_slots")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      date: row.date,
      influencerName: row.influencer_name,
      platform: row.platform || "",
      contentType: row.content_type || "",
      status: row.status as CalendarSlot["status"],
      currency: row.currency || "USD",
      fee: String(row.fee || 0),
      campaign: row.campaign || "",
      notes: row.notes || "",
      paymentStatus: row.payment_status || "pending",
      receiptData: row.receipt_data || null,
    }));
  } catch {
    return [];
  }
}

export async function createCalendarSlot(
  slot: Omit<CalendarSlot, "id">,
  userId: string
): Promise<CalendarSlot | null> {
  try {
    const { data, error } = await supabase
      .from("calendar_slots")
      .insert({
        user_id: userId,
        date: slot.date,
        influencer_name: slot.influencerName,
        platform: slot.platform,
        content_type: slot.contentType,
        status: slot.status,
        currency: slot.currency,
        fee: parseFloat(String(slot.fee).replace(/[^0-9.]/g, "")) || 0,
        campaign: slot.campaign,
        notes: slot.notes,
        payment_status: slot.paymentStatus || "pending",
        receipt_data: slot.receiptData || null,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return null;
    }

    toast({ title: "Slot Saved", description: "Calendar slot saved to database." });
    setTimeout(() => window.dispatchEvent(new Event("vairal-calendar-updated")), 400);

    return {
      id: data.id,
      date: data.date,
      influencerName: data.influencer_name,
      platform: data.platform || "",
      contentType: data.content_type || "",
      status: data.status as CalendarSlot["status"],
      currency: data.currency || "USD",
      fee: String(data.fee || 0),
      campaign: data.campaign || "",
      notes: data.notes || "",
      paymentStatus: data.payment_status || "pending",
      receiptData: data.receipt_data || null,
    };
  } catch (e: any) {
    toast({ title: "Connection Error", description: e?.message || "Could not reach database.", variant: "destructive" });
    return null;
  }
}

export async function updateCalendarSlot(
  id: string,
  updates: Partial<CalendarSlot>
): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.influencerName !== undefined) dbUpdates.influencer_name = updates.influencerName;
    if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
    if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.fee !== undefined) dbUpdates.fee = parseFloat(String(updates.fee).replace(/[^0-9.]/g, "")) || 0;
    if (updates.campaign !== undefined) dbUpdates.campaign = updates.campaign;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
    if (updates.receiptData !== undefined) dbUpdates.receipt_data = updates.receiptData;

    const { data, error } = await supabase.from("calendar_slots").update(dbUpdates).eq("id", id).select();

    if (error) {
      console.error("[updateCalendarSlot] Supabase error:", error.code, error.message, error.details);
      toast({ title: "Sync Error", description: error.message, variant: "destructive" });
      return false;
    }

    if (!data || data.length === 0) {
      console.error("[updateCalendarSlot] Update returned no rows — slot may not exist or RLS blocked");
      toast({ title: "Sync Error", description: "Could not verify update. Row not found.", variant: "destructive" });
      return false;
    }

    // Show success toast for payment status changes
    if (updates.paymentStatus === "completed") {
      toast({ title: "Payment Recorded", description: "Payment marked as completed and saved to database." });
    }

    setTimeout(() => window.dispatchEvent(new Event("vairal-calendar-updated")), 400);
    return true;
  } catch (err: any) {
    console.error("[updateCalendarSlot] Exception:", err);
    toast({ title: "Update Error", description: err?.message || "Unexpected error.", variant: "destructive" });
    return false;
  }
}

export async function deleteCalendarSlot(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("calendar_slots").delete().eq("id", id);

    if (error) {
      toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
      return false;
    }
    setTimeout(() => window.dispatchEvent(new Event("vairal-calendar-updated")), 400);
    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// SAVED CREATORS
// ═══════════════════════════════════════════════════════════════════

export async function fetchSavedCreators(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from("saved_creators")
      .select("creator_username")
      .eq("user_id", userId);

    console.log("[fetchSavedCreators] userId:", userId, "data:", data, "error:", error);

    if (error) {
      console.error("[fetchSavedCreators] Error:", error.message);
      return [];
    }
    return data.map((d: any) => d.creator_username);
  } catch (err: any) {
    console.error("[fetchSavedCreators] Exception:", err.message);
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
      // Handle duplicate gracefully — user already saved this creator
      if (error.code === "23505") {
        toast({ title: "Already Saved", description: `${creator.fullname} is already in your saved creators.` });
        return true; // Consider it a success — it's saved
      }
      console.error("[saveCreator] Supabase error:", error.code, error.message, error.details, error.hint);
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return false;
    }

    if (!data || data.length === 0) {
      console.error("[saveCreator] Insert returned no data — possible RLS block");
      toast({ title: "Save Failed", description: "Could not verify save. Check permissions.", variant: "destructive" });
      return false;
    }

    setTimeout(() => window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "save", username: creator.username }})), 400);
    return true;
  } catch (err: any) {
    console.error("[saveCreator] Exception:", err);
    toast({ title: "Save Error", description: err?.message || "Unexpected error saving creator.", variant: "destructive" });
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
      // Try case-insensitive match as fallback
      const { data: data2, error: error2 } = await supabase
        .from("saved_creators")
        .delete()
        .eq("user_id", userId)
        .ilike("creator_username", username)
        .select();

      if (error2) {
        console.error("[unsaveCreator] Fallback error:", error2.message);
      } else if (data2 && data2.length > 0) {
        console.log("[unsaveCreator] Deleted via case-insensitive match");
      } else {
        console.warn("[unsaveCreator] No matching row found for", { userId, username });
      }
    }

    setTimeout(() => window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "unsave", username }})), 400);
    return true;
  } catch (err: any) {
    console.error("[unsaveCreator] Exception:", err);
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════
import type { Campaign } from "./campaigns";

export async function fetchCampaigns(userId: string) {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      brand: row.brand || "",
      product: row.product || "",
      goal: row.goal || "",
      countries: row.countries || [],
      platforms: row.platforms || [],
      startDate: row.start_date || "",
      endDate: row.end_date || "",
      totalBudget: Number(row.total_budget) || 0,
      currency: row.currency || "USD",
      audienceAgeRanges: row.audience_age_ranges || [],
      keyMessages: row.key_messages || [],
      dos: row.dos || [],
      donts: row.donts || [],
      hashtags: row.hashtags || [],
      mentions: row.mentions || [],
      referenceLinks: row.reference_links || [],
      deliverables: row.deliverables || [],
      selectedCreators: row.selected_creators || [],
      status: row.status || "DRAFT",
      lastStep: row.last_step || 1,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function createCampaignInDb(campaign: any, userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        id: campaign.id,
        user_id: userId,
        name: campaign.name,
        brand: campaign.brand,
        product: campaign.product,
        goal: campaign.goal,
        countries: campaign.countries,
        platforms: campaign.platforms,
        start_date: campaign.startDate || null,
        end_date: campaign.endDate || null,
        total_budget: campaign.totalBudget,
        currency: campaign.currency,
        audience_age_ranges: campaign.audienceAgeRanges,
        key_messages: campaign.keyMessages,
        dos: campaign.dos,
        donts: campaign.donts,
        hashtags: campaign.hashtags,
        mentions: campaign.mentions,
        reference_links: campaign.referenceLinks,
        deliverables: campaign.deliverables,
        selected_creators: campaign.selectedCreators,
        status: campaign.status,
        last_step: campaign.lastStep,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Campaign Save Failed", description: error.message, variant: "destructive" });
      return null;
    }
    return data;
  } catch (e: any) {
    return null;
  }
}

export async function updateCampaignInDb(id: string, updatedFields: any): Promise<boolean> {
  try {
    const payload: any = {};
    if (updatedFields.name !== undefined) payload.name = updatedFields.name;
    if (updatedFields.brand !== undefined) payload.brand = updatedFields.brand;
    if (updatedFields.product !== undefined) payload.product = updatedFields.product;
    if (updatedFields.goal !== undefined) payload.goal = updatedFields.goal;
    if (updatedFields.countries !== undefined) payload.countries = updatedFields.countries;
    if (updatedFields.platforms !== undefined) payload.platforms = updatedFields.platforms;
    if (updatedFields.startDate !== undefined) payload.start_date = updatedFields.startDate || null;
    if (updatedFields.endDate !== undefined) payload.end_date = updatedFields.endDate || null;
    if (updatedFields.totalBudget !== undefined) payload.total_budget = updatedFields.totalBudget;
    if (updatedFields.currency !== undefined) payload.currency = updatedFields.currency;
    if (updatedFields.audienceAgeRanges !== undefined) payload.audience_age_ranges = updatedFields.audienceAgeRanges;
    if (updatedFields.keyMessages !== undefined) payload.key_messages = updatedFields.keyMessages;
    if (updatedFields.dos !== undefined) payload.dos = updatedFields.dos;
    if (updatedFields.donts !== undefined) payload.donts = updatedFields.donts;
    if (updatedFields.hashtags !== undefined) payload.hashtags = updatedFields.hashtags;
    if (updatedFields.mentions !== undefined) payload.mentions = updatedFields.mentions;
    if (updatedFields.referenceLinks !== undefined) payload.reference_links = updatedFields.referenceLinks;
    if (updatedFields.deliverables !== undefined) payload.deliverables = updatedFields.deliverables;
    if (updatedFields.selectedCreators !== undefined) payload.selected_creators = updatedFields.selectedCreators;
    if (updatedFields.status !== undefined) payload.status = updatedFields.status;
    if (updatedFields.lastStep !== undefined) payload.last_step = updatedFields.lastStep;

    const { error } = await supabase.from("campaigns").update(payload).eq("id", id);
    if (error) {
      toast({ title: "Campaign Update Failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  } catch (e: any) {
    return false;
  }
}

export async function deleteCampaignInDb(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) {
      toast({ title: "Campaign Delete Failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  } catch (e: any) {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════
// CREATOR LISTS
// ═══════════════════════════════════════════════════════════════════

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
    const { data, error } = await supabase
      .from("creator_lists")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Load Error", description: error.message, variant: "destructive" });
      return [];
    }

    const lists = data || [];

    // Fetch member counts for each list
    const { data: members, error: memberErr } = await supabase
      .from("creator_list_members")
      .select("list_id");

    if (!memberErr && members) {
      const counts: Record<string, number> = {};
      members.forEach((m: any) => { counts[m.list_id] = (counts[m.list_id] || 0) + 1; });
      lists.forEach((l: any) => { l.member_count = counts[l.id] || 0; });
    }

    return lists;
  } catch {
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
      toast({ title: "Create List Failed", description: error.message, variant: "destructive" });
      return null;
    }

    toast({ title: "List Created", description: `"${name}" has been created.` });
    setTimeout(() => window.dispatchEvent(new Event("vairal-lists-updated")), 400);
    return data;
  } catch {
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
    setTimeout(() => window.dispatchEvent(new Event("vairal-lists-updated")), 400);
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
    setTimeout(() => window.dispatchEvent(new Event("vairal-lists-updated")), 400);
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
    return true;
  } catch {
    return false;
  }
}
