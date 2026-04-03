import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envLocal = fs.readFileSync('.env.local', 'utf8');
const urlMatch = envLocal.match(/VITE_SUPABASE_URL=(.+)/);
const keyMatch = envLocal.match(/VITE_SUPABASE_ANON_KEY=(.+)/);

if (!urlMatch || !keyMatch) throw new Error("Missing env");

const supabase = createClient(urlMatch[1].trim(), keyMatch[1].trim());

async function doCheck() {
   const { data, error } = await supabase.from('saved_creators').select('*').limit(1);
   console.log("error?", error);
}
doCheck();
