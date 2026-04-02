import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Separate Supabase client for admin portal.
// Uses a DIFFERENT storageKey ("viral-admin-auth-token") so admin sessions
// are completely isolated from brand platform sessions ("viral-v3-auth-token").
// Logging into admin does NOT affect the brand platform session and vice versa.
let adminSupabaseClient: any;

if (typeof window !== "undefined") {
  if (!(window as any)._supabaseAdminInstance) {
    (window as any)._supabaseAdminInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: "viral-admin-auth-token",
        storage: window.localStorage,
        flowType: "implicit",
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
    });
  }
  adminSupabaseClient = (window as any)._supabaseAdminInstance;
} else {
  adminSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "viral-admin-auth-token",
    },
  });
}

export const supabaseAdmin = adminSupabaseClient;
