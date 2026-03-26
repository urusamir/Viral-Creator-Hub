/**
 * Supabase data layer for all feature tables.
 * All writes are tagged with the authenticated user's ID from Supabase Auth.
 * Uses getUser() (server-validated) instead of getSession() (cached) to
 * prevent stale-session bugs where data gets saved under the wrong account.
 */
import { supabase } from "./supabase";
import type { CalendarSlot } from "./calendar-slots";

// ─── Auth helper ─────────────────────────────────────────────────
// removed getUserId

// ═══════════════════════════════════════════════════════════════════
// CALENDAR SLOTS
// ═══════════════════════════════════════════════════════════════════
export async function fetchCalendarSlots(userId: string): Promise<CalendarSlot[]> {
  try {
    console.log(`[Supabase] Fetching calendar slots for user: ${userId}`);

    const { data, error } = await supabase
      .from("calendar_slots")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: true });

    if (error) {
      console.error("[Supabase] Error fetching calendar slots:", error);
      return [];
    }

    console.log(`[Supabase] Fetched ${(data || []).length} calendar slots`);

    // Map DB rows to CalendarSlot type
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
  } catch (e: any) {
    console.error("[Supabase] ❌ fetchCalendarSlots FAILED:", e?.message || e);
    return [];
  }
}

export async function createCalendarSlot(
  slot: Omit<CalendarSlot, "id">,
  userId: string
): Promise<CalendarSlot | null> {
  try {
    console.log(`[Supabase] ✅ Creating calendar slot for user: ${userId}`);

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
        fee: parseFloat(slot.fee) || 0,
        campaign: slot.campaign,
        notes: slot.notes,
        payment_status: slot.paymentStatus || "pending",
        receipt_data: slot.receiptData || null,
      })
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating calendar slot:", error);
      return null;
    }

    console.log(`[Supabase] ✅ Calendar slot created: ${data.id}`);

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
    console.error("[Supabase] ❌ createCalendarSlot FAILED:", e?.message || e);
    return null;
  }
}

export async function updateCalendarSlot(
  id: string,
  updates: Partial<CalendarSlot>
): Promise<boolean> {
  const dbUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.influencerName !== undefined)
    dbUpdates.influencer_name = updates.influencerName;
  if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
  if (updates.contentType !== undefined)
    dbUpdates.content_type = updates.contentType;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
  if (updates.fee !== undefined)
    dbUpdates.fee = parseFloat(updates.fee) || 0;
  if (updates.campaign !== undefined) dbUpdates.campaign = updates.campaign;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.paymentStatus !== undefined)
    dbUpdates.payment_status = updates.paymentStatus;
  if (updates.receiptData !== undefined)
    dbUpdates.receipt_data = updates.receiptData;

  const { error } = await supabase
    .from("calendar_slots")
    .update(dbUpdates)
    .eq("id", id);

  if (error) {
    console.error("[Supabase] Error updating calendar slot:", error);
    return false;
  }
  console.log(`[Supabase] ✅ Calendar slot updated: ${id}`);
  return true;
}

export async function deleteCalendarSlot(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("calendar_slots")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[Supabase] Error deleting calendar slot:", error);
    return false;
  }
  console.log(`[Supabase] ✅ Calendar slot deleted: ${id}`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════
import type { Campaign } from "./campaigns";

export async function createCampaignInSupabase(
  campaign: Campaign,
  userId: string
): Promise<boolean> {
  try {
    console.log(`[Supabase] Creating campaign "${campaign.name}" for user: ${userId}`);

    const { error } = await supabase.from("campaigns").insert({
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
      notes: campaign.notes,
      campaign_type: campaign.campaignType,
      audience_age_ranges: campaign.audienceAgeRanges,
      audience_interests: campaign.audienceInterests,
      audience_gender: campaign.audienceGender,
      tone: campaign.tone,
      competitor_exclusivity: campaign.competitorExclusivity,
      exclusivity_category: campaign.exclusivityCategory,
      exclusivity_duration: campaign.exclusivityDuration,
      total_budget: campaign.totalBudget,
      currency: campaign.currency,
      payment_model: campaign.paymentModel,
      budget_per_creator: campaign.budgetPerCreator,
      payment_timing: campaign.paymentTiming,
      status: campaign.status,
    });

    if (error) {
      console.error("[Supabase] Error creating campaign:", error);
      return false;
    }
    console.log(`[Supabase] ✅ Campaign created: ${campaign.id}`);
    return true;
  } catch (e) {
    console.error("[Supabase] Error creating campaign:", e);
    return false;
  }
}

export async function updateCampaignInSupabase(
  id: string,
  updates: Partial<Campaign>
): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.product !== undefined) dbUpdates.product = updates.product;
    if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
    if (updates.countries !== undefined) dbUpdates.countries = updates.countries;
    if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;
    if (updates.startDate !== undefined)
      dbUpdates.start_date = updates.startDate || null;
    if (updates.endDate !== undefined)
      dbUpdates.end_date = updates.endDate || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.campaignType !== undefined)
      dbUpdates.campaign_type = updates.campaignType;
    if (updates.audienceAgeRanges !== undefined)
      dbUpdates.audience_age_ranges = updates.audienceAgeRanges;
    if (updates.audienceInterests !== undefined)
      dbUpdates.audience_interests = updates.audienceInterests;
    if (updates.audienceGender !== undefined)
      dbUpdates.audience_gender = updates.audienceGender;
    if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
    if (updates.competitorExclusivity !== undefined)
      dbUpdates.competitor_exclusivity = updates.competitorExclusivity;
    if (updates.exclusivityCategory !== undefined)
      dbUpdates.exclusivity_category = updates.exclusivityCategory;
    if (updates.exclusivityDuration !== undefined)
      dbUpdates.exclusivity_duration = updates.exclusivityDuration;
    if (updates.totalBudget !== undefined)
      dbUpdates.total_budget = updates.totalBudget;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.paymentModel !== undefined)
      dbUpdates.payment_model = updates.paymentModel;
    if (updates.budgetPerCreator !== undefined)
      dbUpdates.budget_per_creator = updates.budgetPerCreator;
    if (updates.paymentTiming !== undefined)
      dbUpdates.payment_timing = updates.paymentTiming;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from("campaigns")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("[Supabase] Error updating campaign:", error);
      return false;
    }
    console.log(`[Supabase] ✅ Campaign updated: ${id}`);
    return true;
  } catch (e) {
    console.error("[Supabase] Error updating campaign:", e);
    return false;
  }
}
