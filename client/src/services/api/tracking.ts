import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";

export type DeliverableTracking = {
  id: string;
  campaign_id: string;
  creator_id: string;
  deliverable_id: string;
  url: string;
  metrics: { week: number; views: number }[];
  created_at?: string;
  updated_at?: string;
};

// Fetch tracking data for all deliverables in a specific campaign
export async function getCampaignTracking(campaignId: string): Promise<DeliverableTracking[]> {
  try {
    const { data, error } = await supabase
      .from("deliverable_tracking")
      .select("*")
      .eq("campaign_id", campaignId);

    if (error) {
      console.error("Failed to fetch tracking data", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Upsert a tracking row for a specific deliverable
export async function upsertDeliverableTracking(tracking: Omit<DeliverableTracking, "id" | "created_at" | "updated_at">): Promise<DeliverableTracking | null> {
  try {
    // Generate an 8-week array if one doesn't exist.
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({
      week: i + 1,
      views: 0,
    }));

    const metricsToSave = tracking.metrics && tracking.metrics.length > 0 
      ? tracking.metrics 
      : defaultMetrics;

    const { data, error } = await supabase
      .from("deliverable_tracking")
      .upsert({
        campaign_id: tracking.campaign_id,
        creator_id: tracking.creator_id,
        deliverable_id: tracking.deliverable_id,
        url: tracking.url || "",
        metrics: metricsToSave,
        updated_at: new Date().toISOString()
      }, {
        onConflict: "campaign_id, creator_id, deliverable_id"
      })
      .select()
      .single();

    if (error) {
       toast({ title: "Save Failed", description: error.message, variant: "destructive" });
       return null;
    }

    return data;
  } catch(err: any) {
    toast({ title: "Error", description: err.message || "Failed to upsert tracking", variant: "destructive" });
    return null;
  }
}
