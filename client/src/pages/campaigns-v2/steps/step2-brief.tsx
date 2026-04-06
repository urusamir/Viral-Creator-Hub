import { useState } from "react";
import { CampaignV2, CampaignBriefV2 } from "@/models/campaigns-v2.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash, Trash2 } from "lucide-react";

interface StepProps {
  campaign: CampaignV2;
  updateData: (data: Partial<CampaignV2>) => void;
  errors?: Record<string, string>;
}

export function Step2Brief({ campaign, updateData, errors }: StepProps) {
  const briefs = campaign.briefs && campaign.briefs.length > 0 ? campaign.briefs : [];
  const [activeTab, setActiveTab] = useState<string>(briefs[0]?.id || "");

  const addBrief = () => {
    const newBrief: CampaignBriefV2 = {
      id: crypto.randomUUID(),
      title: `Brief ${briefs.length + 1}`,
      keyMessages: [""],
      dos: [""],
      donts: [""],
      hashtags: [""],
      mentions: [""],
      referenceLinks: [""]
    };
    updateData({ briefs: [...briefs, newBrief] });
    setActiveTab(newBrief.id);
  };

  const removeBrief = (id: string) => {
    if (briefs.length <= 1) return; // Must have at least 1
    const newBriefs = briefs.filter(b => b.id !== id);
    updateData({ briefs: newBriefs });
    if (activeTab === id) setActiveTab(newBriefs[0].id);
  };

  const updateBrief = (id: string, updates: Partial<CampaignBriefV2>) => {
    updateData({
      briefs: briefs.map(b => b.id === id ? { ...b, ...updates } : b)
    });
  };

  const renderArrayInput = (
    briefId: string, 
    field: keyof CampaignBriefV2, 
    items: string[], 
    placeholder: string
  ) => {
    const handleChange = (index: number, val: string) => {
      const newArray = [...items];
      newArray[index] = val;
      updateBrief(briefId, { [field]: newArray } as any);
    };

    const addRow = () => {
      updateBrief(briefId, { [field]: [...items, ""] } as any);
    };

    const removeRow = (index: number) => {
      const newArray = items.filter((_, i) => i !== index);
      updateBrief(briefId, { [field]: newArray } as any);
    };

    return (
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Input 
              value={item} 
              onChange={(e) => handleChange(idx, e.target.value)} 
              placeholder={placeholder} 
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={() => removeRow(idx)} disabled={items.length <= 1 && item === ""}>
              <Trash className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addRow} className="gap-2 text-xs h-8">
          <Plus className="w-3 h-3" /> Add {field.replace(/([A-Z])/g, " $1").trim()}
        </Button>
      </div>
    );
  };

  if (briefs.length === 0) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Campaign Brief</h2>
          <p className="text-muted-foreground mt-1 text-sm">Create specific playbooks for creators. Combine multiple briefs if targeting differs per platform.</p>
        </div>
        <Button onClick={addBrief} variant="outline" className="gap-2">
          <Plus className="w-4 h-4" /> New Brief
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border mb-6 overflow-x-auto">
           <TabsList className="bg-transparent border-none h-auto p-0 justify-start">
             {briefs.map((b) => (
               <TabsTrigger 
                 key={b.id} 
                 value={b.id}
                 className="data-[state=active]:border-primary data-[state=active]:bg-background border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-muted-foreground data-[state=active]:text-foreground"
               >
                 {b.title}
               </TabsTrigger>
             ))}
           </TabsList>
        </div>

        {briefs.map((brief) => (
          <TabsContent key={brief.id} value={brief.id} className="focus-visible:outline-none">
            <Card className="border-border">
              <CardContent className="p-6 space-y-8">
                 <div className="flex items-end justify-between gap-4">
                    <div className="space-y-2 flex-1 max-w-sm">
                      <Label className="text-sm font-semibold">Brief Title</Label>
                      <Input 
                        value={brief.title} 
                        onChange={(e) => updateBrief(brief.id, { title: e.target.value })} 
                      />
                    </div>
                    {briefs.length > 1 && (
                      <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeBrief(brief.id)}>
                        <Trash2 className="w-4 h-4 mr-2" /> Remove Brief
                      </Button>
                    )}
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Key Messages <span className="text-red-500">*</span></Label>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">What must the creator explicitly mention? At least one is required before publish.</p>
                      {renderArrayInput(brief.id, "keyMessages", brief.keyMessages, "e.g. The app is 100% free to download")}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-green-600">The "DO"s</Label>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Positive constraints for the execution.</p>
                      {renderArrayInput(brief.id, "dos", brief.dos, "e.g. Must show the product in the first 3 seconds")}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold text-red-600">The "DON'T"s</Label>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Strict boundaries of what to avoid.</p>
                      {renderArrayInput(brief.id, "donts", brief.donts, "e.g. Do not mention competitor brand X")}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Tags & Mentions</Label>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Required #hashtags and @accounts.</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Hashtags</Label>
                          {renderArrayInput(brief.id, "hashtags", brief.hashtags, "#tag")}
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Mentions</Label>
                          {renderArrayInput(brief.id, "mentions", brief.mentions, "@account")}
                        </div>
                      </div>
                    </div>

                     <div className="space-y-2 md:col-span-2">
                      <Label className="text-base font-semibold">Reference Links</Label>
                      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Provide moodboards, Google Drives, or style inspirations.</p>
                      {renderArrayInput(brief.id, "referenceLinks", brief.referenceLinks, "https://...")}
                    </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
