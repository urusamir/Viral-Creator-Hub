import { useMemo, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateCampaign } from "@/models/campaign.types";
import { creatorsData } from "@/models/creators.data";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/providers/auth.provider";
import { syncCampaignDeliverablesToCalendar } from "@/services/api/calendar";

const getStatusClasses = (status: string, isDragging: boolean, readOnly?: boolean) => {
  if (readOnly) return "bg-muted/50 border-border text-muted-foreground opacity-80 cursor-default";
  
  const base = "shadow-sm cursor-grab border transition-all";
  const dragBase = "shadow-lg scale-105 z-50 cursor-grabbing border";
  
  switch (status) {
    case "Not Started":
      return isDragging ? `${dragBase} bg-slate-500 text-white border-slate-600` : `${base} bg-slate-500/10 border-slate-500/30 text-slate-400 hover:bg-slate-500/20`;
    case "Awaiting Shoot":
      return isDragging ? `${dragBase} bg-amber-500 text-amber-950 border-amber-600` : `${base} bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20`;
    case "Shoot Submitted":
      return isDragging ? `${dragBase} bg-blue-500 text-white border-blue-600` : `${base} bg-blue-500/10 border-blue-500/30 text-blue-500 hover:bg-blue-500/20`;
    case "Changes Requested":
      return isDragging ? `${dragBase} bg-rose-500 text-white border-rose-600` : `${base} bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20`;
    case "Approved & Scheduled":
      return isDragging ? `${dragBase} bg-purple-500 text-white border-purple-600` : `${base} bg-purple-500/10 border-purple-500/30 text-purple-500 hover:bg-purple-500/20`;
    case "Live":
      return isDragging ? `${dragBase} bg-emerald-500 text-emerald-950 border-emerald-600` : `${base} bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20`;
    default:
      return isDragging ? `${dragBase} bg-primary text-primary-foreground border-primary` : `${base} bg-background border-border text-foreground hover:bg-muted/50`;
  }
};

const STATUS_COLUMNS = [
  "Not Started",
  "Awaiting Shoot",
  "Shoot Submitted",
  "Changes Requested",
  "Approved & Scheduled",
  "Live",
];

import { usePrefetchedData } from "@/providers/prefetch.provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CampaignBoardPage() {
  const [match, params] = useRoute("/dashboard/campaigns/:id/board");
  const idFromRoute = params?.id;
  const prefetched = usePrefetchedData();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const activeCampaigns = prefetched.campaigns.filter((c: any) => c.status === "PUBLISHED" || c.status === "DRAFT");
  
  const { user } = useAuth();
  
  const [selectedId, setSelectedId] = useState<string>(
    idFromRoute || (activeCampaigns.length > 0 ? activeCampaigns[0].id : "")
  );

  const campaign = activeCampaigns.find((c: any) => c.id === selectedId);

  const updateField = async (field: string, value: any) => {
    if (!campaign) return;
    const success = await updateCampaign(campaign.id, { [field]: value });
    if (!success) {
      toast({ title: "Error", description: "Failed to update campaign", variant: "destructive" });
    } else {
      if (field === "selectedCreators" && user?.id) {
         await syncCampaignDeliverablesToCalendar({ ...campaign, [field]: value }, user.id);
      }
      // Dispatch an event so prefetch state picks it up
      window.dispatchEvent(new Event("vairal-campaigns-updated"));
    }
  };

  const flatDeliverables = useMemo(() => {
    const arr: any[] = [];
    if (!campaign?.selectedCreators) return arr;
    campaign.selectedCreators.forEach((c: any) => {
      const creatorObj = creatorsData.find((cr: any) => cr.username === c.creatorId);
      const name = creatorObj?.fullname || creatorObj?.username || c.creatorId;
      (c.deliverables || []).forEach((d: any) => {
        arr.push({
          creatorId: c.creatorId,
          creatorName: name,
          deliverable: d,
        });
      });
    });
    return arr;
  }, [campaign?.selectedCreators]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || !campaign || campaign.status === "Completed") return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId) return;

    const destStatus = destination.droppableId.split('__')[1];
    
    // Update local state immediately via optimistic update if needed,
    const updatedCreators = campaign.selectedCreators?.map((c: any) => {
      if (!c.deliverables?.some((d: any) => d.id === draggableId)) return c;
      return {
        ...c,
        deliverables: c.deliverables.map((d: any) => 
          d.id === draggableId ? { ...d, status: destStatus } : d
        )
      };
    });
    updateField("selectedCreators", updatedCreators);
  };

  if (!campaign) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center h-full gap-4 pt-20">
        <p className="text-muted-foreground">No active campaigns found. Please start a campaign first.</p>
        <Button variant="outline" onClick={() => setLocation("/dashboard/campaigns")}>
          Go to Campaigns
        </Button>
      </div>
    );
  }

  const readOnly = campaign.status === "FINISHED";

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
                  Execution Board
                  <span className="text-muted-foreground font-normal text-lg">/</span>
                </h1>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="w-[300px] bg-muted/50 border-border h-9 font-medium shadow-sm">
                    <SelectValue placeholder="Select Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCampaigns.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>{c.name || "Unnamed Campaign"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Drag and drop deliverables to update tracking status for {campaign.name || "this campaign"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Board Scroll Area */}
      <div className="flex-1 overflow-auto p-4 md:p-6 w-full max-w-[1600px] mx-auto">
        {flatDeliverables.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center rounded-xl bg-muted/10 border border-dashed border-border mt-8">
            <h3 className="text-lg font-medium text-foreground mb-2">No deliverables found</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              There are no deliverables assigned to creators in this campaign. Go back to the wizard to assign platforms and formats.
            </p>
            <Button onClick={() => setLocation(`/dashboard/campaigns/${campaign.id}`)}>
              Back to Wizard
            </Button>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="w-full h-full min-w-[1000px] overflow-visible rounded-xl border border-border shadow-sm bg-card flex flex-col">
              <table className="w-full text-left border-collapse text-sm bg-card flex-1 table-fixed">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-muted/50 border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground shadow-sm">
                    <th className="px-4 py-4 font-semibold border-r border-border w-48 shadow-r shadow-border">Creator & Asset</th>
                    {STATUS_COLUMNS.map(col => (
                      <th key={col} className="px-4 py-4 font-semibold border-r last:border-r-0 border-border text-center">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {flatDeliverables.map(item => (
                    <tr key={item.deliverable.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors group h-24">
                      <td className="px-4 py-3 border-r border-border align-middle font-medium w-48">
                        <div className="flex flex-col gap-1">
                          <span className="text-[13px]">{item.creatorName}</span>
                          <span className="text-[11px] font-normal text-muted-foreground">
                            {item.deliverable.platform} • {item.deliverable.contentType}
                          </span>
                        </div>
                      </td>
                      {STATUS_COLUMNS.map((statusCol, index) => {
                        const dropId = `${item.deliverable.id}__${statusCol}`;
                        const isCurrentStatus = item.deliverable.status === statusCol;
                        
                        return (
                          <Droppable key={dropId} droppableId={dropId} direction="vertical" type={`deliv_${item.deliverable.id}`}>
                            {(provided, snapshot) => (
                              <td 
                                ref={provided.innerRef} 
                                {...provided.droppableProps}
                                className={`p-2 border-r last:border-r-0 border-border align-middle relative transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''} ${index % 2 === 0 ? 'bg-card' : 'bg-muted/5'}`}
                              >
                                <div className="flex flex-col gap-2 min-h-[60px] h-full items-center justify-center w-full relative">
                                  {isCurrentStatus && (
                                    <Draggable draggableId={item.deliverable.id} index={0} isDragDisabled={readOnly}>
                                      {(dragProvided, dragSnapshot) => (
                                        <div 
                                          ref={dragProvided.innerRef}
                                          {...dragProvided.draggableProps}
                                          {...dragProvided.dragHandleProps}
                                          className={`w-full max-w-[160px] inline-flex items-center justify-center p-2 rounded-md text-[11px] font-medium leading-tight shadow-sm text-center ${getStatusClasses(statusCol, dragSnapshot.isDragging, readOnly)}`}
                                          style={{
                                            ...dragProvided.draggableProps.style,
                                            // Add tiny rotational jiggle when dragging
                                            ...(dragSnapshot.isDragging ? { transform: `${dragProvided.draggableProps.style?.transform} rotate(2deg)` } : {})
                                          }}
                                        >
                                          {item.deliverable.contentDetails || "No description"}
                                        </div>
                                      )}
                                    </Draggable>
                                  )}
                                  {provided.placeholder}
                                </div>
                              </td>
                            )}
                          </Droppable>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  );
}
