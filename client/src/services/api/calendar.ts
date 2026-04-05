import { supabase } from "../supabase";
import type { CalendarSlot } from "@/models/calendar.types";
import { toast } from "@/hooks/use-toast";

/** Maps a raw Supabase DB row to the typed CalendarSlot model. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToCalendarSlot(row: Record<string, any>): CalendarSlot {
  return {
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
  };
}

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

    return (data || []).map(mapDbRowToCalendarSlot);
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

    return mapDbRowToCalendarSlot(data);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Could not reach database.";
    toast({ title: "Connection Error", description: message, variant: "destructive" });
    return null;
  }
}

export async function updateCalendarSlot(
  id: string,
  updates: Partial<CalendarSlot>
): Promise<boolean> {
  try {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };

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

    // Show success toast for payment status changes
    if (updates.paymentStatus === "completed") {
      toast({ title: "Payment Recorded", description: "Payment marked as completed and saved to database." });
    }

    setTimeout(() => window.dispatchEvent(new Event("vairal-calendar-updated")), 400);
    return true;
  } catch (err: unknown) {
    console.error("[updateCalendarSlot] Exception:", err);
    const message = err instanceof Error ? err.message : "Unexpected error.";
    toast({ title: "Update Error", description: message, variant: "destructive" });
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
