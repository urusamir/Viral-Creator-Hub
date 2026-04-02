const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('calendar_slots').select('id, payment_status, has_payment, fee');
  if (error) console.error("Error:", error);
  else {
    console.log(`Total slots: ${data.length}`);
    console.log("Samples:", JSON.stringify(data.slice(0, 5), null, 2));
    console.log(`Slots with has_payment=true: ${data.filter(s => s.has_payment).length}`);
    console.log(`Slots with payment_status='completed': ${data.filter(s => s.payment_status === 'completed').length}`);
    console.log(`Slots with any payment_status: ${data.filter(s => s.payment_status).length}`);
    console.log(`Slots with fee > 0: ${data.filter(s => parseFloat(s.fee) > 0).length}`);
  }
}
check();
