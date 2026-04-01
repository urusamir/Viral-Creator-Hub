import fs from "fs";
const env = fs.readFileSync(".env", "utf8");
const urlMatch = env.match(/VITE_SUPABASE_URL=(.*)/);
const keyMatch = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/);

const url = urlMatch ? urlMatch[1] : "";
const key = keyMatch ? keyMatch[1] : "";

fetch(`${url}/rest/v1/saved_creators`, {
  headers: {
    "apikey": key,
    "Authorization": `Bearer ${key}`
  }
}).then(r => r.json()).then(console.log).catch(console.error);
