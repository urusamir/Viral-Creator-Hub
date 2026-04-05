/**
 * PrefetchProvider — React context that pre-fetches ALL feature data
 * as soon as the authenticated user is available.
 *
 * Sits inside DashboardLayout, wrapping all page components.
 * Pages consume the pre-fetched data via `usePrefetchedData()` to
 * seed their initial state, eliminating any loading delay.
 *
 * This provider also keeps the cache fresh by listening to the
 * existing `vairal-*-updated` window events.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./auth.provider";
import {
  prefetchAllData,
  refreshSlice,
  getPrefetchedData,
  type PrefetchedData,
} from "@/services/prefetch";

// ─── Context ──────────────────────────────────────────────────────────────────

const PrefetchContext = createContext<PrefetchedData>({
  calendarSlots: [],
  savedCreators: [],
  lists: [],
  campaigns: [],
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function PrefetchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [data, setData] = useState<PrefetchedData>(getPrefetchedData);
  const userId = user?.id ?? null;
  const hasFetched = useRef(false);

  // Trigger the parallel pre-fetch as soon as user.id is available
  useEffect(() => {
    if (!userId) return;
    if (hasFetched.current) return; // only once per mount

    hasFetched.current = true;
    prefetchAllData(userId).then((result) => {
      setData({ ...result });
    });
  }, [userId]);

  // ── Keep cache fresh via existing window events ──────────────────────────

  const handleCalendarUpdate = useCallback(() => {
    if (!userId) return;
    refreshSlice("calendarSlots", userId).then(() => {
      setData({ ...getPrefetchedData() });
    });
  }, [userId]);

  const handleCreatorsUpdate = useCallback(() => {
    if (!userId) return;
    refreshSlice("savedCreators", userId).then(() => {
      setData({ ...getPrefetchedData() });
    });
  }, [userId]);

  const handleListsUpdate = useCallback(() => {
    if (!userId) return;
    refreshSlice("lists", userId).then(() => {
      setData({ ...getPrefetchedData() });
    });
  }, [userId]);

  const handleAuthRefresh = useCallback(() => {
    if (!userId) return;
    // Re-fetch everything on auth refresh
    prefetchAllData(userId).then((result) => {
      setData({ ...result });
    });
  }, [userId]);

  useEffect(() => {
    window.addEventListener("vairal-calendar-updated", handleCalendarUpdate);
    window.addEventListener("vairal-creators-updated", handleCreatorsUpdate);
    window.addEventListener("vairal-lists-updated", handleListsUpdate);
    window.addEventListener("vairal-auth-refreshed", handleAuthRefresh);

    return () => {
      window.removeEventListener("vairal-calendar-updated", handleCalendarUpdate);
      window.removeEventListener("vairal-creators-updated", handleCreatorsUpdate);
      window.removeEventListener("vairal-lists-updated", handleListsUpdate);
      window.removeEventListener("vairal-auth-refreshed", handleAuthRefresh);
    };
  }, [handleCalendarUpdate, handleCreatorsUpdate, handleListsUpdate, handleAuthRefresh]);

  return (
    <PrefetchContext.Provider value={data}>{children}</PrefetchContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePrefetchedData(): PrefetchedData {
  return useContext(PrefetchContext);
}
