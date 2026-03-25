import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Megaphone,
  Plus,
  CheckCircle2,
  Circle,
  Power,
  PowerOff,
  Search,
  X,
  ExternalLink,
} from "lucide-react";
import { SiInstagram, SiYoutube, SiTiktok, SiLinkedin, SiSnapchat } from "react-icons/si";
import { SiX as SiXIcon } from "react-icons/si";
import {
  loadCampaigns,
  updateCampaign,
  mockCampaigns,
  type Campaign,
} from "@/lib/campaigns";
import { useToast } from "@/hooks/use-toast";

type SortKey = "recently_created" | "recently_updated" | "latest_start";
type Tab = "all" | "active" | "drafts" | "finished";

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: SiInstagram,
  YouTube: SiYoutube,
  TikTok: SiTiktok,
  "Twitter/X": SiXIcon,
  LinkedIn: SiLinkedin,
  Snapchat: SiSnapchat,
};

const platformColors: Record<string, string> = {
  Instagram: "text-pink-500",
  YouTube: "text-red-500",
  TikTok: "text-foreground",
  "Twitter/X": "text-foreground",
  LinkedIn: "text-blue-600",
  Snapchat: "text-yellow-400",
};

function PlatformIcon({ platform, className = "w-3.5 h-3.5" }: { platform: string; className?: string }) {
  const Icon = platformIcons[platform];
  if (!Icon) return null;
  return <Icon className={`${className} ${platformColors[platform] || ""}`} />;
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Bulk actions per tab
const BULK_ACTIONS: Record<Tab, { label: string; status: Campaign["status"]; variant: "default" | "outline" }[]> = {
  all: [
    { label: "Make Active", status: "PUBLISHED", variant: "default" },
    { label: "Move to Draft", status: "DRAFT", variant: "outline" },
    { label: "Mark Finished", status: "FINISHED", variant: "outline" },
  ],
  active: [
    { label: "Move to Draft", status: "DRAFT", variant: "outline" },
    { label: "Mark Finished", status: "FINISHED", variant: "outline" },
  ],
  drafts: [
    { label: "Make Active", status: "PUBLISHED", variant: "default" },
  ],
  finished: [
    { label: "Move to Draft", status: "DRAFT", variant: "outline" },
    { label: "Make Active", status: "PUBLISHED", variant: "default" },
  ],
};

export default function CampaignsPage() {
  const [showDummy, setShowDummy] = useState(false);
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recently_created");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const [campaigns, setCampaigns] = useState<Campaign[]>(() => loadCampaigns());

  const refreshCampaigns = useCallback(() => {
    setCampaigns(loadCampaigns());
  }, []);

  // Clear selection when tab changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeTab]);

  const sortFn = useCallback(
    (a: Campaign, b: Campaign) => {
      if (sortKey === "recently_updated") return b.updatedAt.localeCompare(a.updatedAt);
      if (sortKey === "latest_start") return (b.startDate || "").localeCompare(a.startDate || "");
      return b.createdAt.localeCompare(a.createdAt);
    },
    [sortKey]
  );

  const applyFilters = useCallback(
    (list: Campaign[]) => {
      const q = search.trim().toLowerCase();
      return list.filter((c) => !q || c.name.toLowerCase().includes(q)).sort(sortFn);
    },
    [search, sortFn]
  );

  // User data
  const userAll = useMemo(() => applyFilters(campaigns), [campaigns, applyFilters]);
  const userActive = useMemo(() => applyFilters(campaigns.filter((c) => c.status === "PUBLISHED")), [campaigns, applyFilters]);
  const userDrafts = useMemo(() => applyFilters(campaigns.filter((c) => c.status === "DRAFT")), [campaigns, applyFilters]);
  const userFinished = useMemo(() => applyFilters(campaigns.filter((c) => c.status === "FINISHED")), [campaigns, applyFilters]);

  // Mock data
  const mockAll = useMemo(() => applyFilters(mockCampaigns), [applyFilters]);
  const mockActive = useMemo(() => applyFilters(mockCampaigns.filter((c) => c.status === "PUBLISHED")), [applyFilters]);
  const mockDrafts = useMemo(() => applyFilters(mockCampaigns.filter((c) => c.status === "DRAFT")), [applyFilters]);
  const mockFinished = useMemo(() => applyFilters(mockCampaigns.filter((c) => c.status === "FINISHED")), [applyFilters]);

  const displayed = {
    all: showDummy ? mockAll : userAll,
    active: showDummy ? mockActive : userActive,
    drafts: showDummy ? mockDrafts : userDrafts,
    finished: showDummy ? mockFinished : userFinished,
  };

  const tabData = displayed[activeTab];

  // --- Row selection ---
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  // --- Bulk action ---
  const applyBulkStatus = useCallback(
    (newStatus: Campaign["status"]) => {
      if (showDummy) return;
      selectedIds.forEach((id) => updateCampaign(id, { status: newStatus }));
      refreshCampaigns();
      clearSelection();
      const label =
        newStatus === "PUBLISHED" ? "Active" : newStatus === "DRAFT" ? "Draft" : "Finished";
      toast({ title: `${selectedIds.size} campaign(s) moved to ${label}` });
    },
    [showDummy, selectedIds, refreshCampaigns, clearSelection, toast]
  );

  // --- Single live toggle ---
  const toggleLive = useCallback(
    (c: Campaign) => {
      if (showDummy) return;
      const next = c.status === "PUBLISHED" ? "DRAFT" : c.status === "DRAFT" ? "PUBLISHED" : "DRAFT";
      updateCampaign(c.id, { status: next });
      refreshCampaigns();
      toast({ title: next === "PUBLISHED" ? "Campaign is now live" : next === "DRAFT" ? "Campaign moved to drafts" : "" });
    },
    [showDummy, refreshCampaigns, toast]
  );

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "all", label: "All", count: (showDummy ? mockAll : userAll).length },
    { key: "active", label: "Active", count: (showDummy ? mockActive : userActive).length },
    { key: "drafts", label: "Drafts", count: (showDummy ? mockDrafts : userDrafts).length },
    { key: "finished", label: "Finished", count: (showDummy ? mockFinished : userFinished).length },
  ];

  const bulkActions = BULK_ACTIONS[activeTab];
  const hasSelection = selectedIds.size > 0;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full" data-testid="page-campaigns">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-campaigns-title">
            Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your influencer campaigns
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Label htmlFor="dummy-toggle-campaigns" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-campaigns"
            checked={showDummy}
            onCheckedChange={setShowDummy}
          />
          <Button onClick={() => navigate("/dashboard/campaigns/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create campaign
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-4 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            data-testid={`tab-${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === tab.key
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  activeTab === tab.key
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Search + Sort toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns by title"
            className="pl-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-44 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recently_created">Recently created</SelectItem>
            <SelectItem value="recently_updated">Recently updated</SelectItem>
            <SelectItem value="latest_start">Latest start date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {hasSelection && !showDummy && (
        <div className="flex items-center gap-3 mb-3 px-4 py-2.5 rounded-lg bg-muted/60 border border-border animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selected
          </span>
          <div className="h-4 w-px bg-border" />
          {bulkActions.map((action) => (
            <button
              key={action.status}
              onClick={() => applyBulkStatus(action.status)}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                action.variant === "default"
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border border-border text-foreground hover:bg-muted"
              }`}
            >
              {action.label}
            </button>
          ))}
          <button
            onClick={clearSelection}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table or empty state */}
      {tabData.length > 0 ? (
        <Card className="p-5">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3 w-8" />
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Goal</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platforms</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date Range</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3" />
                </tr>
              </thead>
              <tbody>
                {tabData.map((c) => {
                  const isSelected = selectedIds.has(c.id);
                  return (
                    <tr
                      key={c.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                      }`}
                    >
                      {/* Select circle */}
                      <td className="py-3 pr-2">
                        <button
                          onClick={() => !showDummy && toggleSelect(c.id)}
                          disabled={showDummy}
                          title={isSelected ? "Deselect" : "Select campaign"}
                          className="transition-colors disabled:opacity-40"
                        >
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-primary" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td
                        className="py-3 text-sm text-foreground font-medium cursor-pointer hover:text-primary transition-colors"
                        onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                      >
                        {c.name}
                      </td>

                      {/* Goal */}
                      <td className="py-3 text-sm text-muted-foreground">{c.goal || "—"}</td>

                      {/* Platforms */}
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          {c.platforms.map((p) => (
                            <PlatformIcon key={p} platform={p} />
                          ))}
                        </div>
                      </td>

                      {/* Date range */}
                      <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {c.startDate && c.endDate
                          ? `${formatDate(c.startDate)} – ${formatDate(c.endDate)}`
                          : c.startDate
                          ? `From ${formatDate(c.startDate)}`
                          : "—"}
                      </td>

                      {/* Live toggle — replaces Status badge */}
                      <td className="py-3">
                        <button
                          onClick={() => toggleLive(c)}
                          disabled={showDummy}
                          title={
                            c.status === "PUBLISHED"
                              ? "Move to Draft"
                              : c.status === "DRAFT"
                              ? "Make Live"
                              : "Restore to Draft"
                          }
                          className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                            c.status === "PUBLISHED"
                              ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                              : c.status === "FINISHED"
                              ? "border-sky-500/30 text-sky-400 bg-sky-500/10 hover:bg-sky-500/20"
                              : "border-border text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {c.status === "PUBLISHED" ? (
                            <><Power className="w-3 h-3" /> Live</>
                          ) : c.status === "FINISHED" ? (
                            <><CheckCircle2 className="w-3 h-3" /> Finished</>
                          ) : (
                            <><PowerOff className="w-3 h-3" /> Draft</>
                          )}
                        </button>
                      </td>

                      {/* Open */}
                      <td className="py-3">
                        <button
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => navigate(`/dashboard/campaigns/${c.id}`)}
                          title="Open campaign"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState tab={activeTab} onCreateClick={() => navigate("/dashboard/campaigns/new")} />
      )}
    </div>
  );
}

function EmptyState({ tab, onCreateClick }: { tab: Tab; onCreateClick: () => void }) {
  const messages: Record<Tab, { title: string; body: string }> = {
    all: {
      title: "No campaigns yet",
      body: "Create your first campaign to get started.",
    },
    active: {
      title: "No active campaigns",
      body: 'Select a draft campaign and use "Make Active" to publish it here.',
    },
    drafts: {
      title: "No drafts",
      body: "Campaigns you create or take offline will appear here.",
    },
    finished: {
      title: "No finished campaigns",
      body: "Select campaigns and use "Mark Finished" to archive them here.",
    },
  };

  const { title, body } = messages[tab];

  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
        <Megaphone className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">{body}</p>
      {tab !== "finished" && (
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Create campaign
        </Button>
      )}
    </Card>
  );
}
