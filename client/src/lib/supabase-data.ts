/**
 * Supabase data layer for all feature tables.
 * Replaces localStorage-based storage with Supabase persistence.
 */
import { supabase } from "./supabase";
import type { CalendarSlot } from "./calendar-slots";

// ─── Auth helper ─────────────────────────────────────────────────
async function getUserId(): Promise<string> {
  // Try getSession first (fast, cached)
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData.session?.user?.id) {
    return sessionData.session.user.id;
  }
  
  // Fallback: getUser() which validates the token from storage
  const { data: userData } = await supabase.auth.getUser();
  if (userData.user?.id) {
    return userData.user.id;
  }
  
  console.warn("Supabase: No authenticated user found. Data will only be saved locally.");
  throw new Error("Not authenticated");
}

// ═══════════════════════════════════════════════════════════════════
// CALENDAR SLOTS
// ═══════════════════════════════════════════════════════════════════
export async function fetchCalendarSlots(): Promise<CalendarSlot[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("calendar_slots")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching calendar slots:", error);
    return [];
  }

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
}

export async function createCalendarSlot(slot: Omit<CalendarSlot, "id">): Promise<CalendarSlot | null> {
  console.log("[Supabase] createCalendarSlot called");
  const userId = await getUserId();
  console.log("[Supabase] createCalendarSlot userId:", userId);
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
    console.error("Error creating calendar slot:", error);
    return null;
  }

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
}

export async function updateCalendarSlot(id: string, updates: Partial<CalendarSlot>): Promise<boolean> {
  const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };

  if (updates.date !== undefined) dbUpdates.date = updates.date;
  if (updates.influencerName !== undefined) dbUpdates.influencer_name = updates.influencerName;
  if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
  if (updates.contentType !== undefined) dbUpdates.content_type = updates.contentType;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
  if (updates.fee !== undefined) dbUpdates.fee = parseFloat(updates.fee) || 0;
  if (updates.campaign !== undefined) dbUpdates.campaign = updates.campaign;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.paymentStatus !== undefined) dbUpdates.payment_status = updates.paymentStatus;
  if (updates.receiptData !== undefined) dbUpdates.receipt_data = updates.receiptData;

  const { error } = await supabase
    .from("calendar_slots")
    .update(dbUpdates)
    .eq("id", id);

  if (error) {
    console.error("Error updating calendar slot:", error);
    return false;
  }
  return true;
}

export async function deleteCalendarSlot(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("calendar_slots")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting calendar slot:", error);
    return false;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════════
// CAMPAIGNS
// ═══════════════════════════════════════════════════════════════════
import type { Campaign } from "./campaigns";

export async function createCampaignInSupabase(campaign: Campaign): Promise<boolean> {
  try {
    const userId = await getUserId();
    const { error } = await supabase
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
      console.error("Error creating campaign in Supabase:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Error creating campaign in Supabase:", e);
    return false;
  }
}

export async function updateCampaignInSupabase(id: string, updates: Partial<Campaign>): Promise<boolean> {
  try {
    const dbUpdates: Record<string, any> = { updated_at: new Date().toISOString() };

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.brand !== undefined) dbUpdates.brand = updates.brand;
    if (updates.product !== undefined) dbUpdates.product = updates.product;
    if (updates.goal !== undefined) dbUpdates.goal = updates.goal;
    if (updates.countries !== undefined) dbUpdates.countries = updates.countries;
    if (updates.platforms !== undefined) dbUpdates.platforms = updates.platforms;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.campaignType !== undefined) dbUpdates.campaign_type = updates.campaignType;
    if (updates.audienceAgeRanges !== undefined) dbUpdates.audience_age_ranges = updates.audienceAgeRanges;
    if (updates.audienceInterests !== undefined) dbUpdates.audience_interests = updates.audienceInterests;
    if (updates.audienceGender !== undefined) dbUpdates.audience_gender = updates.audienceGender;
    if (updates.tone !== undefined) dbUpdates.tone = updates.tone;
    if (updates.competitorExclusivity !== undefined) dbUpdates.competitor_exclusivity = updates.competitorExclusivity;
    if (updates.exclusivityCategory !== undefined) dbUpdates.exclusivity_category = updates.exclusivityCategory;
    if (updates.exclusivityDuration !== undefined) dbUpdates.exclusivity_duration = updates.exclusivityDuration;
    if (updates.totalBudget !== undefined) dbUpdates.total_budget = updates.totalBudget;
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.paymentModel !== undefined) dbUpdates.payment_model = updates.paymentModel;
    if (updates.budgetPerCreator !== undefined) dbUpdates.budget_per_creator = updates.budgetPerCreator;
    if (updates.paymentTiming !== undefined) dbUpdates.payment_timing = updates.paymentTiming;
    if (updates.status !== undefined) dbUpdates.status = updates.status;

    const { error } = await supabase
      .from("campaigns")
      .update(dbUpdates)
      .eq("id", id);

    if (error) {
      console.error("Error updating campaign in Supabase:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Error updating campaign in Supabase:", e);
    return false;
  }
}

