import { CampaignV2 } from "@/models/campaigns-v2.types";
import { goalsV2, platformOptionsV2, countriesV2, ageRangesV2, currenciesV2 } from "@/models/campaigns-v2.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";

interface StepProps {
  campaign: CampaignV2;
  updateData: (data: Partial<CampaignV2>) => void;
  errors?: Record<string, string>;
}

export function Step1Core({ campaign, updateData, errors }: StepProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-32">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Core Setup</h2>
        <p className="text-muted-foreground mt-1 text-sm">Define the foundational details of this campaign.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 md:col-span-2">
           <Label className="text-sm font-semibold">Campaign Name</Label>
           <Input 
             value={campaign.name} 
             onChange={(e) => updateData({ name: e.target.value })} 
             placeholder="e.g. Summer Essentials Q3" 
           />
        </div>

        <div className="space-y-4">
           <Label className="text-sm font-semibold">Brand / Client</Label>
           <Input 
             value={campaign.brand} 
             onChange={(e) => updateData({ brand: e.target.value })} 
             placeholder="Brand Name" 
           />
        </div>

        <div className="space-y-4">
           <Label className="text-sm font-semibold">Hero Product</Label>
           <Input 
             value={campaign.product} 
             onChange={(e) => updateData({ product: e.target.value })} 
             placeholder="What are we promoting?" 
           />
        </div>

        <div className="space-y-4">
          <Label className="text-sm font-semibold">Primary Goal</Label>
          <Select value={campaign.goal} onValueChange={(val) => updateData({ goal: val })}>
            <SelectTrigger>
              <SelectValue placeholder="Select objective" />
            </SelectTrigger>
            <SelectContent>
              {goalsV2.map((goal) => (
                <SelectItem key={goal} value={goal}>{goal}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full h-px bg-border my-6" />

      <h3 className="text-xl font-semibold mb-4">Targeting & Logistics</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-4">
            <Label className="text-sm font-semibold">Target Countries</Label>
            <MultiSelect
              options={countriesV2.map(c => ({ label: c, value: c }))}
              selected={campaign.countries}
              onChange={(vals) => updateData({ countries: vals })}
              placeholder="Select countries"
            />
         </div>

         <div className="space-y-4">
            <Label className="text-sm font-semibold">Execution Platforms</Label>
            <MultiSelect
              options={platformOptionsV2.map(p => ({ label: p, value: p }))}
              selected={campaign.platforms}
              onChange={(vals) => updateData({ platforms: vals })}
              placeholder="Select platforms"
            />
         </div>

         <div className="space-y-4 md:col-span-2">
            <Label className="text-sm font-semibold">Audience Age Ranges</Label>
            <MultiSelect
              options={ageRangesV2.map(a => ({ label: a, value: a }))}
              selected={campaign.audienceAgeRanges}
              onChange={(vals) => updateData({ audienceAgeRanges: vals })}
              placeholder="Select age brackets"
            />
         </div>

         <div className="space-y-4">
            <Label className="text-sm font-semibold">Start Date</Label>
            <Input 
              type="date"
              value={campaign.startDate}
              onChange={(e) => updateData({ startDate: e.target.value })}
            />
         </div>
         <div className="space-y-4">
            <Label className="text-sm font-semibold">End Date</Label>
            <Input 
              type="date"
              value={campaign.endDate}
              onChange={(e) => updateData({ endDate: e.target.value })}
              min={campaign.startDate} // basic HTML validation fallback
            />
         </div>
      </div>

      <div className="w-full h-px bg-border my-6" />

      <h3 className="text-xl font-semibold mb-4">Financials</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="space-y-4">
           <Label className="text-sm font-semibold">Total Budget</Label>
           <Input 
             type="number"
             value={campaign.totalBudget || ""}
             onChange={(e) => updateData({ totalBudget: Number(e.target.value) })}
             placeholder="0"
             min="0"
           />
         </div>
         <div className="space-y-4">
            <Label className="text-sm font-semibold">Currency</Label>
            <Select value={campaign.currency} onValueChange={(val) => updateData({ currency: val })}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currenciesV2.map((c) => (
                  <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
         </div>
      </div>
    </div>
  );
}
