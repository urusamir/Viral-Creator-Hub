import { useMemo } from "react";
import { CampaignV2 } from "@/models/campaigns-v2.types";
import { mockCreatorResults } from "@/models/campaign.types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, PlayCircle, BarChart3, CheckCircle2 } from "lucide-react";

interface StepProps {
  campaign: CampaignV2;
  updateData?: (data: Partial<CampaignV2>) => void;
  errors?: Record<string, string>;
}

export function Step4Summary({ campaign }: StepProps) {
  const { deliverables, selectedCreators } = campaign;

  // Derive metrics algorithmically based on deliverables
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    
    let totalAssigned = deliverables.reduce((sum, d) => sum + d.quantity, 0);
    let totalSubmitted = 0;
    
    // Platform-Format Matrix
    const platformStats: Record<string, Record<string, { total: number; submitted: number }>> = {};
    
    // Creator Breakdown
    const creatorStats: Record<string, { name: string; handle: string; total: number; submitted: number; platforms: Set<string> }> = {};

    // Alerts
    const shootOverdue: any[] = [];
    const goLiveOverdue: any[] = [];

    deliverables.forEach(d => {
      const isSubmitted = ["uploaded", "revisions_requested", "approved", "live"].includes(d.status);
      const isLive = d.status === "live";

      if (isSubmitted) totalSubmitted += d.quantity;

      // Ensure Platform-Format init
      if (!platformStats[d.platform]) platformStats[d.platform] = {};
      if (!platformStats[d.platform][d.contentType]) {
        platformStats[d.platform][d.contentType] = { total: 0, submitted: 0 };
      }
      
      platformStats[d.platform][d.contentType].total += d.quantity;
      if (isSubmitted) platformStats[d.platform][d.contentType].submitted += d.quantity;

      // Creator init
      if (!creatorStats[d.creatorId]) {
        const cDetails = mockCreatorResults.find(m => m.id === d.creatorId);
        creatorStats[d.creatorId] = {
          name: cDetails?.name || "Unknown",
          handle: cDetails?.handle || "@unknown",
          total: 0,
          submitted: 0,
          platforms: new Set(),
        };
      }
      
      creatorStats[d.creatorId].total += d.quantity;
      if (isSubmitted) creatorStats[d.creatorId].submitted += d.quantity;
      creatorStats[d.creatorId].platforms.add(d.platform);

      // Overdue Checks
      if (d.dueDate && d.dueDate < today && !isSubmitted) {
        shootOverdue.push(d);
      }
      if (d.goLiveDate && d.goLiveDate < today && !isLive) {
        goLiveOverdue.push(d);
      }
    });

    return {
      totalAssigned,
      totalSubmitted,
      progress: totalAssigned === 0 ? 0 : Math.round((totalSubmitted / totalAssigned) * 100),
      platformStats,
      creatorStats,
      shootOverdue,
      goLiveOverdue,
    };
  }, [deliverables]);

  const { platformStats, creatorStats, shootOverdue, goLiveOverdue, progress, totalAssigned, totalSubmitted } = metrics;
  
  const creatorArray = Object.values(creatorStats).sort((a, b) => b.total - a.total);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-32">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Campaign Executive Dashboard</h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Real-time health monitoring and bottleneck alerting based on atomic deliverables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card className="md:col-span-1 shadow-sm border-border bg-primary/5">
           <CardContent className="p-6 flex flex-col justify-center h-full">
             <div className="flex items-center gap-2 mb-2 text-primary">
               <BarChart3 className="w-5 h-5" />
               <h3 className="font-semibold">Pipeline Health</h3>
             </div>
             <div className="text-3xl font-black">{progress}%</div>
             <p className="text-sm text-muted-foreground mt-1">{totalSubmitted} of {totalAssigned} deliverables submitted.</p>
             <Progress value={progress} className="h-2 mt-4" />
           </CardContent>
         </Card>

         <Card className="md:col-span-3 shadow-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Action Required (Bottlenecks)
              </CardTitle>
            </CardHeader>
            <CardContent>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-destructive/10 rounded-lg p-4 border border-destructive/20">
                     <div className="flex items-center gap-2 text-destructive mb-3 font-semibold">
                       <Clock className="w-4 h-4" /> Shoot Overdue ({shootOverdue.length})
                     </div>
                     {shootOverdue.length === 0 ? (
                       <p className="text-sm text-muted-foreground">All creators are on track for their shoots!</p>
                     ) : (
                       <ul className="text-sm space-y-2 max-h-[120px] overflow-y-auto">
                         {shootOverdue.slice(0, 5).map((d, i) => (
                           <li key={i} className="flex justify-between border-b border-destructive/10 pb-1">
                              <span>{mockCreatorResults.find(m => m.id === d.creatorId)?.handle || "Creator"} - {d.platform} {d.contentType}</span>
                              <span className="text-xs font-bold text-destructive">{d.dueDate}</span>
                           </li>
                         ))}
                         {shootOverdue.length > 5 && <li className="text-xs text-muted-foreground pt-1">+{shootOverdue.length - 5} more</li>}
                       </ul>
                     )}
                  </div>
                  <div className="bg-amber-500/10 rounded-lg p-4 border border-amber-500/20">
                     <div className="flex items-center gap-2 text-amber-600 mb-3 font-semibold">
                       <PlayCircle className="w-4 h-4" /> Go-Live Overdue ({goLiveOverdue.length})
                     </div>
                      {goLiveOverdue.length === 0 ? (
                       <p className="text-sm text-muted-foreground">No approved content is pending launch scheduling.</p>
                     ) : (
                       <ul className="text-sm space-y-2 max-h-[120px] overflow-y-auto">
                         {goLiveOverdue.slice(0, 5).map((d, i) => (
                           <li key={i} className="flex justify-between border-b border-amber-500/10 pb-1">
                              <span>{mockCreatorResults.find(m => m.id === d.creatorId)?.handle || "Creator"} - {d.platform} {d.contentType}</span>
                              <span className="text-xs font-bold text-amber-600">{d.goLiveDate}</span>
                           </li>
                         ))}
                         {goLiveOverdue.length > 5 && <li className="text-xs text-muted-foreground pt-1">+{goLiveOverdue.length - 5} more</li>}
                       </ul>
                     )}
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg">Platform Penetration</CardTitle>
            <CardDescription>Deliverables breakdown by format and network.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.keys(platformStats).length === 0 ? (
              <div className="text-sm text-muted-foreground">No deliverables assigned yet.</div>
            ) : (
              Object.entries(platformStats).map(([platform, formats]) => (
                <div key={platform} className="space-y-3">
                  <h4 className="font-semibold tracking-tight border-b border-border pb-1 flex items-center justify-between">
                    {platform}
                    <span className="text-xs font-normal text-muted-foreground">Total: {Object.values(formats).reduce((acc, f) => acc + f.total, 0)}</span>
                  </h4>
                  {Object.entries(formats).map(([format, stats]) => {
                    const formatProgress = stats.total === 0 ? 0 : Math.round((stats.submitted / stats.total) * 100);
                    return (
                      <div key={format} className="flex items-center gap-4 text-sm">
                        <div className="w-24 text-muted-foreground">{format}</div>
                        <div className="flex-1">
                           <Progress value={formatProgress} className="h-2" />
                        </div>
                        <div className="w-16 text-right tabular-nums text-xs">
                          {stats.submitted} / {stats.total}
                        </div>
                        <div className="w-6 flex justify-end">
                          {stats.submitted === stats.total && stats.total > 0 && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border">
          <CardHeader>
            <CardTitle className="text-lg">Creator Load Matrix</CardTitle>
            <CardDescription>Volume of deliverables assigned per creator.</CardDescription>
          </CardHeader>
          <CardContent>
            {creatorArray.length === 0 ? (
              <div className="text-sm text-muted-foreground">No creators have assigned deliverables.</div>
            ) : (
              <div className="space-y-4">
                {creatorArray.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                    <div>
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className="text-xs text-muted-foreground">{c.handle} • {Array.from(c.platforms).join(", ")}</div>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-black">{c.total}</div>
                       <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Deliverables</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
