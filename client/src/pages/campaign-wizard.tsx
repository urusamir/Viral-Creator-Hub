import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type Campaign,
  type Deliverable,
  getCampaignAsync,
  createCampaign,
  updateCampaign,
  createDefaultCampaign,
  goals,
  platformOptions,
  countries,
  ageRanges,
  currencies,
  contentTypes,
} from "@/lib/campaigns";
import { useAuth } from "@/lib/auth";
import { creatorsData } from "@/lib/creators-data";

const stepLabels = [
  "Campaign Basics",
  "Campaign Brief",
  "Review & Launch",
];

export default function CampaignWizardPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const pathParts = location.split("/");
  const lastSegment = pathParts[pathParts.length - 1];
  const campaignId = lastSegment === "new" || lastSegment === "campaigns" ? null : lastSegment;
  const isNew = !campaignId;

  const [campaign, setCampaign] = useState<Omit<Campaign, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string; updatedAt?: string }>(createDefaultCampaign());
  const [step, setStep] = useState(1);
  const [savedId, setSavedId] = useState<string | null>(null);
  const readOnly = campaign.status === "PUBLISHED";

  useEffect(() => {
    if (!isNew && campaignId) {
      getCampaignAsync(campaignId).then((existing) => {
        if (existing) {
          setCampaign(existing);
          setStep(existing.status === "PUBLISHED" ? 1 : existing.lastStep || 1);
          setSavedId(existing.id);
        }
      });
    }
  }, [campaignId, isNew]);

  const updateField = useCallback(<K extends keyof Campaign>(field: K, value: Campaign[K]) => {
    if (readOnly) return;
    setCampaign((prev) => ({ ...prev, [field]: value }));
  }, [readOnly]);

  const saveDraft = useCallback(async () => {
    const data = { ...campaign, lastStep: step, status: "DRAFT" as const };
    if (savedId) {
      const success = await updateCampaign(savedId, data);
      if (success) {
        toast({ title: "Draft saved", description: "Your campaign draft has been saved." });
      }
    } else {
      const created = await createCampaign(data, user?.id || "");
      if (created) {
        setSavedId(created.id);
        toast({ title: "Draft created", description: "Your campaign draft has been created." });
      }
    }
  }, [campaign, step, savedId, toast, user?.id]);

  const publish = useCallback(async () => {
    if (!campaign.name || !campaign.brand || !campaign.product || !campaign.goal || campaign.platforms.length === 0 || !campaign.startDate || !campaign.endDate) {
      toast({ title: "Validation error", description: "Please complete all required fields in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (campaign.totalBudget <= 0) {
      toast({ title: "Validation error", description: "Please set a valid budget in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (campaign.keyMessages.filter(Boolean).length === 0) {
      toast({ title: "Validation error", description: "Please provide at least one Key Message in Step 2.", variant: "destructive" });
      setStep(2);
      return;
    }

    const data = { ...campaign, status: "PUBLISHED" as const, lastStep: 3 };
    if (savedId) {
      const success = await updateCampaign(savedId, data);
      if (success) {
        toast({ title: "Campaign published!", description: "Your campaign is now live." });
        setTimeout(() => setLocation("/dashboard/campaigns"), 500);
      }
    } else {
      const created = await createCampaign(data, user?.id || "");
      if (created) {
        setSavedId(created.id);
        toast({ title: "Campaign published!", description: "Your campaign is now live." });
        setTimeout(() => setLocation("/dashboard/campaigns"), 500);
      }
    }
  }, [campaign, savedId, toast, setLocation, user?.id]);

  const canGoNext = useCallback(() => {
    switch (step) {
      case 1:
        return !!(campaign.name && campaign.brand && campaign.product && campaign.goal && (campaign.countries?.length > 0) && campaign.platforms.length > 0 && campaign.startDate && campaign.endDate && campaign.endDate > campaign.startDate && campaign.totalBudget > 0);
      case 2:
        return !!(campaign.keyMessages.filter(Boolean).length > 0);
      default:
        return true;
    }
  }, [step, campaign]);

  const goNext = () => {
    if (step < 3) setStep(step + 1);
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

      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-6 sm:p-8 w-full max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard/campaigns")} data-testid="button-back-mobile">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1" data-testid="text-step-title">
            {stepLabels[step - 1]}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Step {step} of 3</p>

          <Card className="p-6 bg-card border-border">
            {step === 1 && <Step1 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 2 && <Step2 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 3 && <Step3 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
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
              {step < 3 ? (
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
      <Label className="text-sm font-medium flex items-center gap-1">
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
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Campaign Name" required>
          <Input value={campaign.name} onChange={(e) => updateField("name", e.target.value)} disabled={readOnly} placeholder="Enter campaign name" />
        </FieldGroup>
        <FieldGroup label="Primary Goal" required>
          <Select value={campaign.goal} onValueChange={(v) => updateField("goal", v)} disabled={readOnly}>
            <SelectTrigger><SelectValue placeholder="Select goal" /></SelectTrigger>
            <SelectContent>
              {goals.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Brand Name" required>
          <Input value={campaign.brand} onChange={(e) => updateField("brand", e.target.value)} disabled={readOnly} placeholder="Brand name" />
        </FieldGroup>
        <FieldGroup label="Product Name" required>
          <Input value={campaign.product} onChange={(e) => updateField("product", e.target.value)} disabled={readOnly} placeholder="Product name" />
        </FieldGroup>
      </div>

      <FieldGroup label="Target Platform(s)" required>
        <MultiSelect options={platformOptions} selected={campaign.platforms} onChange={(v) => updateField("platforms", v)} disabled={readOnly} />
      </FieldGroup>
      <FieldGroup label="Target Countr(ies)" required>
        <MultiSelect options={countries} selected={campaign.countries || []} onChange={(v) => updateField("countries", v)} disabled={readOnly} />
      </FieldGroup>
      <FieldGroup label="Target Audience Age Range">
        <MultiSelect options={ageRanges} selected={campaign.audienceAgeRanges} onChange={(v) => updateField("audienceAgeRanges", v)} disabled={readOnly} />
      </FieldGroup>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Total Budget" required>
          <Input type="number" value={campaign.totalBudget || ""} onChange={(e) => updateField("totalBudget", parseFloat(e.target.value) || 0)} disabled={readOnly} placeholder="0" />
        </FieldGroup>
        <FieldGroup label="Currency" required>
          <Select value={campaign.currency} onValueChange={(v) => updateField("currency", v)} disabled={readOnly}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {currencies.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FieldGroup>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <FieldGroup label="Start Date" required>
          <div className="flex gap-2">
            <Select value={String(start.month)} onValueChange={(v) => updateField("startDate", makeDate(start.year, parseInt(v), Math.min(start.day, daysInMonth(parseInt(v), start.year))))} disabled={readOnly}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(start.day)} onValueChange={(v) => updateField("startDate", makeDate(start.year, start.month, parseInt(v)))} disabled={readOnly}>
              <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: daysInMonth(start.month, start.year) }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(start.year)} onValueChange={(v) => updateField("startDate", makeDate(parseInt(v), start.month, Math.min(start.day, daysInMonth(start.month, parseInt(v)))))} disabled={readOnly}>
              <SelectTrigger className="w-[85px]"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </FieldGroup>
        <FieldGroup label="End Date" required>
          <div className="flex gap-2">
            <Select value={String(end.month)} onValueChange={(v) => updateField("endDate", makeDate(end.year, parseInt(v), Math.min(end.day, daysInMonth(parseInt(v), end.year))))} disabled={readOnly}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>{monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(end.day)} onValueChange={(v) => updateField("endDate", makeDate(end.year, end.month, parseInt(v)))} disabled={readOnly}>
              <SelectTrigger className="w-[70px]"><SelectValue /></SelectTrigger>
              <SelectContent>{Array.from({ length: daysInMonth(end.month, end.year) }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={String(end.year)} onValueChange={(v) => updateField("endDate", makeDate(parseInt(v), end.month, Math.min(end.day, daysInMonth(end.month, parseInt(v)))))} disabled={readOnly}>
              <SelectTrigger className="w-[85px]"><SelectValue /></SelectTrigger>
              <SelectContent>{years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {campaign.startDate && campaign.endDate && campaign.endDate <= campaign.startDate && (
            <p className="text-xs text-red-400 mt-1">End date must be after start date</p>
          )}
        </FieldGroup>
      </div>
    </div>
  );
}

function Step2({ campaign, updateField, readOnly }: StepProps) {
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
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-2">Messaging & Assets</h3>
        <FieldGroup label="Key Messages" required>
          <RepeatableList items={campaign.keyMessages.length ? campaign.keyMessages : [""]} onChange={(v) => updateField("keyMessages", v)} placeholder="Key message..." disabled={readOnly} />
        </FieldGroup>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Do's">
            <RepeatableList items={campaign.dos.length ? campaign.dos : [""]} onChange={(v) => updateField("dos", v)} placeholder="Do..." disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Don'ts">
            <RepeatableList items={campaign.donts.length ? campaign.donts : [""]} onChange={(v) => updateField("donts", v)} placeholder="Don't..." disabled={readOnly} />
          </FieldGroup>
        </div>
        <FieldGroup label="Reference Links">
          <RepeatableList items={campaign.referenceLinks.length ? campaign.referenceLinks : [""]} onChange={(v) => updateField("referenceLinks", v)} placeholder="https://..." disabled={readOnly} />
        </FieldGroup>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Hashtags">
            <TagsInput tags={campaign.hashtags} onChange={(v) => updateField("hashtags", v)} placeholder="#hashtag" disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Mentions / Tags">
            <TagsInput tags={campaign.mentions} onChange={(v) => updateField("mentions", v)} placeholder="@mention" disabled={readOnly} />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-2">Deliverables Setup</h3>
        {campaign.deliverables.map((d: Deliverable, i: number) => (
          <Card key={d.id} className="p-4 bg-muted/20 border-border space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Content Unit {i + 1}</p>
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
              <FieldGroup label="Content Format" required>
                <Select value={d.contentType} onValueChange={(v) => updateDeliverable(i, "contentType", v)} disabled={readOnly}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{contentTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </FieldGroup>
              <FieldGroup label="Quantity" required>
                <Input type="number" value={d.quantity || ""} onChange={(e) => updateDeliverable(i, "quantity", parseInt(e.target.value) || 1)} disabled={readOnly} min={1} />
              </FieldGroup>
            </div>
            <FieldGroup label="Content Details / Notes">
              <Textarea value={d.formatNotes} onChange={(e) => updateDeliverable(i, "formatNotes", e.target.value)} disabled={readOnly} placeholder="e.g. Include 9:16 ratio, hook in first 2 seconds" rows={2} />
            </FieldGroup>
          </Card>
        ))}
        {!readOnly && (
          <Button variant="outline" onClick={addDeliverable} className="gap-1 w-full border-dashed" data-testid="button-add-deliverable">
            <Plus className="w-4 h-4" /> Add Deliverable
          </Button>
        )}
      </div>
    </div>
  );
}

function Step3({ campaign, updateField, readOnly }: StepProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCreators = creatorsData.filter((c) => {
    if (searchQuery && !(c.fullname || "").toLowerCase().includes(searchQuery.toLowerCase()) && !c.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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

  const currencyObj = currencies.find((c) => c.code === campaign.currency);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">{title}</h4>
      {children}
    </div>
  );
  
  const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground text-right max-w-[60%] font-medium">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-2">Creator Selection</h3>
        <p className="text-sm text-muted-foreground">Select creators for this campaign from your database. You can also finalize this later.</p>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search creators..." className="pl-9" disabled={readOnly} />
          </div>
        </div>
        
        <div className="overflow-x-auto border border-border rounded-lg max-h-[250px] overflow-y-auto">
          <table className="w-full relative">
            <thead className="sticky top-0 bg-card/90 backdrop-blur z-10">
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Creator</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Platform</th>
                <th className="text-left text-xs font-medium text-muted-foreground p-3">Followers</th>
                <th className="text-right text-xs font-medium text-muted-foreground p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCreators.slice(0, 15).map((c) => {
                const isSelected = campaign.selectedCreators.includes(c.username);
                return (
                  <tr key={c.username} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{c.fullname || c.username}</p>
                      <p className="text-xs text-muted-foreground">@{c.username}</p>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{c.channel}</td>
                    <td className="p-3 text-sm text-muted-foreground">{(c.followers || 0).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {!readOnly && (
                        isSelected ? (
                          <Button variant="ghost" size="sm" onClick={() => removeFromShortlist(c.username)} className="text-green-500 gap-1 hover:text-green-600 hover:bg-green-50">
                            <Check className="w-3 h-3" /> Added
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => addToShortlist(c.username)} className="gap-1">
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
          <div className="p-4 rounded-lg bg-muted/30 border border-border shadow-sm">
            <p className="text-sm font-medium text-foreground mb-2">Shortlisted Creators ({campaign.selectedCreators.length})</p>
            <div className="flex flex-wrap gap-2">
              {campaign.selectedCreators.map((id: string) => {
                const c = creatorsData.find((cr) => cr.username === id);
                return (
                  <span key={id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-500 border border-blue-500/20 text-xs font-medium">
                    {c?.fullname || c?.username || id}
                    {!readOnly && <button onClick={() => removeFromShortlist(id)} className="hover:text-red-600 hover:bg-red-50 rounded-full p-0.5"><Trash2 className="w-3 h-3" /></button>}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-2">Campaign Summary</h3>
        <Card className="p-5 bg-card border-border shadow-sm grid sm:grid-cols-2 gap-8">
          <Section title="Overview">
            <Row label="Name" value={campaign.name} />
            <Row label="Brand / Product" value={`${campaign.brand} - ${campaign.product}`} />
            <Row label="Goal" value={campaign.goal} />
            <Row label="Platform(s)" value={campaign.platforms.join(", ")} />
            <Row label="Location(s)" value={campaign.countries?.join(", ")} />
          </Section>
          <Section title="Details">
            <Row label="Timeline" value={`${campaign.startDate} → ${campaign.endDate}`} />
            <Row label="Target Budget" value={`${currencyObj?.symbol || ""}${campaign.totalBudget.toLocaleString()}`} />
            <Row label="Age Range" value={campaign.audienceAgeRanges.join(", ") || "Any"} />
            <Row label="Deliverables" value={`${campaign.deliverables.reduce((acc: number, d: any) => acc + (d.quantity || 1), 0)} outputs`} />
            <Row label="Key Messages" value={`${campaign.keyMessages.filter(Boolean).length} points`} />
          </Section>
        </Card>
      </div>
    </div>
  );
}
