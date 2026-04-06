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
      currency: row.currency || "USD",
      fee: String(row.fee || 0),
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
        currency: slot.currency,
        fee: parseFloat(String(slot.fee).replace(/[^0-9.]/g, "")) || 0,
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
    if (updates.currency !== undefined) dbUpdates.currency = updates.currency;
    if (updates.fee !== undefined) dbUpdates.fee = parseFloat(String(updates.fee).replace(/[^0-9.]/g, "")) || 0;
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
