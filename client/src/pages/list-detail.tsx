import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { usePrefetchedData } from "@/lib/PrefetchProvider";
import { useLocation } from "wouter";
import {
  fetchListMembers,
  removeCreatorFromList,
  addCreatorToList,
  getListById,
  type CreatorListMember,
} from "@/lib/supabase-data";
import { creatorsData, type Creator } from "@/lib/creators-data";
import {
  ArrowLeft,
  Download,
  Trash2,
  Users,
  Search,
  Plus,
  X,
  UserPlus,
} from "lucide-react";

// Build a quick lookup by username
const creatorMap = new Map<string, Creator>();
creatorsData.forEach((c) => creatorMap.set(c.username, c));

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
];
function avatarGrad(u: string) {
  return GRADIENTS[u.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
}

export default function ListDetailPage({ listId }: { listId: string }) {
  const { user } = useAuth();
  const prefetched = usePrefetchedData();
  const [, setLocation] = useLocation();
  const [members, setMembers] = useState<CreatorListMember[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useState(true);

  // Instantly resolve list name from prefetch cache — zero wait
  const cachedList = prefetched.lists.find((l) => l.id === listId);
  const [listName, setListName] = useState(() => cachedList?.name || "");

  // Add creators panel
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addSearch, setAddSearch] = useState("");

  // Update list name from cache if it arrives later
  useEffect(() => {
    const match = prefetched.lists.find((l) => l.id === listId);
    if (match) setListName(match.name);
  }, [prefetched.lists, listId]);

  const loadData = async (silent = false) => {
    if (!silent) setIsMembersLoading(true);
    try {
      // Resolve list name: check prefetch cache first (avoids stale closure on listName state)
      const cached = prefetched.lists.find((l) => l.id === listId);
      if (!cached?.name) {
        const listData = await getListById(listId);
        if (listData) setListName(listData.name);
      }

      const data = await fetchListMembers(listId);
      setMembers(data);
    } catch (err) {
      // Errors already handled inside API functions — this is a safety net
      console.error("[ListDetail] loadData failed:", err);
    } finally {
      // ALWAYS clear loading state, even on failure
      if (!silent) setIsMembersLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [listId]);

  // Set of usernames already in the list
  const memberUsernames = useMemo(() => {
    return new Set(members.map((m) => m.creator_username));
  }, [members]);

  // Enrich members with creator data from the static dataset
  const enrichedMembers = useMemo(() => {
    return members.map((m) => {
      const creator = creatorMap.get(m.creator_username);
      return {
        ...m,
        fullname: creator?.fullname || m.creator_username,
        followers: creator?.followers ?? 0,
        er: creator?.er ?? 0,
        platform: creator?.instagram ? "Instagram" : creator?.youtube ? "YouTube" : creator?.tiktok ? "TikTok" : "Other",
        country: creator?.country || "—",
        city: creator?.city || "",
        email: creator?.email || "",
      };
    });
  }, [members]);

  // Filtered creators for the "Add Creators" search
  const filteredCreatorsToAdd = useMemo(() => {
    const q = addSearch.trim().toLowerCase();
    return creatorsData
      .filter((c) => !memberUsernames.has(c.username)) // exclude already-in-list
      .filter((c) =>
        !q ||
        c.fullname.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        (c.country || "").toLowerCase().includes(q)
      )
      .slice(0, 20); // limit to 20 results for performance
  }, [addSearch, memberUsernames]);

  const [loadingCreator, setLoadingCreator] = useState<string | null>(null);

  const handleRemove = async (username: string) => {
    await removeCreatorFromList(listId, username);
    await loadData(true);
  };

  const handleAddCreator = async (username: string) => {
    if (loadingCreator) return;
    setLoadingCreator(username);
    await addCreatorToList(listId, username);
    await loadData(true);
    setLoadingCreator(null);
  };

  // ─── CSV Export ─────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = ["Username", "Full Name", "Platform", "Followers", "Engagement Rate", "Country", "City", "Email"];
    const rows = enrichedMembers.map((m) => [
      m.creator_username,
      m.fullname,
      m.platform,
      String(m.followers),
      `${m.er}%`,
      m.country,
      m.city,
      m.email,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${listName || "list"}-creators.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // No full-page spinner — render the page structure immediately.
  // List name comes from prefetch cache (instant), members load inline.

  return (
    <div className="p-6 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/dashboard/lists")}
            data-testid="button-back-to-lists"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{listName || "List"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {enrichedMembers.length} creator{enrichedMembers.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAddPanel(!showAddPanel)}
            data-testid="button-toggle-add-creators"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {showAddPanel ? "Close" : "Add Creators"}
          </Button>
          <Button
            onClick={exportCSV}
            disabled={enrichedMembers.length === 0}
            className="gap-2"
            data-testid="button-export-csv"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Add Creators Panel */}
      {showAddPanel && (
        <Card className="p-4 mb-6 bg-card border-border border-blue-500/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              Browse & Add Creators
            </h3>
            <button onClick={() => setShowAddPanel(false)} className="text-muted-foreground hover:text-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search creators by name, username, or country…"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              className="pl-10"
              data-testid="input-add-creator-search"
            />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            {filteredCreatorsToAdd.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {addSearch ? "No matching creators found" : "All creators are already in this list"}
              </p>
            ) : (
              filteredCreatorsToAdd.map((creator) => (
                <div
                  key={creator.username}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ background: avatarGrad(creator.username) }}
                    >
                      {getInitials(creator.fullname)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{creator.fullname}</p>
                      <p className="text-xs text-muted-foreground">
                        @{creator.username} · {fmtNum(creator.followers)} followers
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 ml-2"
                    onClick={() => handleAddCreator(creator.username)}
                    disabled={loadingCreator === creator.username}
                  >
                    {loadingCreator === creator.username ? (
                      <div className="w-3.5 h-3.5 mr-1 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 mr-1" />
                    )}
                    Add
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Members Table */}
      {isMembersLoading ? (
        /* Inline skeleton — page structure is already visible */
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Creator</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Platform</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Followers</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Eng. Rate</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Country</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Added</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4"></th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted animate-pulse shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-muted rounded animate-pulse" />
                          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><div className="h-3.5 w-16 bg-muted rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-3.5 w-12 bg-muted rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-3.5 w-10 bg-muted rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-3.5 w-14 bg-muted rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-3.5 w-16 bg-muted rounded animate-pulse" /></td>
                    <td className="p-4"><div className="h-3.5 w-6 bg-muted rounded animate-pulse" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : enrichedMembers.length === 0 && !showAddPanel ? (
        <Card className="p-12 bg-card border-border text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No creators in this list</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
            Click "Add Creators" above to browse and add creators, or use the Discover page.
          </p>
          <Button variant="outline" onClick={() => setShowAddPanel(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add Creators
          </Button>
        </Card>
      ) : enrichedMembers.length > 0 ? (
        <Card className="bg-card border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Creator</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Platform</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Followers</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Eng. Rate</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Country</th>
                  <th className="text-left text-xs font-medium text-muted-foreground p-4">Added</th>
                  <th className="text-right text-xs font-medium text-muted-foreground p-4"></th>
                </tr>
              </thead>
              <tbody>
                {enrichedMembers.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                          style={{ background: avatarGrad(m.creator_username) }}
                        >
                          {getInitials(m.fullname)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{m.fullname}</p>
                          <p className="text-xs text-muted-foreground">@{m.creator_username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">{m.platform}</td>
                    <td className="p-4 text-sm font-medium text-foreground">{fmtNum(m.followers)}</td>
                    <td className="p-4 text-sm font-medium text-emerald-400">{m.er}%</td>
                    <td className="p-4 text-sm text-muted-foreground">{m.country}</td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(m.added_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => handleRemove(m.creator_username)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
