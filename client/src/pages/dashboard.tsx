import { Card } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const dummyStats = [
  { title: "Total Campaigns", value: "24", change: "+12%", up: true, icon: BarChart3 },
  { title: "Active Creators", value: "156", change: "+8%", up: true, icon: Users },
  { title: "Total Spend", value: "$48,250", change: "+23%", up: true, icon: DollarSign },
  { title: "Avg. ROI", value: "340%", change: "+5%", up: true, icon: TrendingUp },
];

const dummyCampaigns = [
  { name: "Summer Collection Launch", status: "Active", creators: 12, budget: "$8,500", reach: "2.4M" },
  { name: "Product Review Series", status: "Active", creators: 8, budget: "$5,200", reach: "1.8M" },
  { name: "Holiday Gift Guide", status: "Draft", creators: 0, budget: "$12,000", reach: "-" },
  { name: "Brand Awareness Q1", status: "Completed", creators: 15, budget: "$6,800", reach: "3.1M" },
];

const dummyTopCreators = [
  { name: "Alex Johnson", platform: "Instagram", followers: "520K", engagement: "4.8%" },
  { name: "Maria Garcia", platform: "TikTok", followers: "1.2M", engagement: "6.2%" },
  { name: "James Wilson", platform: "YouTube", followers: "890K", engagement: "3.9%" },
];

export default function DashboardPage() {
  const [showDummy, setShowDummy] = useState(false);
  const { user } = useAuth();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back{user?.companyName ? `, ${user.companyName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle" className="text-sm text-muted-foreground" data-testid="label-dummy-toggle">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>

      {showDummy ? (
        <DummyDataView />
      ) : (
        <EmptyStateView />
      )}
    </div>
  );
}

function DummyDataView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dummyStats.map((stat) => (
          <Card key={stat.title} className="p-5 bg-card border-border" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-sm text-muted-foreground">{stat.title}</p>
              <stat.icon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <div className="flex items-center gap-1 mt-1">
              {stat.up ? (
                <ArrowUpRight className="w-3 h-3 text-green-500" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-red-500" />
              )}
              <span className={`text-xs ${stat.up ? "text-green-500" : "text-red-500"}`}>{stat.change}</span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5 bg-card border-border" data-testid="card-campaigns-table">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Campaigns</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Creators</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Budget</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Reach</th>
                </tr>
              </thead>
              <tbody>
                {dummyCampaigns.map((c, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 text-sm text-foreground">{c.name}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center justify-center text-xs font-semibold px-3 py-1 rounded-full min-w-[80px] ${
                          c.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : c.status === "Draft"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted-foreground">{c.creators}</td>
                    <td className="py-3 text-sm text-muted-foreground">{c.budget}</td>
                    <td className="py-3 text-sm text-muted-foreground">{c.reach}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5 bg-card border-border" data-testid="card-top-creators">
          <h3 className="text-lg font-semibold text-foreground mb-4">Top Creators</h3>
          <div className="space-y-4">
            {dummyTopCreators.map((creator, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                  {creator.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                  <p className="text-xs text-muted-foreground">{creator.platform} · {creator.followers}</p>
                </div>
                <span className="text-xs text-green-500 font-medium">{creator.engagement}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyStateView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {["Total Campaigns", "Active Creators", "Total Spend", "Avg. ROI"].map((title) => (
          <Card key={title} className="p-5 bg-card border-border" data-testid={`card-stat-empty-${title.toLowerCase().replace(/\s/g, "-")}`}>
            <p className="text-sm text-muted-foreground mb-3">{title}</p>
            <p className="text-2xl font-bold text-foreground">--</p>
            <p className="text-xs text-muted-foreground mt-1">No data yet</p>
          </Card>
        ))}
      </div>

      <Card className="p-12 bg-card border-border text-center" data-testid="card-empty-state">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No campaigns yet</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          Start by discovering creators and launching your first campaign. Toggle "Preview with data" above to see how your dashboard will look with active campaigns.
        </p>
      </Card>
    </div>
  );
}
