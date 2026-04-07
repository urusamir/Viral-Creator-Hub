import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";
import { CampaignV2, defaultCampaignV2 } from "@/models/campaigns-v2.types";

/**
 * Fetches all campaigns for a user, mapped strictly to the Campaigns V2 types.
 */
export async function fetchCampaignsV2(userId: string): Promise<CampaignV2[]> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name || "",
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
      // Use defaults for complex JSONB if they don't exist
      briefs: row.briefs && Array.isArray(row.briefs) && row.briefs.length > 0 
        ? row.briefs 
        : defaultCampaignV2().briefs,
      selectedCreators: Array.isArray(row.selected_creators) ? row.selected_creators : [],
      deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
      status: row.status || "DRAFT",
      lastStep: row.last_step || 1,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

/**
 * Upserts a campaign strictly mapping V2 types back to the database.
 */
export async function saveCampaignV2(campaign: CampaignV2, userId: string): Promise<boolean> {
  const payload = {
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
    // Note: To cleanly migrate, we only save the fields that V2 cares about.
    // We do not save legacy top-level `dos`, `donts`, etc. unless we want to avoid replacing them with null, 
    // but the backend update/insert will just overwrite them with standard fields defined in Payload.
    briefs: campaign.briefs,
    selected_creators: campaign.selectedCreators,
    deliverables: campaign.deliverables,
    status: campaign.status,
    last_step: campaign.lastStep,
  };

  try {
    const { error } = await supabase
      .from("campaigns")
      .upsert(payload)
      .select()
      .single();

    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return false;
    }
    
    // Broadcast generic event for parallel UI layers mapped to the same DB event hook
    window.dispatchEvent(new Event("vairal-campaigns-updated"));
    return true;
  } catch (e: any) {
    toast({ title: "Save Error", description: "Unknown systemic error occurred.", variant: "destructive" });
    return false;
  }
}
