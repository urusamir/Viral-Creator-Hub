const { createClient } = require('@supabase/supabase-js');

// Must match client env
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://liesympjqygmzestgfoa.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '...'; // I will get it from .env

async function testCalendarSlot() {
  require('dotenv').config();
  const client = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
  
  // Try inserting calendar_slots with same payload
  const { data, error } = await client
      .from("calendar_slots")
      .insert({
        user_id: "d5c64c1c-913a-44af-8800-410a5638c11e", // Some random UUID just to test schema
        date: "2024-04-01",
        influencer_name: "Test Influencer",
        platform: "Instagram",
        content_type: "Post",
        status: "Confirmed",
        currency: "USD",
        fee: 1000,
        campaign: "Test Campaign",
        notes: "Some notes",
        payment_status: "pending",
        receipt_data: null,
      })
      .select()
      .single();
      
  console.log("Insert Result:", data, error);
}

testCalendarSlot();
