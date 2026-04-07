import { useMemo, useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { updateCampaign } from "@/models/campaign.types";
import { creatorsData } from "@/models/creators.data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCampaignTracking, upsertDeliverableTracking, DeliverableTracking } from "@/services/api/tracking";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function TrackingPage() {
  const prefetched = usePrefetchedData();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const activeCampaigns = prefetched.campaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT");

  const flatDeliverables = useMemo(() => {
    const arr: any[] = [];
    activeCampaigns.forEach((camp: any) => {
      if (!camp.selectedCreators) return;
      camp.selectedCreators.forEach((c: any) => {
        const creatorObj = creatorsData.find((cr: any) => cr.username === c.creatorId);
        const name = creatorObj?.fullname || creatorObj?.username || c.creatorId;
        (c.deliverables || []).forEach((d: any) => {
          arr.push({
            campaignId: camp.id,
            campaignTitle: camp.name || "Untitled Campaign",
            campaignRef: camp,
            creatorId: c.creatorId,
            creatorName: name,
            deliverable: d,
          });
        });
      });
    });
    return arr;
  }, [activeCampaigns]);

  const [trackingData, setTrackingData] = useState<Record<string, DeliverableTracking>>({});
  const [loadingTracking, setLoadingTracking] = useState(false);

  useEffect(() => {
    if (activeCampaigns.length > 0) {
      setLoadingTracking(true);
      // Fetch tracking data for all campaigns
      Promise.all(activeCampaigns.map((c: any) => getCampaignTracking(c.id)))
        .then(results => {
          const map: Record<string, DeliverableTracking> = {};
          results.flat().forEach(item => {
            map[item.deliverable_id] = item;
          });
          setTrackingData(map);
          setLoadingTracking(false);
        })
        .catch(() => setLoadingTracking(false));
    }
  }, [activeCampaigns.length]);

  const handleUpdate = async (campaignId: string, creatorId: string, deliverableId: string, updates: Partial<DeliverableTracking>) => {
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0, engagements: 0 }));
    const existing = trackingData[deliverableId] || {
      campaign_id: campaignId,
      creator_id: creatorId,
      deliverable_id: deliverableId,
      url: "",
      metrics: defaultMetrics
    };
    
    const nextItem = { ...existing, ...updates };

    setTrackingData(prev => ({ ...prev, [deliverableId]: nextItem }));
    await upsertDeliverableTracking(nextItem);
  };

  const handleMetricUpdate = (campaignId: string, creatorId: string, deliverableId: string, weekIndex: number, field: "views" | "engagements", value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0, engagements: 0 }));
    const existing = trackingData[deliverableId] || {
      campaign_id: campaignId,
      creator_id: creatorId,
      deliverable_id: deliverableId,
      url: "",
      metrics: defaultMetrics
    };

    const newMetrics = [...existing.metrics];
    if (!newMetrics[weekIndex]) {
       newMetrics[weekIndex] = { week: weekIndex + 1, views: 0, engagements: 0 };
    }
    newMetrics[weekIndex] = { ...newMetrics[weekIndex], [field]: numValue };

    handleUpdate(campaignId, creatorId, deliverableId, { metrics: newMetrics });
  };
  
  const handleLiveUrlUpdate = async (campaignRef: any, deliverableId: string, url: string) => {
    if (!campaignRef) return;
    const updatedCreators = campaignRef.selectedCreators?.map((c: any) => {
      if (!c.deliverables?.some((d: any) => d.id === deliverableId)) return c;
      return {
        ...c,
        deliverables: c.deliverables.map((d: any) => 
          d.id === deliverableId ? { ...d, liveUrl: url } : d
        )
      };
    });
    const success = await updateCampaign(campaignRef.id, { selectedCreators: updatedCreators });
    if (success) {
      window.dispatchEvent(new Event("vairal-campaigns-updated"));
    }
  };

  if (activeCampaigns.length === 0) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full gap-4 pt-20">
        <p className="text-muted-foreground">No active campaigns found. Please start a campaign first.</p>
        <Button variant="outline" onClick={() => setLocation("/dashboard/campaigns")}>
          Go to Campaigns
        </Button>
      </div>
    );
  }

  const WEEKS = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`);

  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="flex-none p-4 md:p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setLocation(`/dashboard/campaigns`)}
              className="text-muted-foreground hover:bg-muted"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground items-center flex gap-2">
                  Tracking (8-Week KPI)
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Track KPIs for active campaigns over 8 weeks
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tracker Table */}
      <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        {flatDeliverables.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
            <h3 className="text-lg font-medium text-foreground mb-2">No deliverables found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no deliverables assigned to creators in any active campaign.
            </p>
            <Button onClick={() => setLocation(`/dashboard/campaigns`)}>
              Go to Campaigns
            </Button>
          </div>
        ) : loadingTracking ? (
          <div className="flex flex-col items-center justify-center p-12 mt-8 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading KPI tracking data...</p>
          </div>
        ) : (
          <div className="w-full min-w-[1200px] overflow-visible rounded-xl border border-border shadow-sm bg-card flex flex-col">
            <table className="w-full text-left border-collapse text-sm bg-card table-fixed border-border">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground shadow-sm">
                  <th className="px-4 py-4 font-semibold border-r border-border w-48 shadow-r shadow-border">Campaign</th>
                  <th className="px-4 py-4 font-semibold border-r border-border w-48 shadow-r shadow-border">Creator</th>
                  <th className="px-4 py-4 font-semibold border-r border-border w-48 shadow-r shadow-border">Deliverable</th>
                  <th className="px-4 py-4 font-semibold border-r border-border w-32">Post URL</th>
                  {WEEKS.map(week => (
                    <th key={week} className="px-4 py-4 font-semibold border-r last:border-r-0 border-border text-center overflow-hidden w-40">{week}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatDeliverables.map(item => {
                  const track = trackingData[item.deliverable.id];
                  const url = item.deliverable.liveUrl || track?.url || "";
                  const metrics = track?.metrics || Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0, engagements: 0 }));

                  return (
                  <tr key={item.deliverable.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 border-r border-border align-middle font-medium w-48">
                      <span className="text-[12px] font-semibold text-primary">{item.campaignTitle}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-border align-middle font-medium w-48">
                      <span className="text-[13px]">{item.creatorName}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-border align-middle font-medium w-48">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-normal text-muted-foreground">
                          {item.deliverable.platform} • {item.deliverable.contentType}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.deliverable.contentDetails || "No description"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 border-r border-border align-middle w-32">
                      <Input 
                        placeholder="URL..." 
                        className="h-8 text-xs bg-background/50"
                        value={url}
                        onBlur={(e) => {
                          if (e.target.value !== item.deliverable.liveUrl) {
                            handleLiveUrlUpdate(item.campaignRef, item.deliverable.id, e.target.value);
                          }
                        }}
                        onChange={(e) => handleUpdate(item.campaignId, item.creatorId, item.deliverable.id, { url: e.target.value })}
                      />
                    </td>
                    {WEEKS.map((week, i) => (
                      <td key={i} className="p-2 border-r last:border-r-0 border-border align-middle bg-card w-40">
                        <div className="flex flex-col gap-1">
                          <Input 
                            placeholder="Views" 
                            type="number"
                            value={metrics[i]?.views || ""}
                            onChange={(e) => handleMetricUpdate(item.campaignId, item.creatorId, item.deliverable.id, i, "views", e.target.value)}
                            className="h-6 text-[10px] px-1 placeholder:text-[10px]" 
                          />
                          <Input 
                            placeholder="Engagements" 
                            type="number"
                            value={metrics[i]?.engagements || ""}
                            onChange={(e) => handleMetricUpdate(item.campaignId, item.creatorId, item.deliverable.id, i, "engagements", e.target.value)}
                            className="h-6 text-[10px] px-1 placeholder:text-[10px]" 
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
