const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

let env;
try { env = fs.readFileSync('client/.env', 'utf8'); } catch(e) { env = fs.readFileSync('.env', 'utf8'); }
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const supabaseUrl = urlMatch[1];
const supabaseKey = keyMatch[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Fetching all profiles...");
  const { data: profiles, error } = await supabase.from('profiles').select('id, email, is_admin');
  if (error) {
    console.error("Error fetching profiles", error);
    return;
  }
  
  const emailCounts = {};
  profiles.forEach(p => {
    if (!p.email) return;
    emailCounts[p.email] = (emailCounts[p.email] || 0) + 1;
  });
  
  const duplicatedEmails = Object.keys(emailCounts).filter(e => emailCounts[e] > 1);
  console.log("Duplicated emails:", duplicatedEmails);
  
  for (const email of duplicatedEmails) {
    const dups = profiles.filter(p => p.email === email);
    console.log(`Email ${email} has profiles:`, dups);
    
    // Attempt cleanup: If one id looks like a standard v4 UUID and another doesn't,
    // wait, Supabase auth.users use v4 UUIDs. Both might be v4.
    // The fake one was created via crypto.randomUUID().
    // We can just keep the one that actually matches a real user in auth.users.
    // But since we can't query auth.users with anon key, we'll try to use signInWithPassword ? No.
    // We can check if one has onboarding_complete which is false vs true maybe?
    
    // Instead of deleting here, let's just output them first.
  }
}
run();
