

export const STATUS_COLUMNS = [
  "Not Started",
  "In Progress",
  "Awaiting Shoot",
  "Awaiting Edits",
  "Approved & Scheduled",
  "Live",
] as const;

export type BoardStatus = typeof STATUS_COLUMNS[number];

export function getStatusClasses(status: string, isDragging: boolean = false, readOnly: boolean = false) {
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
}

export function buildFlatDeliverables(campaigns: any[], creatorsData: any[]) {
  return campaigns.flatMap((c: any) => 
    (c.selectedCreators || []).map((creator: any) => {
      const creatorInfo = creatorsData.find(cr => cr.username === creator.creatorId);
      return (creator.deliverables || []).map((d: any) => ({
        campaignId: c.id,
        campaignName: c.name,
        campaignStatus: c.status,
        creatorId: creator.creatorId,
        creatorName: creatorInfo?.fullname || creator.creatorId,
        creatorStatus: creator.status,
        deliverable: d,
        campaignRef: c
      }));
    }).flat()
  );
}
