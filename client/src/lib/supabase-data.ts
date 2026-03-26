/**
 * Supabase data layer for all feature tables.
 * All writes are tagged with the authenticated user's ID from Supabase Auth.
 * Uses getUser() (server-validated) instead of getSession() (cached) to
 * prevent stale-session bugs where data gets saved under the wrong account.
 */
import { supabase } from "./supabase";
import type { CalendarSlot } from "./calendar-slots";
import { toast } from "@/hooks/use-toast";

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
    console.log("[Supabase DEBUG] About to call getSession()");
    const sessionDebug = await supabase.auth.getSession();
    console.log("[Supabase DEBUG] getSession() resolved!", !!sessionDebug.data.session);

    console.log("[Supabase DEBUG] About to call calendar_slots.insert()");
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

    console.log("[Supabase DEBUG] calendar_slots.insert() finished. Error:", error);

    if (error) {
      console.error("[Supabase] Error creating calendar slot:", error);
      toast({
        title: "Database Error",
        description: `Failed to save Calendar Slot: ${error.message}`,
        variant: "destructive",
      });
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
    dbUpdates.fee = parseFloat(String(updates.fee).replace(/[^0-9.]/g, "")) || 0;
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
    toast({
      title: "Sync Error",
      description: `Updates failed to save to database: ${error.message}`,
      variant: "destructive",
    });
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
      console.error("[Supabase] Error fetching saved creators:", error);
      return [];
    }
    return data.map((d) => d.creator_username);
  } catch (e) {
    console.error("[Supabase] Error fetching saved creators:", e);
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
      console.log(`[Supabase DEBUG] About to call getSession() for saved_creators`);
      const sessionDebug = await supabase.auth.getSession();
      console.log(`[Supabase DEBUG] getSession() resolved!`, !!sessionDebug.data.session);

      console.log(`[Supabase DEBUG] About to call saved_creators.insert() for ${creator.username}`);
      const { error } = await supabase.from("saved_creators").insert({
      user_id: userId,
      creator_username: creator.username,
      creator_name: creator.fullname,
      platform: creator.platform,
      followers: creator.followers || 0,
      engagement_rate: creator.er || 0,
      categories: creator.categories || [],
    });

    console.log("[Supabase DEBUG] saved_creators.insert() finished. Error:", error);

    if (error) {
      console.error("[Supabase] Error saving creator:", error);
      toast({
        title: "Save Failed",
        description: `Could not save creator: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  } catch (e) {
    console.error("[Supabase] Error saving creator:", e);
    return false;
  }
}

export async function unsaveCreator(
  userId: string,
  username: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("saved_creators")
      .delete()
      .match({ user_id: userId, creator_username: username });

    if (error) {
      console.error("[Supabase] Error unsaving creator:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[Supabase] Error unsaving creator:", e);
    return false;
  }
}

// --- CAMPAIGNS ---

export async function fetchCampaigns(userId: string) {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Supabase] Error fetching campaigns:", error);
      return [];
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      brand: row.brand || "",
      product: row.product || "",
      goal: row.goal || "",
      countries: row.countries || [],
      platforms: row.platforms || [],
      startDate: row.start_date || "",
      endDate: row.end_date || "",
      notes: row.notes || "",
      campaignType: row.campaign_type || "",
      audienceAgeRanges: row.audience_age_ranges || [],
      audienceInterests: row.audience_interests || [],
      audienceGender: row.audience_gender || "",
      tone: row.tone || "",
      competitorExclusivity: row.competitor_exclusivity || false,
      exclusivityCategory: row.exclusivity_category || "",
      exclusivityDuration: row.exclusivity_duration || 0,
      totalBudget: Number(row.total_budget) || 0,
      currency: row.currency || "USD",
      paymentModel: row.payment_model || "",
      budgetPerCreator: Number(row.budget_per_creator) || 0,
      paymentTiming: row.payment_timing || "",
      status: row.status || "DRAFT",
      bonusRules: row.bonus_rules || [],
      selectedCreators: row.selected_creators || [],
      manualCreators: row.manual_creators || [],
      creatorFilters: row.creator_filters || {},
      deliverables: row.deliverables || [],
      // The 15 missing fields for strict Campaign Type
      brandOverview: row.brand_overview || "",
      productDetails: row.product_details || "",
      keyMessages: row.key_messages || [],
      dos: row.dos || [],
      donts: row.donts || [],
      mandatoryRequirements: row.mandatory_requirements || [],
      hashtags: row.hashtags || [],
      mentions: row.mentions || [],
      referenceLinks: row.reference_links || [],
      fileUploads: row.file_uploads || [],
      kpis: row.kpis || [],
      trackingMethods: row.tracking_methods || [],
      utmBaseUrl: row.utm_base_url || "",
      promoCodePattern: row.promo_code_pattern || "",
      reportingFrequency: row.reporting_frequency || "",
      exportFormats: row.export_formats || [],
      lastStep: row.last_step || 1,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch (e) {
    console.error("[Supabase] fetchCampaigns exception:", e);
    return [];
  }
}

export async function createCampaignInDb(campaign: any, userId: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
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
        bonus_rules: campaign.bonusRules,
        selected_creators: campaign.selectedCreators,
        manual_creators: campaign.manualCreators,
        creator_filters: campaign.creatorFilters,
        deliverables: campaign.deliverables,
        brand_overview: campaign.brandOverview,
        product_details: campaign.productDetails,
        key_messages: campaign.keyMessages,
        dos: campaign.dos,
        donts: campaign.donts,
        mandatory_requirements: campaign.mandatoryRequirements,
        hashtags: campaign.hashtags,
        mentions: campaign.mentions,
        reference_links: campaign.referenceLinks,
        file_uploads: campaign.fileUploads,
        kpis: campaign.kpis,
        tracking_methods: campaign.trackingMethods,
        utm_base_url: campaign.utmBaseUrl,
        promo_code_pattern: campaign.promoCodePattern,
        reporting_frequency: campaign.reportingFrequency,
        export_formats: campaign.exportFormats,
        last_step: campaign.lastStep,
      })
      .select()
      .single();

    if (error) {
      console.error("[Supabase] Error creating campaign:", error);
      return null;
    }

    return data;
  } catch (e) {
    console.error("[Supabase] createCampaign exception:", e);
    return null;
  }
}

export async function updateCampaignInDb(id: string, updatedFields: any): Promise<void> {
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
    if (updatedFields.notes !== undefined) payload.notes = updatedFields.notes;
    if (updatedFields.campaignType !== undefined) payload.campaign_type = updatedFields.campaignType;
    if (updatedFields.audienceAgeRanges !== undefined) payload.audience_age_ranges = updatedFields.audienceAgeRanges;
    if (updatedFields.audienceInterests !== undefined) payload.audience_interests = updatedFields.audienceInterests;
    if (updatedFields.audienceGender !== undefined) payload.audience_gender = updatedFields.audienceGender;
    if (updatedFields.tone !== undefined) payload.tone = updatedFields.tone;
    if (updatedFields.competitorExclusivity !== undefined) payload.competitor_exclusivity = updatedFields.competitorExclusivity;
    if (updatedFields.exclusivityCategory !== undefined) payload.exclusivity_category = updatedFields.exclusivityCategory;
    if (updatedFields.exclusivityDuration !== undefined) payload.exclusivity_duration = updatedFields.exclusivityDuration;
    if (updatedFields.totalBudget !== undefined) payload.total_budget = updatedFields.totalBudget;
    if (updatedFields.currency !== undefined) payload.currency = updatedFields.currency;
    if (updatedFields.paymentModel !== undefined) payload.payment_model = updatedFields.paymentModel;
    if (updatedFields.budgetPerCreator !== undefined) payload.budget_per_creator = updatedFields.budgetPerCreator;
    if (updatedFields.paymentTiming !== undefined) payload.payment_timing = updatedFields.paymentTiming;
    if (updatedFields.status !== undefined) payload.status = updatedFields.status;
    if (updatedFields.bonusRules !== undefined) payload.bonus_rules = updatedFields.bonusRules;
    if (updatedFields.selectedCreators !== undefined) payload.selected_creators = updatedFields.selectedCreators;
    if (updatedFields.manualCreators !== undefined) payload.manual_creators = updatedFields.manualCreators;
    if (updatedFields.creatorFilters !== undefined) payload.creator_filters = updatedFields.creatorFilters;
    if (updatedFields.deliverables !== undefined) payload.deliverables = updatedFields.deliverables;
    if (updatedFields.brandOverview !== undefined) payload.brand_overview = updatedFields.brandOverview;
    if (updatedFields.productDetails !== undefined) payload.product_details = updatedFields.productDetails;
    if (updatedFields.keyMessages !== undefined) payload.key_messages = updatedFields.keyMessages;
    if (updatedFields.dos !== undefined) payload.dos = updatedFields.dos;
    if (updatedFields.donts !== undefined) payload.donts = updatedFields.donts;
    if (updatedFields.mandatoryRequirements !== undefined) payload.mandatory_requirements = updatedFields.mandatoryRequirements;
    if (updatedFields.hashtags !== undefined) payload.hashtags = updatedFields.hashtags;
    if (updatedFields.mentions !== undefined) payload.mentions = updatedFields.mentions;
    if (updatedFields.referenceLinks !== undefined) payload.reference_links = updatedFields.referenceLinks;
    if (updatedFields.fileUploads !== undefined) payload.file_uploads = updatedFields.fileUploads;
    if (updatedFields.kpis !== undefined) payload.kpis = updatedFields.kpis;
    if (updatedFields.trackingMethods !== undefined) payload.tracking_methods = updatedFields.trackingMethods;
    if (updatedFields.utmBaseUrl !== undefined) payload.utm_base_url = updatedFields.utmBaseUrl;
    if (updatedFields.promoCodePattern !== undefined) payload.promo_code_pattern = updatedFields.promoCodePattern;
    if (updatedFields.reportingFrequency !== undefined) payload.reporting_frequency = updatedFields.reportingFrequency;
    if (updatedFields.exportFormats !== undefined) payload.export_formats = updatedFields.exportFormats;
    if (updatedFields.lastStep !== undefined) payload.last_step = updatedFields.lastStep;

    const { error } = await supabase.from("campaigns").update(payload).eq("id", id);
    if (error) {
      console.error("[Supabase] Error updating campaign:", error);
    }
  } catch (e) {
    console.error("[Supabase] updateCampaign exception:", e);
  }
}

export async function deleteCampaignInDb(id: string): Promise<void> {
  try {
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) {
      console.error("[Supabase] Error deleting campaign:", error);
    }
  } catch (e) {
    console.error("[Supabase] deleteCampaign exception:", e);
  }
}
