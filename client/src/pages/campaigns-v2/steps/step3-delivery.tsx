import { useState } from "react";
import { CampaignV2, CreatorDeliverableV2, CreatorStatusV2, platformOptionsV2, contentTypesV2 } from "@/models/campaigns-v2.types";
import { mockCreatorResults } from "@/models/campaign.types"; // Using existing mock creators for sourcing
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Plus, Trash2, CheckCircle2, AlertCircle, Clock } from "lucide-react";

interface StepProps {
  campaign: CampaignV2;
  updateData: (data: Partial<CampaignV2>) => void;
  errors?: Record<string, string>;
}

export function Step3Delivery({ campaign, updateData, errors }: StepProps) {
  const [activeTab, setActiveTab] = useState<"request_sent" | "pending" | "confirmed">("request_sent");
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

  const addDeliverable = (creatorId: string) => {
    const newDel: CreatorDeliverableV2 = {
      id: crypto.randomUUID(),
      creatorId,
      platform: platformOptionsV2[0],
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

  const filteredCreators = creators.filter(c => c.status === activeTab);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Creator Sourcing & Deliverables</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Enlist creators, assign atomic deliverables, and manage their progression pipeline.
          </p>
        </div>

        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button className="gap-2">
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

      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as any)} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 max-w-md h-12">
          <TabsTrigger value="request_sent" className="gap-2 data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
             <AlertCircle className="w-4 h-4" /> Request Sent
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600">
             <Clock className="w-4 h-4" /> Pending
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="gap-2 data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600">
             <CheckCircle2 className="w-4 h-4" /> Confirmed
          </TabsTrigger>
        </TabsList>

        <div className="mt-8 space-y-6">
          {filteredCreators.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-xl">
               <strong className="block text-lg font-medium text-foreground">No creators in this phase.</strong>
               <p className="text-sm text-muted-foreground mt-2">
                 {activeTab === "request_sent" ? "Enlist creators to start assigning deliverables." : "Wait for creators to progress to this stage."}
               </p>
            </div>
          ) : (
            filteredCreators.map((creator) => {
              const details = getCreatorDetails(creator.creatorId);
              const creatorDeliverables = deliverables.filter(d => d.creatorId === creator.creatorId);

              return (
                <Card key={creator.creatorId} className="border-border shadow-sm">
                  <CardHeader className="bg-muted/30 border-b border-border py-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {details.name}
                        <span className="text-muted-foreground text-sm font-normal">{details.handle}</span>
                      </CardTitle>
                    </div>
                    {activeTab === "request_sent" && (
                      <Button variant="ghost" size="sm" className="text-destructive h-8 px-2" onClick={() => removeCreator(creator.creatorId)}>
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="p-4 md:p-6 overflow-x-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-sm">The Matrix Builder</h4>
                        {activeTab === "request_sent" && (
                          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => addDeliverable(creator.creatorId)}>
                            <Plus className="w-3 h-3" /> Add Deliverable
                          </Button>
                        )}
                      </div>

                      {creatorDeliverables.length === 0 ? (
                         <div className="text-sm text-muted-foreground italic py-4">No deliverables assigned yet.</div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-transparent hover:bg-transparent">
                              <TableHead className="w-[150px]">Platform</TableHead>
                              <TableHead className="w-[150px]">Format</TableHead>
                              <TableHead className="w-[100px]">Quantity</TableHead>
                              <TableHead className="w-[200px]">Internal Deadline</TableHead>
                              <TableHead className="w-[200px]">Go Live Target</TableHead>
                              <TableHead>Specs / Notes</TableHead>
                              {activeTab === "request_sent" && <TableHead className="w-[60px]"></TableHead>}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {creatorDeliverables.map(del => (
                              <TableRow key={del.id}>
                                <TableCell>
                                  {activeTab === "request_sent" ? (
                                    <Select value={del.platform} onValueChange={(val) => updateDeliverable(del.id, { platform: val })}>
                                      <SelectTrigger className="h-8 text-xs border-0 bg-muted/50 focus:ring-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {platformOptionsV2.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <span className="text-sm">{del.platform}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {activeTab === "request_sent" ? (
                                    <Select value={del.contentType} onValueChange={(val) => updateDeliverable(del.id, { contentType: val })}>
                                      <SelectTrigger className="h-8 text-xs border-0 bg-muted/50 focus:ring-0">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {contentTypesV2.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <span className="text-sm">{del.contentType}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {activeTab === "request_sent" ? (
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      className="h-8 text-xs border-0 bg-muted/50 focus-visible:ring-0" 
                                      value={del.quantity} 
                                      onChange={(e) => updateDeliverable(del.id, { quantity: parseInt(e.target.value) || 1 })}
                                    />
                                  ) : (
                                    <span className="text-sm">{del.quantity}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {activeTab === "request_sent" ? (
                                    <Input 
                                      type="date"
                                      className="h-8 text-xs border-0 bg-muted/50 focus-visible:ring-0" 
                                      value={del.dueDate || ""} 
                                      onChange={(e) => updateDeliverable(del.id, { dueDate: e.target.value })}
                                    />
                                  ) : (
                                    <span className="text-sm">{del.dueDate || "---"}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {activeTab === "request_sent" ? (
                                    <Input 
                                      type="date"
                                      className="h-8 text-xs border-0 bg-muted/50 focus-visible:ring-0" 
                                      value={del.goLiveDate || ""} 
                                      onChange={(e) => updateDeliverable(del.id, { goLiveDate: e.target.value })}
                                    />
                                  ) : (
                                    <span className="text-sm">{del.goLiveDate || "---"}</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {activeTab === "request_sent" ? (
                                    <Input 
                                      placeholder="e.g. 15s-30s duration..."
                                      className="h-8 text-xs border-0 bg-muted/50 focus-visible:ring-0" 
                                      value={del.formatNotes} 
                                      onChange={(e) => updateDeliverable(del.id, { formatNotes: e.target.value })}
                                    />
                                  ) : (
                                    <span className="text-sm">{del.formatNotes || "---"}</span>
                                  )}
                                </TableCell>
                                {activeTab === "request_sent" && (
                                  <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeDeliverable(del.id)}>
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>
    </div>
  );
}
