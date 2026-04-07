import { supabase } from "../supabase";

export async function fetchAdminDashboardStats() {
  const [
    { count: brandCount, data: recentBrands, error: profileErr },
    { count: campaignCount, error: campErr },
    { count: savedCount, error: savedErr },
    { count: calTotal, error: calErr },
    { count: calCompletedError }
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact" }).order("id", { ascending: false }).limit(5),
    supabase.from("campaigns").select("*", { count: "exact", head: true }),
    supabase.from("saved_creators").select("*", { count: "exact", head: true }),
    supabase.from("calendar_slots").select("*", { count: "exact", head: true }),
    supabase.from("calendar_slots").select("*", { count: "exact", head: true }).eq("payment_status", "completed")
  ]);

  if (profileErr) throw profileErr;
  if (campErr) throw campErr;
  if (savedErr) throw savedErr;
  if (calErr) throw calErr;
  
  const completedPayments = calCompletedError || 0;
  // pending payments == total payments - completed payments
  const pendingPayments = Math.max(0, (calTotal || 0) - completedPayments);

  return {
    totalBrands: brandCount || 0,
    totalCampaigns: campaignCount || 0,
    totalSavedCreators: savedCount || 0,
    totalCalendarEvents: calTotal || 0,
    totalPayments: completedPayments,
    pendingPayments: pendingPayments,
    recentBrands: recentBrands || []
  };
}

export async function fetchAdminBrands() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("id", { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function fetchAdminBrandDetails(brandId: string) {
  const [
    { data: profile, error: profileError },
    { data: savedCreators, error: savedError },
    { data: campaigns, error: campaignError },
    { data: calendarSlots, error: calendarError },
    { data: lists, error: listsError },
    { data: listMembers, error: listMembersError }
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", brandId).single(),
    supabase.from("saved_creators").select("*").eq("user_id", brandId).order("saved_at", { ascending: false }),
    supabase.from("campaigns").select("*").eq("user_id", brandId).order("created_at", { ascending: false }),
    supabase.from("calendar_slots").select("*").eq("user_id", brandId).order("date", { ascending: false }),
    supabase.from("lists").select("*").eq("user_id", brandId).order("created_at", { ascending: false }),
    supabase.from("list_members").select("*").eq("user_id", brandId)
  ]);

  if (profileError) throw profileError;

  return {
    profile,
    savedCreators: savedCreators || [],
    campaigns: campaigns || [],
    lists: lists || [],
    calendarSlots: calendarSlots || [],
    listMembers: listMembers || []
  };
}

export async function fetchAdminUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("is_admin", true)
    .order("created_at", { ascending: false });
    
  if (error) throw error;
  return data || [];
}

export async function searchAdminUserByEmail(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
}

export async function grantPendingAdminAccess(email: string) {
  const { error } = await supabase
    .from("pending_admins")
    .upsert({ email: email.trim().toLowerCase() }, { onConflict: "email" });

  // Table may not exist (PGRST205) — fail silently
  if (error && error.code !== 'PGRST205') throw error;
  return true;
}

export async function toggleAdminStatus(userId: string, currentStatus: boolean) {
  const newStatus = !currentStatus;
  const { error } = await supabase
    .from("profiles")
    .update({ is_admin: newStatus })
    .eq("id", userId);
    
  if (error) throw error;
  return newStatus;
}

export async function deletePendingAdmin(email: string) {
  const { error } = await supabase
    .from("pending_admins")
    .delete()
    .eq("email", email.trim().toLowerCase());
    
  // Table may not exist (PGRST205) — fail silently
  if (error && error.code !== 'PGRST205') throw error;
  return true;
}

export async function checkPendingAdminAccess(email: string) {
  const { data, error } = await supabase
    .from("pending_admins")
    .select("email")
    .eq("email", email.trim().toLowerCase())
    .limit(1);
  
  // Table may not exist (PGRST205) — treat as "not found"
  if (error) return false;
  return data && data.length > 0;
}

export async function checkProfileAdminAccess(email: string) {
  const { data } = await supabase
    .from("profiles")
    .select("email, is_admin")
    .eq("email", email.trim().toLowerCase())
    .eq("is_admin", true)
    .limit(1);
    
  return data && data.length > 0;
}

export async function createAdminProfile(userId: string, email: string, name: string) {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      email: email.trim().toLowerCase(),
      is_admin: true,
      role: "brand",
      company_name: name,
      onboarding_complete: false,
    }, { onConflict: "id" });
  
  if (error) throw error;
  return true;
}
