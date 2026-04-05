/**
 * Centralized data pre-fetch module.
 *
 * Fires all feature-data fetches in parallel as soon as the user ID is
 * available — BEFORE any page component mounts.  When a page mounts for the
 * first time, it can read the cached results synchronously, eliminating the
 * "UI visible, data pending" gap entirely.
 *
 * IMPORTANT: This module does NOT modify any existing API functions.
 * It simply calls them earlier and caches the results.
 */

import { fetchCalendarSlots } from "./api/calendar";
import { fetchSavedCreators } from "./api/creators";
import { fetchLists, type CreatorList } from "./api/lists";
import { fetchCampaigns } from "./api/campaigns";
import type { CalendarSlot } from "@/models/calendar.types";

// ─── Cache shape ──────────────────────────────────────────────────────────────

export interface PrefetchedData {
  calendarSlots: CalendarSlot[];
  savedCreators: string[];
  lists: CreatorList[];
  campaigns: any[];
}

const EMPTY: PrefetchedData = {
  calendarSlots: [],
  savedCreators: [],
  lists: [],
  campaigns: [],
};

// ─── Module-level cache ───────────────────────────────────────────────────────

let _cache: PrefetchedData = { ...EMPTY };
let _prefetchPromise: Promise<PrefetchedData> | null = null;
let _lastUserId: string | null = null;

/**
 * Fire all data-fetching calls in parallel for the given user.
 * Returns a promise that resolves with the cached data.
 *
 * If the same userId is already being fetched (or was fetched),
 * the existing promise/cache is returned — no duplicate work.
 */
export function prefetchAllData(userId: string): Promise<PrefetchedData> {
  // Already fetching / fetched for this user — return existing promise
  if (_lastUserId === userId && _prefetchPromise) {
    return _prefetchPromise;
  }

  _lastUserId = userId;

  _prefetchPromise = Promise.allSettled([
    fetchCalendarSlots(userId),
    fetchSavedCreators(userId),
    fetchLists(userId),
    fetchCampaigns(userId),
  ]).then(([slotsResult, creatorsResult, listsResult, campaignsResult]) => {
    _cache = {
      calendarSlots:
        slotsResult.status === "fulfilled" ? slotsResult.value : [],
      savedCreators:
        creatorsResult.status === "fulfilled" ? creatorsResult.value : [],
      lists: listsResult.status === "fulfilled" ? listsResult.value : [],
      campaigns:
        campaignsResult.status === "fulfilled" ? campaignsResult.value : [],
    };
    return _cache;
  });

  return _prefetchPromise;
}

/**
 * Read the current prefetched cache synchronously.
 * Pages use this to seed their initial state with zero delay.
 */
export function getPrefetchedData(): PrefetchedData {
  return _cache;
}

/**
 * Refresh a specific slice of the cache.
 * Called by PrefetchProvider when window events fire.
 */
export async function refreshSlice(
  slice: keyof PrefetchedData,
  userId: string
): Promise<void> {
  try {
    switch (slice) {
      case "calendarSlots": {
        _cache.calendarSlots = await fetchCalendarSlots(userId);
        break;
      }
      case "savedCreators": {
        _cache.savedCreators = await fetchSavedCreators(userId);
        break;
      }
      case "lists": {
        _cache.lists = await fetchLists(userId);
        break;
      }
      case "campaigns": {
        _cache.campaigns = await fetchCampaigns(userId);
        break;
      }
    }
  } catch {
    // Refresh failed — keep existing cache, don't break the app
  }
}

/**
 * Invalidate the entire cache (e.g. on logout).
 */
export function clearPrefetchCache(): void {
  _cache = { ...EMPTY };
  _prefetchPromise = null;
  _lastUserId = null;
}
