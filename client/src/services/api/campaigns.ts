import { supabase } from "../supabase";
import { toast } from "@/hooks/use-toast";

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
      briefs: row.briefs && Array.isArray(row.briefs) && row.briefs.length > 0 
        ? row.briefs 
        : [{
            id: row.id + "-legacy-brief",
            title: "Brief 1",
            keyMessages: row.key_messages || [],
            dos: row.dos || [],
            donts: row.donts || [],
            hashtags: row.hashtags || [],
            mentions: row.mentions || [],
            referenceLinks: row.reference_links || [],
            deliverables: row.deliverables || [],
          }],
      selectedCreators: (row.selected_creators || []).map((c: any) => {
        if (typeof c === "string") return { creatorId: c, status: "Request Sent", deliverables: [] };
        // Normalize status casing from DB (may be 'pending', 'confirmed', etc.)
        const statusMap: Record<string, string> = {
          pending: "Pending",
          confirmed: "Confirmed",
          "request sent": "Request Sent",
          "request_sent": "Request Sent",
        };
        return {
          ...c,
          status: statusMap[String(c.status || "").toLowerCase()] || c.status || "Request Sent",
          deliverables: c.deliverables || [],
        };
      }),
      status: row.status || "DRAFT",
      lastStep: row.last_step || 1,
      paymentStatus: row.payment_status || "pending",
      receiptData: row.receipt_data || null,
      createdAt: row.created_at || new Date().toISOString(),
      updatedAt: row.updated_at || new Date().toISOString(),
      milestones: row.milestones || [],
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
        briefs: campaign.briefs || [],
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
    if (updatedFields.briefs !== undefined) payload.briefs = updatedFields.briefs;
    if (updatedFields.selectedCreators !== undefined) payload.selected_creators = updatedFields.selectedCreators;
    if (updatedFields.status !== undefined) payload.status = updatedFields.status;
    if (updatedFields.lastStep !== undefined) payload.last_step = updatedFields.lastStep;
    if (updatedFields.paymentStatus !== undefined) payload.payment_status = updatedFields.paymentStatus;
    if (updatedFields.receiptData !== undefined) payload.receipt_data = updatedFields.receiptData;

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
