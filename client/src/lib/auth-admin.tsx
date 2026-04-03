import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "./supabase"; // Single Supabase client — sessions managed entirely by Supabase
import type { Session, User as SupabaseUser } from "@supabase/supabase-js";

export interface AdminProfile {
  id: string;
  email: string | null;
  is_admin: boolean;
  company_name: string | null;
  role: string;
}

interface AdminAuthContextType {
  user: SupabaseUser | null;
  profile: AdminProfile | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ isAdmin: boolean }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string): Promise<AdminProfile | null> => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, is_admin, company_name, role")
        .eq("id", userId)
        .single();
      if (error) return null;
      return data as AdminProfile;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (cancelled) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          if (!cancelled) setProfile(p);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: any, s: Session | null) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          const p = await fetchProfile(s.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Returns whether the logged-in user is an admin so the caller can redirect immediately.
  const login = async (email: string, password: string): Promise<{ isAdmin: boolean }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (!data.session) throw new Error("Login failed. No session returned.");

    // Fetch profile directly — no async state race condition.
    const p = await fetchProfile(data.session.user.id);

    setSession(data.session);
    setUser(data.session.user);
    setProfile(p);
    setIsLoading(false);

    return { isAdmin: !!p?.is_admin };
  };

  const logout = async () => {
    setSession(null);
    setUser(null);
    setProfile(null);
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    window.location.href = "/admin-login";
  };

  return (
    <AdminAuthContext.Provider value={{ user, profile, session, isLoading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return context;
}
