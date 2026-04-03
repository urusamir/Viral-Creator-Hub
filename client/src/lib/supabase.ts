import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "⚠️ Supabase credentials missing! Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables. Auth will not work."
  );
}

// We use a singleton pattern on the window object to prevent Vite HMR
// from creating multiple Supabase clients that fight over the navigator.locks
// which causes deadlocks making all requests hang.
let supabaseClient: any;

if (typeof window !== "undefined") {
  if (!(window as any)._supabaseInstance) {
    (window as any)._supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: "viral-v3-auth-token",
        storage: window.localStorage,
        flowType: "implicit",
        // Bypass navigator.locks entirely. The default Web Lock implementation
        // causes deadlocks on tab restore, HMR, and Vercel cold starts.
        // This simple in-process lock works perfectly for single-tab apps.
        lock: async (name: string, acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
    });
  }
  supabaseClient = (window as any)._supabaseInstance;
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "viral-v3-auth-token",
    },
  });
}

export const supabase = supabaseClient;

