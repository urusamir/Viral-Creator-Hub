import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { updateCampaign } from "@/models/campaign.types";
import { creatorsData } from "@/models/creators.data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Check, X, Search, Activity, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCampaignTracking, upsertDeliverableTracking, DeliverableTracking } from "@/services/api/tracking";
import { Input } from "@/components/ui/input";

export default function TrackingPage() {
  const prefetched = usePrefetchedData();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const activeCampaigns = prefetched.campaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT");
  
  // This controls the master-detail view
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const filteredCampaigns = useMemo(() => {
    if (!selectedCampaignId) return [];
    return activeCampaigns.filter((c: any) => c.id === selectedCampaignId);
  }, [activeCampaigns, selectedCampaignId]);

  const flatDeliverables = useMemo(() => {
    const arr: any[] = [];
    filteredCampaigns.forEach((camp: any) => {
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
  }, [filteredCampaigns]);

  const [trackingData, setTrackingData] = useState<Record<string, DeliverableTracking>>({});
  const [loadingTracking, setLoadingTracking] = useState(false);

  // Fetch tracking data only for the selected campaign
  useEffect(() => {
    if (selectedCampaignId) {
      setLoadingTracking(true);
      getCampaignTracking(selectedCampaignId)
        .then(results => {
          const map: Record<string, DeliverableTracking> = {};
          results.forEach(item => {
            map[item.deliverable_id] = item;
          });
          setTrackingData(map);
          setLoadingTracking(false);
        })
        .catch(() => setLoadingTracking(false));
    }
  }, [selectedCampaignId]);

  const saveTrackingData = async (deliverableId: string, customData?: DeliverableTracking) => {
    const data = customData || trackingData[deliverableId];
    if (data) {
      await upsertDeliverableTracking(data);
    }
  };

  const updateLocalTracking = (campaignId: string, creatorId: string, deliverableId: string, updates: Partial<DeliverableTracking>) => {
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));
    const existing = trackingData[deliverableId] || {
      campaign_id: campaignId,
      creator_id: creatorId,
      deliverable_id: deliverableId,
      url: "",
      metrics: defaultMetrics
    };
    
    const nextItem = { ...existing, ...updates };
    setTrackingData(prev => ({ ...prev, [deliverableId]: nextItem }));
    return nextItem;
  };

  const handleToggleKPI = (campaignId: string, creatorId: string, deliverableId: string, weekIndex: number) => {
    const defaultMetrics = Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));
    const existing = trackingData[deliverableId] || {
      campaign_id: campaignId,
      creator_id: creatorId,
      deliverable_id: deliverableId,
      url: "",
      metrics: defaultMetrics
    };

    const newMetrics = [...existing.metrics];
    if (!newMetrics[weekIndex]) {
       newMetrics[weekIndex] = { week: weekIndex + 1, views: 0 };
    }
    const currentValue = newMetrics[weekIndex].views;
    // Toggle between 1 (Check) and 0 (Cross)
    newMetrics[weekIndex] = { ...newMetrics[weekIndex], views: currentValue === 1 ? 0 : 1 };

    const updated = updateLocalTracking(campaignId, creatorId, deliverableId, { metrics: newMetrics });
    saveTrackingData(deliverableId, updated); // Save immediately
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

  const WEEKS = Array.from({ length: 8 }, (_, i) => `Week ${i + 1}`);
  const [searchQuery, setSearchQuery] = useState("");

  // ====== MASTER VIEW ======
  if (!selectedCampaignId) {
    const displayedCampaigns = activeCampaigns.filter(c => 
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.brand?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="flex flex-col flex-1 h-screen overflow-hidden bg-background">
        <div className="flex-none p-4 md:p-6 border-b border-border bg-card">
          <div className="flex flex-col md:flex-row md:items-center justify-between max-w-[1600px] mx-auto w-full gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/40 dark:text-blue-400">
                  <Activity className="w-5 h-5" />
                </div>
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground items-center flex gap-2">
                  Tracking Hub
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Select a campaign to track creator 8-week KPIs
              </p>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                className="pl-9 h-10 w-full" 
                placeholder="Search campaigns..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto space-y-4">
          {displayedCampaigns.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
              <h3 className="text-lg font-medium text-foreground mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                There are no active or draft campaigns matching your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedCampaigns.map((camp: any) => {
                const totalDelivs = camp.selectedCreators?.reduce((acc: number, creator: any) => acc + (creator.deliverables?.length || 0), 0) || 0;
                
                return (
                  <div 
                    key={camp.id} 
                    className="flex flex-col p-5 bg-card border border-border rounded-xl cursor-pointer hover:border-primary/50 transition-colors shadow-sm group"
                    onClick={() => setSelectedCampaignId(camp.id)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground line-clamp-1">{camp.name || "Untitled"}</h3>
                        <p className="text-sm text-muted-foreground">{camp.brand || "No Brand"}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                         <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground">Deliverables</p>
                          <p className="text-sm font-medium">{totalDelivs}</p>
                        </div>
                        <div>
                           <p className="text-xs text-muted-foreground">Creators</p>
                           <p className="text-sm font-medium">{camp.selectedCreators?.length || 0}</p>
                        </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ====== DETAIL VIEW ======
  return (
    <div className="flex flex-col flex-1 h-screen overflow-hidden bg-background">
      <div className="flex-none p-4 md:p-6 border-b border-border bg-card">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto w-full gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setSelectedCampaignId(null)} /* Returns to Master view! */
              className="text-muted-foreground hover:bg-muted shrink-0"
              title="Back to Campaigns"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground items-center flex gap-2 line-clamp-1">
                  8-Week KPI Tracking
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                {filteredCampaigns[0]?.name || "Untitled Campaign"} • {filteredCampaigns[0]?.brand || "No Brand"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        {flatDeliverables.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
            <h3 className="text-lg font-medium text-foreground mb-2">No deliverables found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no deliverables assigned to creators in this campaign.
            </p>
            <Button onClick={() => setLocation(`/dashboard/campaigns/${selectedCampaignId}/edit?step=3`)}>
              Add Deliverables
            </Button>
          </div>
        ) : loadingTracking ? (
          <div className="flex flex-col items-center justify-center p-12 mt-8 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Loading KPI tracking data...</p>
          </div>
        ) : (
          <div className="w-full min-w-[1200px] overflow-visible rounded-xl border border-border shadow-sm bg-card flex flex-col pb-4">
            <table className="w-full text-left border-collapse text-sm bg-card table-fixed border-border">
              <thead className="sticky top-0 z-10">
                <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground shadow-sm">
                  <th className="px-4 py-4 font-semibold border-r border-border w-56 shadow-r shadow-border">Creator</th>
                  <th className="px-4 py-4 font-semibold border-r border-border w-56 shadow-r shadow-border">Deliverable</th>
                  <th className="px-4 py-4 font-semibold border-r border-border w-40">Post URL</th>
                  {WEEKS.map(week => (
                    <th key={week} className="px-4 py-4 font-semibold border-r last:border-r-0 border-border text-center overflow-hidden w-20">{week}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatDeliverables.map(item => {
                  const track = trackingData[item.deliverable.id];
                  const url = item.deliverable.liveUrl || track?.url || "";
                  const metrics = track?.metrics || Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));

                  return (
                  <tr key={item.deliverable.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3 border-r border-border align-middle font-medium w-56 truncate">
                      <span className="text-[13px]">{item.creatorName}</span>
                    </td>
                    <td className="px-4 py-3 border-r border-border align-middle font-medium w-56">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[11px] font-normal text-muted-foreground truncate">
                          {item.deliverable.platform} • {item.deliverable.contentType}
                        </span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1 break-all">
                          {item.deliverable.contentDetails || "No description"}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 border-r border-border align-middle w-40">
                      <Input 
                        placeholder="URL..." 
                        className="h-8 text-xs bg-background/50"
                        value={url}
                        onBlur={(e) => {
                          if (e.target.value !== item.deliverable.liveUrl) {
                            handleLiveUrlUpdate(item.campaignRef, item.deliverable.id, e.target.value);
                          }
                          saveTrackingData(item.deliverable.id);
                        }}
                        onChange={(e) => updateLocalTracking(item.campaignId, item.creatorId, item.deliverable.id, { url: e.target.value })}
                      />
                    </td>
                    {WEEKS.map((week, i) => {
                      const isChecked = metrics[i]?.views === 1;
                      return (
                      <td key={i} className="p-2 border-r last:border-r-0 border-border align-middle bg-card w-20 text-center">
                        <button
                          onClick={() => handleToggleKPI(item.campaignId, item.creatorId, item.deliverable.id, i)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 border shadow-sm ${
                            isChecked 
                              ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400" 
                              : "bg-muted hover:bg-muted/80 text-muted-foreground border-border"
                          }`}
                          title={isChecked ? "KPI Met" : "KPI Not Met"}
                        >
                          {isChecked ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                      </td>
                    )})}
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
