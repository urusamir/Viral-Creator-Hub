import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Read .env file directly
const envPath = path.resolve(process.cwd(), ".env");
const envContent = fs.readFileSync(envPath, "utf-8");
const env: Record<string, string> = {};
envContent.split("\n").forEach((line) => {
  const [key, ...value] = line.split("=");
  if (key && value.length > 0) {
    env[key.trim()] = value.join("=").trim().replace(/^"([A-Za-z0-9]+)"$/, "$1");
  }
});

const supabaseUrl = env["VITE_SUPABASE_URL"] || "";
const supabaseAnonKey = env["VITE_SUPABASE_ANON_KEY"] || "";

// Initialize Supabase exactly like the client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Starting test...");
  
  // Create a mock user or use an existing one (UUID from the logs: 5f89acf9-ee87-44fd-b28f-163877df8566)
  const userId = "5f89acf9-ee87-44fd-b28f-163877df8566"; // Valid user ID from DB

  const payload = {
    user_id: userId,
    date: "2025-05-13",
    influencer_name: "Test Influencer",
    platform: "Instagram",
    content_type: "Story",
    status: "Pending",
    currency: "USD",
    fee: 0,
    campaign: "",
    notes: "",
    payment_status: "pending",
    receipt_data: null,
  };

  console.log("Attempting insert payload:", payload);
  try {
    const { data, error } = await supabase
      .from("calendar_slots")
      .insert(payload)
      .select()
      .single();

    console.log("Result Error:", error);
    console.log("Result Data:", data);
  } catch (err) {
    console.error("Caught synchronous exception:", err);
  }
}

run();
