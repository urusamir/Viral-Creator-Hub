import { supabase } from "../supabase";
import type { CalendarSlot } from "@/models/calendar.types";
import { toast } from "@/hooks/use-toast";

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
      campaign: row.campaign || "",
      campaign_id: row.campaign_id || undefined,
      notes: row.notes || "",
      slotType: row.slot_type || "Scheduled Date",
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
        campaign: slot.campaign,
        campaign_id: slot.campaign_id || null,
        notes: slot.notes,
        slot_type: slot.slotType,
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Save Failed", description: error.message, variant: "destructive" });
      return null;
    }

    // Silently save slot, avoiding spam during drag & drop syncs
    setTimeout(() => window.dispatchEvent(new Event("vairal-calendar-updated")), 400);

    return {
      id: data.id,
      date: data.date,
      influencerName: data.influencer_name,
      platform: data.platform || "",
      contentType: data.content_type || "",
      status: data.status as CalendarSlot["status"],
      campaign: data.campaign || "",
      campaign_id: data.campaign_id || undefined,
      notes: data.notes || "",
      slotType: data.slot_type || "Scheduled Date",
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
    if (updates.campaign !== undefined) dbUpdates.campaign = updates.campaign;
    if (updates.campaign_id !== undefined) dbUpdates.campaign_id = updates.campaign_id;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.slotType !== undefined) dbUpdates.slot_type = updates.slotType;

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

export async function syncCampaignDeliverablesToCalendar(campaign: any, userId: string) {
  try {
    // 1. Delete existing slots for this campaign to do a clean sync
    const { data: existingSlots } = await supabase
      .from("calendar_slots")
      .select("id")
      .eq("campaign_id", campaign.id);
      
    if (existingSlots && existingSlots.length > 0) {
      const ids = existingSlots.map((s: any) => s.id);
      await supabase.from("calendar_slots").delete().in("id", ids);
    }

    // 2. Insert new slots based only on goLiveOn and submitShootBefore
    const { creatorsData } = await import("@/models/creators.data");

    const syncPromises: Promise<any>[] = [];

    for (const creator of (campaign.selectedCreators || [])) {
      const creatorObj = creatorsData.find((c: any) => c.username === creator.creatorId);
      const influencerName = creatorObj?.fullname || creatorObj?.username || creator.creatorId;

      for (const item of (creator.deliverables || [])) {
        // Sync Shoot Date
        if (item.submitShootBefore) {
          syncPromises.push(
            createCalendarSlot({
               date: item.submitShootBefore,
               influencerName,
               platform: item.platform || "",
               contentType: item.contentType || "",
               status: "Pending",
               campaign: campaign.name || "",
               campaign_id: campaign.id,
               notes: item.contentDetails || "Shoot Date",
               slotType: "Shoot Date"
            }, userId)
          );
        }
        
        // Sync Schedule Date
        if (item.goLiveOn) {
          syncPromises.push(
            createCalendarSlot({
               date: item.goLiveOn,
               influencerName,
               platform: item.platform || "",
               contentType: item.contentType || "",
               status: "Pending",
               campaign: campaign.name || "",
               campaign_id: campaign.id,
               notes: item.contentDetails || "Go Live Date",
               slotType: "Scheduled Date"
            }, userId)
          );
        }
      }
    }

    if (syncPromises.length > 0) {
      await Promise.all(syncPromises);
    }
  } catch (error) {
    console.error("Failed to sync campaign to calendar:", error);
  }
}

