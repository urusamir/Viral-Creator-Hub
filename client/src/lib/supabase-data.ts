/**
 * Supabase data layer for all feature tables.
 * Replaces localStorage-based storage with Supabase persistence.
 */
import { supabase } from "./supabase";
import type { CalendarSlot } from "./calendar-slots";

// ─── Auth helper ─────────────────────────────────────────────────
async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (!data.session?.user) throw new Error("Not authenticated");
  return data.session.user.id;
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
  const userId = await getUserId();
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
export type SupabaseCampaign = {
  id: string;
  name: string;
  brand: string;
  status: string;
  platforms: string[];
  start_date: string | null;
  end_date: string | null;
  total_budget: number;
  currency: string;
  created_at: string;
  updated_at: string;
};

export async function fetchCampaigns(): Promise<SupabaseCampaign[]> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching campaigns:", error);
    return [];
  }
  return data || [];
}

export async function updateCampaignStatus(id: string, status: string): Promise<boolean> {
  const { error } = await supabase
    .from("campaigns")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    console.error("Error updating campaign:", error);
    return false;
  }
  return true;
}
