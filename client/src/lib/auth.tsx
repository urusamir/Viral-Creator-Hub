import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase";
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";
import { useLocation } from "wouter";
import { syncCampaignsFromSupabase } from "./campaigns";

export interface Profile {
  id: string;
  email: string | null;
  role: string;
  company_name: string | null;
  website: string | null;
  platforms: string[] | null;
  monthly_budget: number | null;
  how_found_us: string | null;
  position: string | null;
  department: string | null;
  onboarding_complete: boolean;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: Profile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch profile from the profiles table
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as Profile;
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      return null;
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    let cancelled = false;

    // Get initial session
    const initSession = async () => {
      try {
        const { data: { session: s }, error } = await supabase.auth.getSession();
        if (cancelled) return;

        if (error) {
          console.error("getSession error:", error);
          setIsLoading(false);
          return;
        }

        setSession(s);
        setUser(s?.user ?? null);

        if (s?.user) {
          syncCampaignsFromSupabase(s.user.id);
          const p = await fetchProfile(s.user.id);
          if (!cancelled) setProfile(p);
        }
      } catch (err) {
        console.error("Failed to get session:", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    initSession();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setIsLoading(false); // Always stop loading on auth state change

      if (s?.user) {
        syncCampaignsFromSupabase(s.user.id);
        const p = await fetchProfile(s.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw new Error(error.message);

    // Immediately update state so navigation works without waiting for onAuthStateChange
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setIsLoading(false);
      // Fetch profile in background
      fetchProfile(data.session.user.id).then((p) => setProfile(p));
    }
  };

  const signup = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw new Error(error.message);

    // Immediately update state if session is returned (email confirmation disabled)
    if (data.session) {
      setSession(data.session);
      setUser(data.session.user);
      setIsLoading(false);
      // Fetch profile in background (trigger creates it)
      setTimeout(() => {
        fetchProfile(data.session!.user.id).then((p) => setProfile(p));
      }, 500); // Small delay to let the trigger create the profile
    }
  };

  const logout = async () => {
    // 1. Clear React state immediately
    setSession(null);
    setUser(null);
    setProfile(null);

    // 2. Sign out from Supabase (clears the JWT)
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Supabase signOut error (continuing anyway):", err);
    }

    // 3. (REMOVED) Previously this manually deleted `sb-*-auth-token` from localStorage. 
    // This is EXTREMELY dangerous because it bypasses Supabase's gotrue-js internal lock and 
    // corrupts the Web Lock API, leading to `Error: Lock "lock:sb-...-auth-token" was released 
    // because another request stole it` deadlocking all future queries.
    // supabase.auth.signOut() handles this safely.

    // 4. Also clear app-specific localStorage  
    localStorage.removeItem("vairal-calendar-slots");

    // 5. Navigate to auth page and force a hard reload to clear all memory
    window.location.href = "/auth";
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) throw new Error("Not authenticated");

    const { error } = await supabase
      .from("profiles")
      .update(data)
      .eq("id", user.id);

    if (error) throw new Error(error.message);

    // Re-fetch profile after update
    const updated = await fetchProfile(user.id);
    setProfile(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
