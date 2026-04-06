import { useState, useMemo } from "react";
import { CampaignV2, CreatorDeliverableV2, CreatorStatusV2, platformOptionsV2, contentTypesV2 } from "@/models/campaigns-v2.types";
import { mockCreatorResults } from "@/models/campaign.types"; // Using existing mock creators for sourcing
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Trash2, Settings2 } from "lucide-react";

interface StepProps {
  campaign: CampaignV2;
  updateData: (data: Partial<CampaignV2>) => void;
  errors?: Record<string, string>;
}

export function Step3Delivery({ campaign, updateData, errors }: StepProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  const creators = campaign.selectedCreators || [];
  const deliverables = campaign.deliverables || [];

  const addCreator = (creatorId: string) => {
    if (creators.find(c => c.creatorId === creatorId)) return;
    updateData({
      selectedCreators: [...creators, { creatorId, status: "request_sent" }]
    });
    setSearchOpen(false);
  };

  const removeCreator = (creatorId: string) => {
    updateData({
      selectedCreators: creators.filter(c => c.creatorId !== creatorId),
      deliverables: deliverables.filter(d => d.creatorId !== creatorId)
    });
  };

  const updateCreatorStatus = (creatorId: string, status: string) => {
    updateData({
      selectedCreators: creators.map(c => c.creatorId === creatorId ? { ...c, status: status as any } : c)
    });
  };

  const addDeliverable = (creatorId: string, platform: string) => {
    const newDel: CreatorDeliverableV2 = {
      id: crypto.randomUUID(),
      creatorId,
      platform,
      contentType: contentTypesV2[0],
      quantity: 1,
      formatNotes: "",
      status: "pending",
    };
    updateData({ deliverables: [...deliverables, newDel] });
  };

  const updateDeliverable = (id: string, updates: Partial<CreatorDeliverableV2>) => {
    updateData({
      deliverables: deliverables.map(d => d.id === id ? { ...d, ...updates } : d)
    });
  };

  const removeDeliverable = (id: string) => {
    updateData({
      deliverables: deliverables.filter(d => d.id !== id)
    });
  };

  const getCreatorDetails = (id: string) => {
    return mockCreatorResults.find(m => m.id === id) || { name: "Unknown Creator", handle: "unknown" };
  };

  // Only keep platforms that the campaign actually cares about, or fallback to all standard ones
  // Here we use the global platformOptionsV2 to generate the Matrix columns.
  const columns = platformOptionsV2;

  // Status mapping colors
  const statusColors = {
    request_sent: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    confirmed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deliverables Matrix</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Enlist creators, update their pipeline status, and assign deliverables per platform.
          </p>
        </div>

        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button className="gap-2 shrink-0">
              <Plus className="w-4 h-4" /> Enlist Creator
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <Command>
              <CommandInput placeholder="Search creators..." />
              <CommandEmpty>No creator found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {mockCreatorResults.map((creator) => {
                    const isSelected = creators.some(c => c.creatorId === creator.id);
                    return (
                      <CommandItem
                        key={creator.id}
                        onSelect={() => addCreator(creator.id)}
                        disabled={isSelected}
                        className="flex flex-col items-start gap-1 py-3"
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-semibold">{creator.name}</span>
                          {isSelected && <Badge variant="secondary" className="text-[10px]">Added</Badge>}
                        </div>
                        <span className="text-xs text-muted-foreground">{creator.handle} • {creator.platform}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <Card className="overflow-x-auto border-border shadow-sm">
        {creators.length === 0 ? (
          <div className="text-center py-16">
             <strong className="block text-lg font-medium text-foreground">No Creators Enlisted</strong>
             <p className="text-sm text-muted-foreground mt-2">
               Search and enlist creators to build your delivery matrix.
             </p>
          </div>
        ) : (
          <Table className="min-w-[1000px]">
             <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[220px] font-semibold">Creator</TableHead>
                  <TableHead className="w-[160px] font-semibold">Status</TableHead>
                  {columns.map(platform => (
                    <TableHead key={platform} className="min-w-[180px] font-semibold border-l border-border/50 text-center">
                      {platform}
                    </TableHead>
                  ))}
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
               {creators.map(creator => {
                 const details = getCreatorDetails(creator.creatorId);
                 return (
                   <TableRow key={creator.creatorId} className="hover:bg-muted/10 group">
                      <TableCell className="align-top py-3">
                        <div className="font-semibold text-sm">{details.name}</div>
                        <div className="text-xs text-muted-foreground">{details.handle}</div>
                      </TableCell>
                      <TableCell className="align-top py-3">
                        <Select value={creator.status} onValueChange={(v) => updateCreatorStatus(creator.creatorId, v)}>
                           <SelectTrigger className={`h-8 text-xs border-0 font-medium ${statusColors[creator.status as keyof typeof statusColors] || ''}`}>
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="request_sent">Request Sent</SelectItem>
                             <SelectItem value="pending">Pending</SelectItem>
                             <SelectItem value="confirmed">Confirmed</SelectItem>
                             <SelectItem value="rejected">Rejected</SelectItem>
                           </SelectContent>
                        </Select>
                      </TableCell>
                      
                      {columns.map(platform => {
                         const platformDeliverables = deliverables.filter(d => d.creatorId === creator.creatorId && d.platform === platform);
                         return (
                           <TableCell key={platform} className="align-top border-l border-border/50 py-3 bg-muted/5 group-hover:bg-transparent transition-colors">
                             <div className="space-y-2">
                               {platformDeliverables.map(del => (
                                 <Popover key={del.id}>
                                   <PopoverTrigger asChild>
                                     <div role="button" className="flex items-center justify-between p-2 rounded-md bg-background border border-border/60 hover:border-primary/50 hover:shadow-sm cursor-pointer transition-all group/badge">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-semibold">{del.quantity}x {del.contentType}</span>
                                          <span className="text-[10px] text-muted-foreground capitalize">{del.status.replace("_", " ")}</span>
                                        </div>
                                        <Settings2 className="w-3 h-3 text-muted-foreground opacity-0 group-hover/badge:opacity-100 transition-opacity" />
                                     </div>
                                   </PopoverTrigger>
                                   <PopoverContent className="w-[280px] p-4 shadow-lg z-50">
                                      <div className="space-y-4">
                                        <div className="flex items-center justify-between border-b pb-2">
                                          <h4 className="font-semibold text-sm">Config Deliverable</h4>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={() => removeDeliverable(del.id)}>
                                             <Trash2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1.5">
                                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                                            <Input type="number" min="1" className="h-8 text-xs focus-visible:ring-1" value={del.quantity} onChange={e => updateDeliverable(del.id, {quantity: parseInt(e.target.value) || 1})} />
                                          </div>
                                          <div className="space-y-1.5">
                                             <Label className="text-xs text-muted-foreground">Format</Label>
                                             <Select value={del.contentType} onValueChange={v => updateDeliverable(del.id, {contentType: v})}>
                                               <SelectTrigger className="h-8 text-xs focus:ring-1"><SelectValue/></SelectTrigger>
                                               <SelectContent>{contentTypesV2.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                             </Select>
                                          </div>
                                        </div>

                                        <div className="space-y-1.5">
                                           <Label className="text-xs text-muted-foreground">Tracking Status</Label>
                                             <Select value={del.status} onValueChange={v => updateDeliverable(del.id, {status: v as any})}>
                                               <SelectTrigger className="h-8 text-xs focus:ring-1"><SelectValue/></SelectTrigger>
                                               <SelectContent>
                                                 <SelectItem value="pending">Pending</SelectItem>
                                                 <SelectItem value="uploaded">Uploaded</SelectItem>
                                                 <SelectItem value="revisions_requested">Revisions Requested</SelectItem>
                                                 <SelectItem value="approved">Approved</SelectItem>
                                                 <SelectItem value="live">Live</SelectItem>
                                               </SelectContent>
                                             </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                          <Label className="text-xs text-muted-foreground">Deadline</Label>
                                          <Input type="date" className="h-8 text-xs focus-visible:ring-1 text-muted-foreground" value={del.dueDate || ""} onChange={e => updateDeliverable(del.id, {dueDate: e.target.value})} />
                                        </div>
                                      </div>
                                   </PopoverContent>
                                 </Popover>
                               ))}
                               
                               <Button 
                                 variant="ghost" 
                                 size="sm" 
                                 className="w-full h-7 text-[10px] text-muted-foreground border border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all" 
                                 onClick={() => addDeliverable(creator.creatorId, platform)}
                               >
                                 <Plus className="w-3 h-3 mr-1" /> Add Format
                               </Button>
                             </div>
                           </TableCell>
                         )
                      })}

                      <TableCell className="align-top py-3 text-right">
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => removeCreator(creator.creatorId)}>
                            <Trash2 className="w-4 h-4" />
                         </Button>
                      </TableCell>
                   </TableRow>
                 )
               })}
             </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}

