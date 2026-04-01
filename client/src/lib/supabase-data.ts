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

    const { error } = await supabase.from("calendar_slots").update(dbUpdates).eq("id", id);

    if (error) {
      toast({ title: "Sync Error", description: error.message, variant: "destructive" });
      return false;
    }
    setTimeout(() => window.dispatchEvent(new Event("vairal-calendar-updated")), 400);
    return true;
  } catch {
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

    if (error) {
      return [];
    }
    return data.map((d: any) => d.creator_username);
  } catch (err) {
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
    const { error } = await supabase.from("saved_creators").insert({
      user_id: userId,
      creator_username: creator.username,
      creator_name: creator.fullname,
      platform: creator.platform,
      followers: creator.followers || 0,
      engagement_rate: creator.er || 0,
      categories: creator.categories || [],
    });

    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return false;
    }
    setTimeout(() => window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "save", username: creator.username }})), 400);
    return true;
  } catch (err) {
    return false;
  }
}

export async function unsaveCreator(userId: string, username: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("saved_creators")
      .delete()
      .eq("user_id", userId)
      .eq("creator_username", username);

    if (error) {
      toast({ title: "Unsave Failed", description: error.message, variant: "destructive" });
      return false;
    }
    setTimeout(() => window.dispatchEvent(new CustomEvent("vairal-creators-updated", { detail: { type: "unsave", username }})), 400);
    return true;
  } catch {
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
