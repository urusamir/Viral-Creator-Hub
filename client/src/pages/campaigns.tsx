import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Megaphone, Plus } from "lucide-react";
import { SiInstagram, SiYoutube, SiTiktok, SiLinkedin, SiSnapchat } from "react-icons/si";
import { SiX as SiXIcon } from "react-icons/si";
import { useDummyData } from "@/lib/dummy-data";
import { loadCampaigns, mockCampaigns, type Campaign } from "@/lib/campaigns";

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

function formatUpdatedAt(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function CampaignsPage() {
  const { showDummy, setShowDummy } = useDummyData();
  const [, navigate] = useLocation();

  const userCampaigns = useMemo(() => loadCampaigns(), []);
  const hasUserCampaigns = userCampaigns.length > 0;

  const displayCampaigns = showDummy ? mockCampaigns : userCampaigns;

  const handleRowClick = (campaign: Campaign) => {
    if (campaign.id.startsWith("mock-")) return;
    if (campaign.status === "DRAFT") {
      navigate(`/dashboard/campaigns/${campaign.id}?step=${campaign.lastStep}`);
    } else {
      navigate(`/dashboard/campaigns/${campaign.id}`);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full" data-testid="page-campaigns">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-campaigns-title">
            Campaigns
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your influencer campaigns
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Label htmlFor="dummy-toggle-campaigns" className="text-sm text-muted-foreground" data-testid="label-dummy-toggle">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-campaigns"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
          <Button
            onClick={() => navigate("/dashboard/campaigns/new")}
            data-testid="button-create-campaign"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create campaign
          </Button>
        </div>
      </div>

      {displayCampaigns.length > 0 ? (
        <CampaignsTable campaigns={displayCampaigns} onRowClick={handleRowClick} isMock={showDummy} />
      ) : (
        <Card className="p-12 text-center" data-testid="card-empty-state">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Megaphone className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
            Create your first campaign to start collaborating with influencers. Toggle "Preview with data" to see how your campaigns list will look.
          </p>
          <Button
            onClick={() => navigate("/dashboard/campaigns/new")}
            data-testid="button-create-campaign-empty"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create campaign
          </Button>
        </Card>
      )}
    </div>
  );
}

function CampaignsTable({ campaigns, onRowClick, isMock }: { campaigns: Campaign[]; onRowClick: (c: Campaign) => void; isMock: boolean }) {
  return (
    <Card className="p-5" data-testid="card-campaigns-table">
      <h3 className="text-lg font-semibold text-foreground mb-4">All Campaigns</h3>
      <div className="overflow-x-auto">
        <table className="w-full" data-testid="table-campaigns">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Goal</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platforms</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date Range</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr
                key={c.id}
                className={`border-b border-border last:border-0 ${!isMock ? "cursor-pointer hover-elevate" : ""}`}
                onClick={() => onRowClick(c)}
                data-testid={`row-campaign-${c.id}`}
              >
                <td className="py-3 text-sm text-foreground font-medium">{c.name}</td>
                <td className="py-3 text-sm text-muted-foreground">{c.goal}</td>
                <td className="py-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {c.platforms.map((p) => (
                      <PlatformIcon key={p} platform={p} />
                    ))}
                  </div>
                </td>
                <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {c.startDate && c.endDate
                    ? `${formatDate(c.startDate)} - ${formatDate(c.endDate)}`
                    : c.startDate
                      ? `From ${formatDate(c.startDate)}`
                      : "--"}
                </td>
                <td className="py-3">
                  <Badge
                    variant={c.status === "DRAFT" ? "secondary" : "default"}
                    className={c.status === "PUBLISHED" ? "bg-green-500/15 text-green-500 border-green-500/20" : ""}
                    data-testid={`badge-status-${c.id}`}
                  >
                    {c.status === "DRAFT" ? "Draft" : "Published"}
                  </Badge>
                </td>
                <td className="py-3 text-sm text-muted-foreground whitespace-nowrap">
                  {formatUpdatedAt(c.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
