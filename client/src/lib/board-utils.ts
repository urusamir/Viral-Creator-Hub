

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
      return isDragging ? `${dragBase} bg-slate-600 text-white border-slate-700` : `${base} bg-slate-600 border-slate-700 text-white hover:bg-slate-700`;
    case "Awaiting Shoot":
      return isDragging ? `${dragBase} bg-orange-600 text-white border-orange-700` : `${base} bg-orange-600 border-orange-700 text-white hover:bg-orange-700`;
    case "Shoot Submitted":
      return isDragging ? `${dragBase} bg-blue-600 text-white border-blue-700` : `${base} bg-blue-600 border-blue-700 text-white hover:bg-blue-700`;
    case "Changes Requested":
      return isDragging ? `${dragBase} bg-red-600 text-white border-red-700` : `${base} bg-red-600 border-red-700 text-white hover:bg-red-700`;
    case "Approved & Scheduled":
      return isDragging ? `${dragBase} bg-indigo-600 text-white border-indigo-700` : `${base} bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700`;
    case "Live":
      return isDragging ? `${dragBase} bg-emerald-600 text-white border-emerald-700` : `${base} bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700`;
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
