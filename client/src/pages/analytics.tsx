import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BarChart3, TrendingUp, Eye, Heart } from "lucide-react";
import { useDummyData } from "@/lib/dummy-data";

const metrics = [
  { title: "Total Impressions", value: "12.4M", icon: Eye },
  { title: "Total Engagement", value: "1.8M", icon: Heart },
  { title: "Avg. Engagement Rate", value: "5.2%", icon: TrendingUp },
  { title: "Campaigns Tracked", value: "24", icon: BarChart3 },
];

export default function AnalyticsPage() {
  const { showDummy, setShowDummy } = useDummyData();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-analytics-title">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your campaign performance and creator metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle-analytics" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-analytics"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>

      {showDummy ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.title} className="p-5 bg-card border-border" data-testid={`card-metric-${metric.title.toLowerCase().replace(/\s/g, "-")}`}>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <p className="text-sm text-muted-foreground">{metric.title}</p>
                  <metric.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              </Card>
            ))}
          </div>

          <Card className="p-8 bg-card border-border text-center" data-testid="card-analytics-chart">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Analytics Overview</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Detailed charts and analytics will be displayed here as your campaigns generate data.
            </p>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Total Impressions", "Total Engagement", "Avg. Engagement Rate", "Campaigns Tracked"].map((title) => (
              <Card key={title} className="p-5 bg-card border-border">
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
            <h3 className="text-lg font-semibold text-foreground mb-2">No analytics yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Analytics will appear here once your campaigns start generating data. Toggle "Preview with data" above to see a preview.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
