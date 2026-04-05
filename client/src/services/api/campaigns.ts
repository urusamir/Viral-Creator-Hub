import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";
import type { Campaign } from "@/models/campaign.types";
import { mapDbRowToCampaign } from "@/models/campaign.types";

export async function fetchCampaigns(userId: string): Promise<Campaign[]> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (data || []).map(mapDbRowToCampaign);
  } catch {
    return [];
  }
}

/** Convert camelCase Campaign fields to snake_case DB columns. */
function mapCampaignToDbPayload(fields: Partial<Campaign>): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  if (fields.name !== undefined) payload.name = fields.name;
  if (fields.brand !== undefined) payload.brand = fields.brand;
  if (fields.product !== undefined) payload.product = fields.product;
  if (fields.goal !== undefined) payload.goal = fields.goal;
  if (fields.countries !== undefined) payload.countries = fields.countries;
  if (fields.platforms !== undefined) payload.platforms = fields.platforms;
  if (fields.startDate !== undefined) payload.start_date = fields.startDate || null;
  if (fields.endDate !== undefined) payload.end_date = fields.endDate || null;
  if (fields.totalBudget !== undefined) payload.total_budget = fields.totalBudget;
  if (fields.currency !== undefined) payload.currency = fields.currency;
  if (fields.audienceAgeRanges !== undefined) payload.audience_age_ranges = fields.audienceAgeRanges;
  if (fields.keyMessages !== undefined) payload.key_messages = fields.keyMessages;
  if (fields.dos !== undefined) payload.dos = fields.dos;
  if (fields.donts !== undefined) payload.donts = fields.donts;
  if (fields.hashtags !== undefined) payload.hashtags = fields.hashtags;
  if (fields.mentions !== undefined) payload.mentions = fields.mentions;
  if (fields.referenceLinks !== undefined) payload.reference_links = fields.referenceLinks;
  if (fields.deliverables !== undefined) payload.deliverables = fields.deliverables;
  if (fields.selectedCreators !== undefined) payload.selected_creators = fields.selectedCreators;
  if (fields.status !== undefined) payload.status = fields.status;
  if (fields.lastStep !== undefined) payload.last_step = fields.lastStep;
  return payload;
}

export async function createCampaignInDb(campaign: Campaign, userId: string): Promise<Record<string, unknown> | null> {
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        id: campaign.id,
        user_id: userId,
        ...mapCampaignToDbPayload(campaign),
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Campaign Save Failed", description: error.message, variant: "destructive" });
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function updateCampaignInDb(id: string, updatedFields: Partial<Campaign>): Promise<boolean> {
  try {
    const payload = mapCampaignToDbPayload(updatedFields);

    const { error } = await supabase.from("campaigns").update(payload).eq("id", id);
    if (error) {
      toast({ title: "Campaign Update Failed", description: error.message, variant: "destructive" });
      return false;
    }
    return true;
  } catch {
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
  } catch {
    return false;
  }
}
