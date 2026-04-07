import { useMemo, useState, useEffect } from "react";
import { useLocation } from "wouter";
import { formatDisplayDate } from "@/utils/format";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useDummyData } from "@/providers/dummy-data.provider";
import { updateCampaign, mockCampaigns, mockTrackingData } from "@/models/campaign.types";
import { creatorsData } from "@/models/creators.data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Check, X, Search, Activity, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCampaignTracking, upsertDeliverableTracking, DeliverableTracking } from "@/services/api/tracking";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// --- START Track KPI Cell Component ---
function KPIWeekCell({ initialViews, onSave }: { initialViews: number, onSave: (val: number) => void }) {
  const [val, setVal] = useState(initialViews.toString());
  const [isSaved, setIsSaved] = useState(true);

  useEffect(() => {
    if (isSaved) {
      setVal(initialViews.toString());
    }
  }, [initialViews, isSaved]);

  return (
    <div className="flex items-center gap-1 w-full justify-center">
      <Input
        value={val}
        onChange={(e) => {
          // Allow only numbers
          const newVal = e.target.value.replace(/[^0-9]/g, '');
          setVal(newVal);
          setIsSaved(false);
        }}
        className="w-16 h-8 text-xs bg-black/40 border-white/10 text-white text-center rounded-md px-1"
        type="text"
        inputMode="numeric"
        placeholder="0"
      />
      {!isSaved && (
        <button
          onClick={() => {
            onSave(Number(val) || 0);
            setIsSaved(true);
          }}
          className="text-emerald-400 hover:text-emerald-300 rounded-full hover:bg-emerald-500/10 p-1 transition-colors"
          title="Save Views"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
// --- END Track KPI Cell Component ---

export default function TrackingPage() {
  const prefetched = usePrefetchedData();
  const { showDummy, setShowDummy } = useDummyData();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const realCampaigns = prefetched.campaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT");
  const activeCampaigns = showDummy ? mockCampaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT") : realCampaigns;
  
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
      if (showDummy) {
        setTrackingData(mockTrackingData);
        setLoadingTracking(false);
        return;
      }
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
  }, [selectedCampaignId, showDummy]);

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

  const handleUpdateKPI = (campaignId: string, creatorId: string, deliverableId: string, weekIndex: number, views: number) => {
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
    
    newMetrics[weekIndex] = { ...newMetrics[weekIndex], views };

    const updated = updateLocalTracking(campaignId, creatorId, deliverableId, { metrics: newMetrics });
    saveTrackingData(deliverableId, updated); 
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
        <div className="flex-none p-6 md:p-8 border-b border-white/5 bg-background/50 backdrop-blur-xl relative z-10 w-full mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 md:bg-none pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between max-w-[1600px] mx-auto w-full gap-4 relative z-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                  <Activity className="w-5 h-5" />
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white items-center flex gap-2">
                  Tracking Hub
                </h1>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Select a campaign to track creator 8-week views
              </p>
            </div>
            
            <div className="flex items-center gap-4 relative w-full md:w-auto">
              <div className="flex items-center space-x-2 bg-muted/30 px-3 py-1.5 rounded-md border border-border/50">
                <Switch
                  id="dummy-data-tracking"
                  checked={showDummy}
                  onCheckedChange={setShowDummy}
                />
                <Label htmlFor="dummy-data-tracking" className="text-secondary-foreground text-xs font-medium cursor-pointer">
                  Preview with data
                </Label>
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
                    className="flex flex-col p-6 glass-card border border-white/5 rounded-2xl cursor-pointer hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                    onClick={() => setSelectedCampaignId(camp.id)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-emerald-500/0 group-hover:from-blue-500/5 group-hover:to-emerald-500/5 transition-colors duration-500" />
                    <div className="relative z-10 flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-bold text-lg text-white line-clamp-1">{camp.name || "Untitled"}</h3>
                        <p className="text-sm text-blue-400 font-medium mt-0.5">{camp.brand || "No Brand"}</p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                         <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                    <div className="relative z-10 mt-auto grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Deliverables</p>
                          <p className="text-lg font-semibold text-white">{totalDelivs}</p>
                        </div>
                        <div>
                           <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Creators</p>
                           <p className="text-lg font-semibold text-white">{camp.selectedCreators?.length || 0}</p>
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
      <div className="flex-none p-6 md:p-8 border-b border-white/5 bg-background/50 backdrop-blur-xl relative z-10 w-full mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-transparent to-emerald-500/5 md:bg-none pointer-events-none" />
        <div className="flex items-center justify-between max-w-[1600px] mx-auto w-full gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => setSelectedCampaignId(null)} /* Returns to Master view! */
              className="text-muted-foreground hover:bg-white/10 shrink-0 rounded-full border-white/10"
              title="Back to Campaigns"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white items-center flex gap-2 line-clamp-1">
                  8-Week Campaign Tracking
                </h1>
              </div>
              <p className="text-sm font-medium text-blue-400 mt-1 line-clamp-1">
                {filteredCampaigns[0]?.name || "Untitled Campaign"} • <span className="text-muted-foreground">{filteredCampaigns[0]?.brand || "No Brand"}</span>
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
            <p>Loading campaign tracking data...</p>
          </div>
        ) : (
          <div className="w-full min-w-[1200px] overflow-visible rounded-2xl border border-white/5 shadow-2xl glass-card flex flex-col pb-4">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-black/40 backdrop-blur-md border-b border-white/5 text-[11px] uppercase tracking-wider text-muted-foreground shadow-sm">
                  <th className="px-5 py-5 font-semibold text-white border-r border-white/5 w-56">Creator</th>
                  <th className="px-5 py-5 font-semibold text-white border-r border-white/5 w-56">Deliverable</th>
                  <th className="px-5 py-5 font-semibold text-white border-r border-white/5 w-32">Scheduled</th>
                  <th className="px-5 py-5 font-semibold text-white border-r border-white/5 w-48">Post URL</th>
                  {WEEKS.map(week => (
                    <th key={week} className="px-4 py-5 font-semibold text-white border-r last:border-r-0 border-white/5 text-center overflow-hidden w-28">{week}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatDeliverables.map(item => {
                  const track = trackingData[item.deliverable.id];
                  const url = item.deliverable.liveUrl || track?.url || "";
                  const metrics = track?.metrics || Array.from({ length: 8 }).map((_, i) => ({ week: i + 1, views: 0 }));

                  // Try to find a scheduled date (goLiveOn parameter typically used in Deliverable execution)
                  const scheduledDate = item.deliverable.goLiveOn 
                    ? formatDisplayDate(item.deliverable.goLiveOn)
                    : "-";

                  return (
                  <tr key={item.deliverable.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 border-r border-white/5 align-middle font-medium w-56 truncate">
                      <span className="text-[13px] text-white">{item.creatorName}</span>
                    </td>
                    <td className="px-5 py-4 border-r border-white/5 align-middle font-medium w-56">
                      <div className="flex flex-col gap-1 overflow-hidden">
                        <span className="text-[11px] font-medium text-blue-300 uppercase tracking-wide truncate">
                          {item.deliverable.platform} • {item.deliverable.contentType}
                        </span>
                        <span className="text-[12px] text-muted-foreground line-clamp-1 break-all">
                          {item.deliverable.contentDetails || "No description"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 border-r border-white/5 align-middle w-32">
                      <span className="text-[12px] text-muted-foreground">
                        {scheduledDate}
                      </span>
                    </td>
                    <td className="px-3 py-4 border-r border-white/5 align-middle w-48">
                      <Input 
                        placeholder="Paste URL..." 
                        className="h-9 text-xs bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 rounded-lg focus-visible:ring-blue-500"
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
                      const views = metrics[i]?.views || 0;
                      return (
                      <td key={i} className="px-2 py-4 border-r last:border-r-0 border-white/5 align-middle w-28 text-center">
                        <KPIWeekCell 
                           initialViews={views}
                           onSave={(newViews) => handleUpdateKPI(item.campaignId, item.creatorId, item.deliverable.id, i, newViews)}
                        />
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

