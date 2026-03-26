import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://liesympjqygmzestgfoa.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZXN5bXBqcXlnbXplc3RnZm9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjIwNTcsImV4cCI6MjA4OTY5ODA1N30.d2dRdeJ72KB3J0ssQXO-QXDJRChRPIQTCmG10x9LoRw";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const { data, error } = await supabase.from("saved_creators").insert({
    user_id: "869aaadf-c7b4-4633-ab4c-7d6437c4c9fa", // The UUID of "test" user from my earlier query
    creator_username: "ossymarwah",
    creator_name: "Ossy Marwah",
    platform: "Instagram",
    followers: 9100000,
    engagement_rate: 10.06,
    categories: ["Lifestyle", "Fashion"],
  });

  console.log("Error:", error);
  console.log("Data:", data);
}

testInsert();
