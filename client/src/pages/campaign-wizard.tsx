import { useState, useEffect, useCallback } from "react";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Check,
  Plus,
  Trash2,
  UserPlus,
  Search,
  FileUp,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type Campaign,
  type BonusRule,
  type ManualCreator,
  type Deliverable,
  getCampaign,
  createCampaign,
  updateCampaign,
  createDefaultCampaign,
  goals,
  platformOptions,
  countries,
  campaignTypes,
  ageRanges,
  tones,
  currencies,
  paymentModels,
  paymentTimings,
  kpis,
  trackingMethods,
  reportingFrequencies,
  exportFormats,
  contentTypes,
  usageRights,
  usageDurations,
  followerRanges,
  bonusMetrics,
  mandatoryRequirementOptions,
  mockCreatorResults,
} from "@/lib/campaigns";

const stepLabels = [
  "New Campaign",
  "Campaign Setup",
  "Budget & Payment",
  "Choose Creators",
  "Campaign Brief",
  "Deliverables Setup",
  "Reporting Setup",
  "Review & Submit",
];

export default function CampaignWizardPage() {
  const [, params] = useRoute("/dashboard/campaigns/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const campaignId = params?.id;
  const isNew = !campaignId || campaignId === "new";

  const [campaign, setCampaign] = useState<Omit<Campaign, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string; updatedAt?: string }>(createDefaultCampaign());
  const [step, setStep] = useState(1);
  const [savedId, setSavedId] = useState<string | null>(null);
  const readOnly = campaign.status === "PUBLISHED";

  useEffect(() => {
    if (!isNew && campaignId) {
      const existing = getCampaign(campaignId);
      if (existing) {
        setCampaign(existing);
        setStep(existing.status === "PUBLISHED" ? 1 : existing.lastStep || 1);
        setSavedId(existing.id);
      }
    }
  }, [campaignId, isNew]);

  const updateField = useCallback(<K extends keyof Campaign>(field: K, value: Campaign[K]) => {
    if (readOnly) return;
    setCampaign((prev) => ({ ...prev, [field]: value }));
  }, [readOnly]);

  const saveDraft = useCallback(() => {
    const data = { ...campaign, lastStep: step, status: "DRAFT" as const };
    if (savedId) {
      updateCampaign(savedId, data);
      toast({ title: "Draft saved", description: "Your campaign draft has been saved." });
    } else {
      const created = createCampaign(data);
      setSavedId(created.id);
      toast({ title: "Draft created", description: "Your campaign draft has been created." });
    }
  }, [campaign, step, savedId, toast]);

  const publish = useCallback(() => {
    if (!campaign.name || !campaign.brand || !campaign.product || !campaign.goal || campaign.platforms.length === 0 || !campaign.startDate || !campaign.endDate) {
      toast({ title: "Validation error", description: "Please complete all required fields in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (!campaign.campaignType) {
      toast({ title: "Validation error", description: "Please select a campaign type in Step 2.", variant: "destructive" });
      setStep(2);
      return;
    }
    if (campaign.paymentModel !== "Product Only" && campaign.totalBudget <= 0) {
      toast({ title: "Validation error", description: "Please set a valid budget in Step 3.", variant: "destructive" });
      setStep(3);
      return;
    }
    if (!campaign.paymentModel || !campaign.paymentTiming) {
      toast({ title: "Validation error", description: "Please complete payment details in Step 3.", variant: "destructive" });
      setStep(3);
      return;
    }
    if (!campaign.brandOverview || !campaign.productDetails || campaign.keyMessages.filter(Boolean).length === 0) {
      toast({ title: "Validation error", description: "Please complete the campaign brief in Step 5.", variant: "destructive" });
      setStep(5);
      return;
    }
    if (campaign.kpis.length === 0 || !campaign.reportingFrequency) {
      toast({ title: "Validation error", description: "Please set up reporting in Step 7.", variant: "destructive" });
      setStep(7);
      return;
    }

    const data = { ...campaign, status: "PUBLISHED" as const, lastStep: 8 };
    if (savedId) {
      updateCampaign(savedId, data);
    } else {
      const created = createCampaign(data);
      setSavedId(created.id);
    }
    setCampaign((prev) => ({ ...prev, status: "PUBLISHED" }));
    toast({ title: "Campaign published!", description: "Your campaign is now live." });
  }, [campaign, savedId, toast]);

  const canGoNext = useCallback(() => {
    switch (step) {
      case 1:
        return !!(campaign.name && campaign.brand && campaign.product && campaign.goal && (campaign.countries?.length > 0) && campaign.platforms.length > 0 && campaign.startDate && campaign.endDate && campaign.endDate > campaign.startDate);
      case 2:
        return !!campaign.campaignType;
      case 3:
        return !!(campaign.paymentModel && campaign.paymentTiming && (campaign.paymentModel === "Product Only" || campaign.totalBudget > 0));
      case 4:
        return true;
      case 5:
        return !!(campaign.brandOverview && campaign.productDetails && campaign.keyMessages.filter(Boolean).length > 0);
      case 6:
        return true;
      case 7:
        return !!(campaign.kpis.length > 0 && campaign.reportingFrequency);
      default:
        return true;
    }
  }, [step, campaign]);

  const goNext = () => {
    if (step < 8) setStep(step + 1);
  };
  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex h-full" data-testid="page-campaign-wizard">
      <div className="w-64 shrink-0 border-r border-border bg-card/50 p-6 hidden md:block">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground gap-1.5" onClick={() => setLocation("/dashboard/campaigns")} data-testid="button-back-to-campaigns">
          <ArrowLeft className="w-4 h-4" /> All Campaigns
        </Button>
        <nav className="space-y-1">
          {stepLabels.map((label, i) => {
            const sNum = i + 1;
            const isCurrent = step === sNum;
            const isCompleted = step > sNum;
            return (
              <button
                key={i}
                onClick={() => setStep(sNum)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${isCurrent ? "bg-blue-600/10 text-blue-500 font-medium" : isCompleted ? "text-foreground" : "text-muted-foreground"} hover:bg-accent/50`}
                data-testid={`button-step-${sNum}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${isCurrent ? "bg-blue-600 text-white" : isCompleted ? "bg-green-600/20 text-green-500 border border-green-500/30" : "bg-muted text-muted-foreground"}`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : sNum}
                </span>
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </nav>
        {readOnly && (
          <Badge className="mt-6 bg-green-600/20 text-green-500 border-green-500/20">Published</Badge>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8 max-w-4xl">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard/campaigns")} data-testid="button-back-mobile">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <span className="text-sm text-muted-foreground">Step {step} of 8</span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1" data-testid="text-step-title">
            {stepLabels[step - 1]}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Step {step} of 8</p>

          <Card className="p-6 bg-card border-border">
            {step === 1 && <Step1 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 2 && <Step2 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 3 && <Step3 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 4 && <Step4 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 5 && <Step5 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 6 && <Step6 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 7 && <Step7 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 8 && <Step8 campaign={campaign} />}
          </Card>

          <div className="flex items-center justify-between mt-6 gap-3">
            <Button variant="outline" onClick={goBack} disabled={step === 1} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              {!readOnly && (
                <Button variant="outline" onClick={saveDraft} data-testid="button-save-draft">
                  <Save className="w-4 h-4 mr-1" /> Save Draft
                </Button>
              )}
              {step < 8 ? (
                <Button onClick={goNext} disabled={!canGoNext() && !readOnly} data-testid="button-next">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                !readOnly && (
                  <Button onClick={publish} className="bg-green-600 hover:bg-green-700" data-testid="button-publish">
                    <Send className="w-4 h-4 mr-1" /> Publish Campaign
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type StepProps = {
  campaign: any;
  updateField: (field: any, value: any) => void;
  readOnly: boolean;
};

function MultiSelect({ options, selected, onChange, disabled, testId }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; disabled?: boolean; testId?: string }) {
  const toggle = (opt: string) => {
    if (disabled) return;
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="flex flex-wrap gap-2" data-testid={testId}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          disabled={disabled}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${selected.includes(opt) ? "bg-blue-600 text-white border-blue-600" : "bg-muted/50 text-muted-foreground border-border hover:border-blue-500/50"} ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function TagsInput({ tags, onChange, placeholder, disabled, testId }: { tags: string[]; onChange: (t: string[]) => void; placeholder?: string; disabled?: boolean; testId?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v) && !disabled) {
      onChange([...tags, v]);
      setInput("");
    }
  };
  return (
    <div data-testid={testId}>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t, i) => (
          <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600/10 text-blue-500 text-xs font-medium">
            {t}
            {!disabled && <button onClick={() => onChange(tags.filter((_, j) => j !== i))} className="hover:text-red-400"><Trash2 className="w-3 h-3" /></button>}
          </span>
        ))}
      </div>
      {!disabled && (
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} placeholder={placeholder} className="flex-1" />
          <Button type="button" variant="outline" size="sm" onClick={add}><Plus className="w-3 h-3" /></Button>
        </div>
      )}
    </div>
  );
}

function RepeatableList({ items, onChange, placeholder, disabled, testId }: { items: string[]; onChange: (items: string[]) => void; placeholder?: string; disabled?: boolean; testId?: string }) {
  return (
    <div className="space-y-2" data-testid={testId}>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }} placeholder={placeholder} disabled={disabled} />
          {!disabled && items.length > 1 && (
            <Button variant="ghost" size="icon" onClick={() => onChange(items.filter((_, j) => j !== i))} className="shrink-0 text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ""])} className="gap-1"><Plus className="w-3 h-3" /> Add</Button>
      )}
    </div>
  );
}

function FieldGroup({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-red-400">*</span>}
      </Label>
      {children}
    </div>
  );
}

function Step1({ campaign, updateField, readOnly }: StepProps) {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = [2025, 2026, 2027, 2028, 2029, 2030];

  const parseDate = (d: string) => {
    if (!d) return { month: 0, day: 1, year: 2026 };
    const p = d.split("-");
    return { year: parseInt(p[0]), month: parseInt(p[1]) - 1, day: parseInt(p[2]) };
  };
  const makeDate = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

  const start = parseDate(campaign.startDate);
  const end = parseDate(campaign.endDate);

  return (
    <div className="space-y-5">
      <FieldGroup label="Campaign Name" required>
        <Input value={campaign.name} onChange={(e) => updateField("name", e.target.value)} disabled={readOnly} placeholder="Enter campaign name" data-testid="input-campaign-name" />
      </FieldGroup>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Brand / Company Name" required>
          <Input value={campaign.brand} onChange={(e) => updateField("brand", e.target.value)} disabled={readOnly} placeholder="Brand name" data-testid="input-brand" />
        </FieldGroup>
        <FieldGroup label="Product / Service Name" required>
          <Input value={campaign.product} onChange={(e) => updateField("product", e.target.value)} disabled={readOnly} placeholder="Product name" data-testid="input-product" />
        </FieldGroup>
      </div>
      <FieldGroup label="Primary Goal" required>
        <Select value={campaign.goal} onValueChange={(v) => updateField("goal", v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-goal"><SelectValue placeholder="Select goal" /></SelectTrigger>
          <SelectContent>
            {goals.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Target Country / Region" required>
        <MultiSelect options={countries} selected={campaign.countries || []} onChange={(v) => updateField("countries", v)} disabled={readOnly} testId="multi-select-countries" />
      </FieldGroup>
      <FieldGroup label="Primary Platform" required>
        <MultiSelect options={platformOptions} selected={campaign.platforms} onChange={(v) => updateField("platforms", v)} disabled={readOnly} testId="multi-select-platforms" />
      </FieldGroup>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Start Date" required>
          <div className="flex gap-2">
            <Select value={String(start.month)} onValueChange={(v) => updateField("startDate", makeDate(start.year, parseInt(v), Math.min(start.day, daysInMonth(parseInt(v), start.year))))} disabled={readOnly}>
              <SelectTrigger className="flex-1" data-testid="select-start-month"><SelectValue /></SelectTrigger>
              <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(start.day)} onValueChange={(v) => updateField("startDate", makeDate(start.year, start.month, parseInt(v)))} disabled={readOnly}>
              <SelectTrigger className="w-[70px]" data-testid="select-start-day"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: daysInMonth(start.month, start.year) }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(start.year)} onValueChange={(v) => updateField("startDate", makeDate(parseInt(v), start.month, Math.min(start.day, daysInMonth(start.month, parseInt(v)))))} disabled={readOnly}>
              <SelectTrigger className="w-[85px]" data-testid="select-start-year"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </FieldGroup>
        <FieldGroup label="End Date" required>
          <div className="flex gap-2">
            <Select value={String(end.month)} onValueChange={(v) => updateField("endDate", makeDate(end.year, parseInt(v), Math.min(end.day, daysInMonth(parseInt(v), end.year))))} disabled={readOnly}>
              <SelectTrigger className="flex-1" data-testid="select-end-month"><SelectValue /></SelectTrigger>
              <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(end.day)} onValueChange={(v) => updateField("endDate", makeDate(end.year, end.month, parseInt(v)))} disabled={readOnly}>
              <SelectTrigger className="w-[70px]" data-testid="select-end-day"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: daysInMonth(end.month, end.year) }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(end.year)} onValueChange={(v) => updateField("endDate", makeDate(parseInt(v), end.month, Math.min(end.day, daysInMonth(end.month, parseInt(v)))))} disabled={readOnly}>
              <SelectTrigger className="w-[85px]" data-testid="select-end-year"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {campaign.startDate && campaign.endDate && campaign.endDate <= campaign.startDate && (
            <p className="text-xs text-red-400 mt-1">End date must be after start date</p>
          )}
        </FieldGroup>
      </div>
      <FieldGroup label="Notes">
        <Textarea value={campaign.notes} onChange={(e) => updateField("notes", e.target.value)} disabled={readOnly} placeholder="Any additional notes..." rows={3} data-testid="textarea-notes" />
      </FieldGroup>
    </div>
  );
}

function Step2({ campaign, updateField, readOnly }: StepProps) {
  return (
    <div className="space-y-5">
      <FieldGroup label="Campaign Type" required>
        <Select value={campaign.campaignType} onValueChange={(v) => updateField("campaignType", v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-campaign-type"><SelectValue placeholder="Select type" /></SelectTrigger>
          <SelectContent>
            {campaignTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Target Audience Age Range">
        <MultiSelect options={ageRanges} selected={campaign.audienceAgeRanges} onChange={(v) => updateField("audienceAgeRanges", v)} disabled={readOnly} testId="multi-select-age" />
      </FieldGroup>
      <FieldGroup label="Target Audience Interests">
        <TagsInput tags={campaign.audienceInterests} onChange={(v) => updateField("audienceInterests", v)} placeholder="Add interest..." disabled={readOnly} testId="tags-interests" />
      </FieldGroup>
      <FieldGroup label="Target Audience Gender">
        <Select value={campaign.audienceGender || "all"} onValueChange={(v) => updateField("audienceGender", v === "all" ? "" : v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Tone">
        <Select value={campaign.tone || "none"} onValueChange={(v) => updateField("tone", v === "none" ? "" : v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-tone"><SelectValue placeholder="Select tone" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {tones.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <Switch checked={campaign.competitorExclusivity} onCheckedChange={(v) => updateField("competitorExclusivity", v)} disabled={readOnly} data-testid="switch-exclusivity" />
          <Label className="text-sm">Competitor Exclusivity</Label>
        </div>
        {campaign.competitorExclusivity && (
          <div className="grid sm:grid-cols-2 gap-4 pl-4 border-l-2 border-blue-500/30">
            <FieldGroup label="Exclusivity Category">
              <Input value={campaign.exclusivityCategory} onChange={(e) => updateField("exclusivityCategory", e.target.value)} disabled={readOnly} placeholder="e.g., Beauty" data-testid="input-exclusivity-category" />
            </FieldGroup>
            <FieldGroup label="Exclusivity Duration (days)">
              <Input type="number" value={campaign.exclusivityDuration || ""} onChange={(e) => updateField("exclusivityDuration", parseInt(e.target.value) || 0)} disabled={readOnly} placeholder="90" data-testid="input-exclusivity-duration" />
            </FieldGroup>
          </div>
        )}
      </div>
    </div>
  );
}

function Step3({ campaign, updateField, readOnly }: StepProps) {
  const isProductOnly = campaign.paymentModel === "Product Only";

  const addBonusRule = () => {
    updateField("bonusRules", [...campaign.bonusRules, { metric: "Views", threshold: 0, amount: 0 }]);
  };
  const updateBonusRule = (i: number, field: keyof BonusRule, value: any) => {
    const rules = [...campaign.bonusRules];
    rules[i] = { ...rules[i], [field]: value };
    updateField("bonusRules", rules);
  };
  const removeBonusRule = (i: number) => {
    updateField("bonusRules", campaign.bonusRules.filter((_: any, j: number) => j !== i));
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Total Budget" required>
          <Input type="number" value={isProductOnly ? "" : campaign.totalBudget || ""} onChange={(e) => updateField("totalBudget", parseFloat(e.target.value) || 0)} disabled={readOnly || isProductOnly} placeholder="0" data-testid="input-total-budget" />
        </FieldGroup>
        <FieldGroup label="Currency" required>
          <Select value={campaign.currency} onValueChange={(v) => updateField("currency", v)} disabled={readOnly}>
            <SelectTrigger data-testid="select-currency"><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
      <FieldGroup label="Payment Model" required>
        <Select value={campaign.paymentModel} onValueChange={(v) => updateField("paymentModel", v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-payment-model"><SelectValue placeholder="Select model" /></SelectTrigger>
          <SelectContent>
            {paymentModels.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Estimated Budget per Creator">
        <Input type="number" value={isProductOnly ? "" : campaign.budgetPerCreator || ""} onChange={(e) => updateField("budgetPerCreator", parseFloat(e.target.value) || 0)} disabled={readOnly || isProductOnly} placeholder="0" data-testid="input-budget-per-creator" />
      </FieldGroup>
      <FieldGroup label="Payment Timing" required>
        <Select value={campaign.paymentTiming} onValueChange={(v) => updateField("paymentTiming", v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-payment-timing"><SelectValue placeholder="Select timing" /></SelectTrigger>
          <SelectContent>
            {paymentTimings.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
      <div className="space-y-3">
        <Label className="text-sm font-medium">Bonus Rules</Label>
        {campaign.bonusRules.map((rule: BonusRule, i: number) => (
          <div key={i} className="flex flex-wrap items-end gap-2 p-3 rounded-lg bg-muted/30 border border-border">
            <div className="space-y-1 flex-1 min-w-[120px]">
              <Label className="text-xs text-muted-foreground">Metric</Label>
              <Select value={rule.metric} onValueChange={(v) => updateBonusRule(i, "metric", v)} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {bonusMetrics.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 w-[100px]">
              <Label className="text-xs text-muted-foreground">Threshold</Label>
              <Input type="number" value={rule.threshold || ""} onChange={(e) => updateBonusRule(i, "threshold", parseInt(e.target.value) || 0)} disabled={readOnly || isProductOnly} />
            </div>
            <div className="space-y-1 w-[100px]">
              <Label className="text-xs text-muted-foreground">Amount</Label>
              <Input type="number" value={rule.amount || ""} onChange={(e) => updateBonusRule(i, "amount", parseInt(e.target.value) || 0)} disabled={readOnly || isProductOnly} />
            </div>
            {!readOnly && (
              <Button variant="ghost" size="icon" onClick={() => removeBonusRule(i)} className="text-muted-foreground hover:text-red-400 shrink-0"><Trash2 className="w-4 h-4" /></Button>
            )}
          </div>
        ))}
        {!readOnly && (
          <Button type="button" variant="outline" size="sm" onClick={addBonusRule} className="gap-1" data-testid="button-add-bonus"><Plus className="w-3 h-3" /> Add Bonus Rule</Button>
        )}
      </div>
    </div>
  );
}

function Step4({ campaign, updateField, readOnly }: StepProps) {
  const [tab, setTab] = useState<"filter" | "manual">("filter");
  const [searchQuery, setSearchQuery] = useState("");
  const [manualHandle, setManualHandle] = useState("");
  const [manualPlatform, setManualPlatform] = useState("Instagram");
  const [manualRate, setManualRate] = useState("");
  const [manualNotes, setManualNotes] = useState("");

  const filteredCreators = mockCreatorResults.filter((c) => {
    if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.handle.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const addToShortlist = (id: string) => {
    if (!campaign.selectedCreators.includes(id)) {
      updateField("selectedCreators", [...campaign.selectedCreators, id]);
    }
  };
  const removeFromShortlist = (id: string) => {
    updateField("selectedCreators", campaign.selectedCreators.filter((c: string) => c !== id));
  };

  const addManualCreator = () => {
    if (!manualHandle.trim()) return;
    const creator: ManualCreator = { handle: manualHandle.trim(), platform: manualPlatform, rate: parseFloat(manualRate) || 0, notes: manualNotes };
    updateField("manualCreators", [...campaign.manualCreators, creator]);
    setManualHandle("");
    setManualRate("");
    setManualNotes("");
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg w-fit">
        <button onClick={() => setTab("filter")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "filter" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} data-testid="tab-filter">Filter & Shortlist</button>
        <button onClick={() => setTab("manual")} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "manual" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`} data-testid="tab-manual">Manual Add</button>
      </div>

      {tab === "filter" ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search creators..." className="pl-9" disabled={readOnly} data-testid="input-search-creators" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Creator</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platform</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Followers</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Engagement</th>
                  <th className="text-left text-xs font-medium text-muted-foreground pb-3">Niche</th>
                  <th className="text-right text-xs font-medium text-muted-foreground pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCreators.map((c) => {
                  const isSelected = campaign.selectedCreators.includes(c.id);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0">
                      <td className="py-3">
                        <p className="text-sm font-medium text-foreground">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.handle}</p>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{c.platform}</td>
                      <td className="py-3 text-sm text-muted-foreground">{c.followers}</td>
                      <td className="py-3 text-sm text-green-500">{c.engagement}</td>
                      <td className="py-3 text-sm text-muted-foreground">{c.niche}</td>
                      <td className="py-3 text-right">
                        {!readOnly && (
                          isSelected ? (
                            <Button variant="ghost" size="sm" onClick={() => removeFromShortlist(c.id)} className="text-green-500 gap-1" data-testid={`button-remove-creator-${c.id}`}>
                              <Check className="w-3 h-3" /> Added
                            </Button>
                          ) : (
                            <Button variant="outline" size="sm" onClick={() => addToShortlist(c.id)} className="gap-1" data-testid={`button-add-creator-${c.id}`}>
                              <UserPlus className="w-3 h-3" /> Add
                            </Button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {campaign.selectedCreators.length > 0 && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-sm font-medium text-foreground mb-2">Shortlisted ({campaign.selectedCreators.length})</p>
              <div className="flex flex-wrap gap-2">
                {campaign.selectedCreators.map((id: string) => {
                  const c = mockCreatorResults.find((cr) => cr.id === id);
                  return (
                    <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-500 text-xs font-medium">
                      {c?.name || id}
                      {!readOnly && <button onClick={() => removeFromShortlist(id)} className="hover:text-red-400"><Trash2 className="w-3 h-3" /></button>}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <FieldGroup label="Creator Handle">
              <Input value={manualHandle} onChange={(e) => setManualHandle(e.target.value)} disabled={readOnly} placeholder="@handle" data-testid="input-manual-handle" />
            </FieldGroup>
            <FieldGroup label="Platform">
              <Select value={manualPlatform} onValueChange={setManualPlatform} disabled={readOnly}>
                <SelectTrigger data-testid="select-manual-platform"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {platformOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup label="Proposed Rate">
            <Input type="number" value={manualRate} onChange={(e) => setManualRate(e.target.value)} disabled={readOnly} placeholder="0" data-testid="input-manual-rate" />
          </FieldGroup>
          <FieldGroup label="Notes">
            <Textarea value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} disabled={readOnly} placeholder="Notes about this creator..." rows={2} data-testid="textarea-manual-notes" />
          </FieldGroup>
          {!readOnly && (
            <Button onClick={addManualCreator} disabled={!manualHandle.trim()} className="gap-1" data-testid="button-add-manual-creator">
              <UserPlus className="w-4 h-4" /> Add Creator
            </Button>
          )}
          {campaign.manualCreators.length > 0 && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-medium">Added Creators ({campaign.manualCreators.length})</Label>
              {campaign.manualCreators.map((c: ManualCreator, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.handle}</p>
                    <p className="text-xs text-muted-foreground">{c.platform} · Rate: {c.rate}</p>
                  </div>
                  {!readOnly && (
                    <Button variant="ghost" size="icon" onClick={() => updateField("manualCreators", campaign.manualCreators.filter((_: any, j: number) => j !== i))} className="text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Step5({ campaign, updateField, readOnly }: StepProps) {
  return (
    <div className="space-y-5">
      <FieldGroup label="Brand Overview" required>
        <Textarea value={campaign.brandOverview} onChange={(e) => updateField("brandOverview", e.target.value)} disabled={readOnly} placeholder="Describe the brand..." rows={3} data-testid="textarea-brand-overview" />
      </FieldGroup>
      <FieldGroup label="Product Details" required>
        <Textarea value={campaign.productDetails} onChange={(e) => updateField("productDetails", e.target.value)} disabled={readOnly} placeholder="Describe the product or service..." rows={3} data-testid="textarea-product-details" />
      </FieldGroup>
      <FieldGroup label="Key Messages" required>
        <RepeatableList items={campaign.keyMessages} onChange={(v) => updateField("keyMessages", v)} placeholder="Key message..." disabled={readOnly} testId="list-key-messages" />
      </FieldGroup>
      <FieldGroup label="Do's">
        <RepeatableList items={campaign.dos.length ? campaign.dos : [""]} onChange={(v) => updateField("dos", v)} placeholder="Do..." disabled={readOnly} testId="list-dos" />
      </FieldGroup>
      <FieldGroup label="Don'ts">
        <RepeatableList items={campaign.donts.length ? campaign.donts : [""]} onChange={(v) => updateField("donts", v)} placeholder="Don't..." disabled={readOnly} testId="list-donts" />
      </FieldGroup>
      <FieldGroup label="Mandatory Requirements">
        <MultiSelect options={mandatoryRequirementOptions} selected={campaign.mandatoryRequirements} onChange={(v) => updateField("mandatoryRequirements", v)} disabled={readOnly} testId="multi-select-requirements" />
      </FieldGroup>
      <FieldGroup label="Hashtags">
        <TagsInput tags={campaign.hashtags} onChange={(v) => updateField("hashtags", v)} placeholder="#hashtag" disabled={readOnly} testId="tags-hashtags" />
      </FieldGroup>
      <FieldGroup label="Mentions / Tags">
        <TagsInput tags={campaign.mentions} onChange={(v) => updateField("mentions", v)} placeholder="@mention" disabled={readOnly} testId="tags-mentions" />
      </FieldGroup>
      <FieldGroup label="Reference Links">
        <RepeatableList items={campaign.referenceLinks.length ? campaign.referenceLinks : [""]} onChange={(v) => updateField("referenceLinks", v)} placeholder="https://..." disabled={readOnly} testId="list-reference-links" />
      </FieldGroup>
      <FieldGroup label="File Uploads">
        <div className="flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-lg">
          <FileUp className="w-5 h-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Drag files here or click to upload brand kit, product images</p>
        </div>
      </FieldGroup>
    </div>
  );
}

function Step6({ campaign, updateField, readOnly }: StepProps) {
  const addDeliverable = () => {
    const d: Deliverable = {
      id: crypto.randomUUID(),
      platform: "Instagram",
      contentType: "Reel",
      quantity: 1,
      draftRequired: false,
      draftDueDate: "",
      publishDueDate: "",
      usageRights: "Organic Only",
      usageDuration: "30 Days",
      formatNotes: "",
    };
    updateField("deliverables", [...campaign.deliverables, d]);
  };

  const updateDeliverable = (i: number, field: keyof Deliverable, value: any) => {
    const deliverables = [...campaign.deliverables];
    deliverables[i] = { ...deliverables[i], [field]: value };
    updateField("deliverables", deliverables);
  };

  const removeDeliverable = (i: number) => {
    updateField("deliverables", campaign.deliverables.filter((_: any, j: number) => j !== i));
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">Define the content deliverables for this campaign.</p>
      {campaign.deliverables.map((d: Deliverable, i: number) => (
        <Card key={d.id} className="p-4 bg-muted/20 border-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Deliverable {i + 1}</p>
            {!readOnly && (
              <Button variant="ghost" size="icon" onClick={() => removeDeliverable(i)} className="text-muted-foreground hover:text-red-400"><Trash2 className="w-4 h-4" /></Button>
            )}
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <FieldGroup label="Platform" required>
              <Select value={d.platform} onValueChange={(v) => updateDeliverable(i, "platform", v)} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{platformOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Content Type" required>
              <Select value={d.contentType} onValueChange={(v) => updateDeliverable(i, "contentType", v)} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{contentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Quantity" required>
              <Input type="number" value={d.quantity || ""} onChange={(e) => updateDeliverable(i, "quantity", parseInt(e.target.value) || 1)} disabled={readOnly} min={1} />
            </FieldGroup>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={d.draftRequired} onCheckedChange={(v) => updateDeliverable(i, "draftRequired", v)} disabled={readOnly} />
            <Label className="text-sm">Draft Required</Label>
          </div>
          {d.draftRequired && (
            <FieldGroup label="Draft Due Date" required>
              <Input type="date" value={d.draftDueDate} onChange={(e) => updateDeliverable(i, "draftDueDate", e.target.value)} disabled={readOnly} />
            </FieldGroup>
          )}
          <FieldGroup label="Publish Due Date" required>
            <Input type="date" value={d.publishDueDate} onChange={(e) => updateDeliverable(i, "publishDueDate", e.target.value)} disabled={readOnly} />
          </FieldGroup>
          <div className="grid sm:grid-cols-2 gap-3">
            <FieldGroup label="Usage Rights" required>
              <Select value={d.usageRights} onValueChange={(v) => updateDeliverable(i, "usageRights", v)} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{usageRights.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </FieldGroup>
            <FieldGroup label="Usage Duration">
              <Select value={d.usageDuration || "none"} onValueChange={(v) => updateDeliverable(i, "usageDuration", v === "none" ? "" : v)} disabled={readOnly}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {usageDurations.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </FieldGroup>
          </div>
          <FieldGroup label="Format Notes">
            <Textarea value={d.formatNotes} onChange={(e) => updateDeliverable(i, "formatNotes", e.target.value)} disabled={readOnly} placeholder="e.g., 9:16, 20-30 seconds, hook in first 2 seconds" rows={2} />
          </FieldGroup>
        </Card>
      ))}
      {!readOnly && (
        <Button variant="outline" onClick={addDeliverable} className="gap-1 w-full" data-testid="button-add-deliverable">
          <Plus className="w-4 h-4" /> Add Deliverable
        </Button>
      )}
    </div>
  );
}

function Step7({ campaign, updateField, readOnly }: StepProps) {
  return (
    <div className="space-y-5">
      <FieldGroup label="KPIs" required>
        <MultiSelect options={kpis} selected={campaign.kpis} onChange={(v) => updateField("kpis", v)} disabled={readOnly} testId="multi-select-kpis" />
      </FieldGroup>
      <FieldGroup label="Tracking Methods">
        <MultiSelect options={trackingMethods} selected={campaign.trackingMethods} onChange={(v) => updateField("trackingMethods", v)} disabled={readOnly} testId="multi-select-tracking" />
      </FieldGroup>
      <FieldGroup label="UTM Base URL">
        <Input value={campaign.utmBaseUrl} onChange={(e) => updateField("utmBaseUrl", e.target.value)} disabled={readOnly} placeholder="https://example.com" data-testid="input-utm-url" />
      </FieldGroup>
      <FieldGroup label="Promo Code Pattern">
        <Input value={campaign.promoCodePattern} onChange={(e) => updateField("promoCodePattern", e.target.value)} disabled={readOnly} placeholder="e.g., BRAND-{CREATOR}" data-testid="input-promo-pattern" />
      </FieldGroup>
      <FieldGroup label="Reporting Frequency" required>
        <Select value={campaign.reportingFrequency} onValueChange={(v) => updateField("reportingFrequency", v)} disabled={readOnly}>
          <SelectTrigger data-testid="select-reporting-frequency"><SelectValue placeholder="Select frequency" /></SelectTrigger>
          <SelectContent>
            {reportingFrequencies.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Export Format">
        <MultiSelect options={exportFormats} selected={campaign.exportFormats} onChange={(v) => updateField("exportFormats", v)} disabled={readOnly} testId="multi-select-export" />
      </FieldGroup>
    </div>
  );
}

function Step8({ campaign }: { campaign: any }) {
  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">{title}</h4>
      {children}
    </div>
  );
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );
  const currencyObj = currencies.find((c) => c.code === campaign.currency);

  return (
    <div className="space-y-6">
      <Section title="Campaign Basics">
        <Row label="Campaign Name" value={campaign.name} />
        <Row label="Brand" value={campaign.brand} />
        <Row label="Product" value={campaign.product} />
        <Row label="Goal" value={campaign.goal} />
        <Row label="Countries" value={campaign.countries?.join(", ")} />
        <Row label="Platforms" value={campaign.platforms.join(", ")} />
        <Row label="Date Range" value={`${campaign.startDate} → ${campaign.endDate}`} />
        {campaign.notes && <Row label="Notes" value={campaign.notes} />}
      </Section>
      <Section title="Campaign Setup">
        <Row label="Type" value={campaign.campaignType} />
        <Row label="Audience Ages" value={campaign.audienceAgeRanges.join(", ")} />
        <Row label="Interests" value={campaign.audienceInterests.join(", ")} />
        <Row label="Gender" value={campaign.audienceGender || "All"} />
        <Row label="Tone" value={campaign.tone} />
        <Row label="Exclusivity" value={campaign.competitorExclusivity ? `${campaign.exclusivityCategory} (${campaign.exclusivityDuration} days)` : "No"} />
      </Section>
      <Section title="Budget & Payment">
        <Row label="Total Budget" value={`${currencyObj?.symbol || ""}${campaign.totalBudget.toLocaleString()}`} />
        <Row label="Payment Model" value={campaign.paymentModel} />
        <Row label="Per Creator" value={campaign.budgetPerCreator ? `${currencyObj?.symbol || ""}${campaign.budgetPerCreator.toLocaleString()}` : "—"} />
        <Row label="Timing" value={campaign.paymentTiming} />
        {campaign.bonusRules.length > 0 && (
          <div className="pt-1">
            <p className="text-xs text-muted-foreground mb-1">Bonus Rules:</p>
            {campaign.bonusRules.map((r: BonusRule, i: number) => (
              <p key={i} className="text-xs text-foreground">• {r.metric} ≥ {r.threshold.toLocaleString()} → {currencyObj?.symbol || ""}{r.amount.toLocaleString()}</p>
            ))}
          </div>
        )}
      </Section>
      <Section title="Selected Creators">
        <Row label="Shortlisted" value={campaign.selectedCreators.length > 0 ? campaign.selectedCreators.map((id: string) => mockCreatorResults.find((c) => c.id === id)?.name || id).join(", ") : "None"} />
        <Row label="Manual Adds" value={campaign.manualCreators.length > 0 ? campaign.manualCreators.map((c: ManualCreator) => c.handle).join(", ") : "None"} />
      </Section>
      <Section title="Campaign Brief">
        <Row label="Brand Overview" value={campaign.brandOverview ? "✓ Provided" : "—"} />
        <Row label="Product Details" value={campaign.productDetails ? "✓ Provided" : "—"} />
        <Row label="Key Messages" value={campaign.keyMessages.filter(Boolean).join(", ")} />
        <Row label="Requirements" value={campaign.mandatoryRequirements.join(", ")} />
        <Row label="Hashtags" value={campaign.hashtags.join(", ")} />
        <Row label="Mentions" value={campaign.mentions.join(", ")} />
      </Section>
      <Section title="Deliverables">
        {campaign.deliverables.length > 0 ? campaign.deliverables.map((d: Deliverable, i: number) => (
          <div key={i} className="p-2 rounded bg-muted/30 text-xs space-y-0.5">
            <p className="font-medium text-foreground">{d.platform} — {d.contentType} × {d.quantity}</p>
            <p className="text-muted-foreground">Publish by: {d.publishDueDate || "TBD"} · Rights: {d.usageRights}</p>
          </div>
        )) : <p className="text-sm text-muted-foreground">No deliverables defined</p>}
      </Section>
      <Section title="Reporting">
        <Row label="KPIs" value={campaign.kpis.join(", ")} />
        <Row label="Tracking" value={campaign.trackingMethods.join(", ")} />
        <Row label="Frequency" value={campaign.reportingFrequency} />
        <Row label="Export" value={campaign.exportFormats.join(", ")} />
        {campaign.utmBaseUrl && <Row label="UTM URL" value={campaign.utmBaseUrl} />}
        {campaign.promoCodePattern && <Row label="Promo Pattern" value={campaign.promoCodePattern} />}
      </Section>
    </div>
  );
}
