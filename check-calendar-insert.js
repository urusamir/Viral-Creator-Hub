import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCalendar() {
  const { data: users, error: userError } = await supabase.auth.admin?.listUsers() || await supabase.from('profiles').select('id').limit(1);
  const userId = users?.[0]?.id || "d05ee0e0-4ecc-4712-baaf-77bd107c7ea1";
  
  console.log("Using User ID:", userId);

  const slot = {
    date: new Date().toISOString(),
    influencer_name: "Test Influencer",
    platform: "instagram",
    content_type: "reel",
    status: "draft",
    currency: "USD",
    fee: 500,
    campaign: "Test Camp",
    notes: "No notes",
    payment_status: "pending",
    receipt_data: null
  };

  const { data, error } = await supabase
    .from("calendar_slots")
    .insert({
      user_id: userId,
      ...slot
    })
    .select()
    .single();

  if (error) {
    console.error("Failed to insert calendar_slots:", error);
  } else {
    console.log("Successfully inserted calendar_slots:", data);
  }
}

testCalendar();
