import { useState, useEffect, useCallback, useMemo, useRef, memo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
  LayoutDashboard,
  Users,
  Calendar,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  type Campaign,
  type CampaignBrief,
  type Deliverable,
  getCampaignAsync,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  createDefaultCampaign,
  goals,
  platformOptions,
  countries,
  ageRanges,
  currencies,
  contentTypes,
} from "@/models/campaign.types";
import { syncCampaignDeliverablesToCalendar } from "@/services/api/calendar";
import { useAuth } from "@/providers/auth.provider";
import { formatDisplayDate, formatMonthDay } from "@/utils/format";
import { creatorsData } from "@/models/creators.data";
import { usePrefetchedData } from "@/providers/prefetch.provider";

const stepLabels = [
  "Campaign Basics",
  "Campaign Brief",
  "Ad Creators and Deliverables",
  "Campaign Summary",
];

// --- Memoized Wizard Components ---
const SelectionCard = memo(({ 
  creator, 
  isShortlisted, 
  onAdd, 
  onRemove 
}: { 
  creator: any, 
  isShortlisted: boolean, 
  onAdd: (id: string) => void, 
  onRemove: (id: string) => void 
}) => {
  return (
    <Card 
      className={`p-4 transition-all duration-300 ${
        isShortlisted ? "border-emerald-500/30 bg-emerald-500/5" : "border-border/50 bg-background/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
            {creator.username[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{creator.fullname}</p>
            <p className="text-xs text-muted-foreground">@{creator.username}</p>
          </div>
        </div>
        <Button
          size="sm"
          variant={isShortlisted ? "destructive" : "outline"}
          onClick={() => isShortlisted ? onRemove(creator.username) : onAdd(creator.username)}
          className="h-8 rounded-full text-[10px] font-bold uppercase tracking-tight"
        >
          {isShortlisted ? <Trash2 className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          {isShortlisted ? "Remove" : "Shortlist"}
        </Button>
      </div>
    </Card>
  );
});

export default function CampaignWizardPage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pathParts = location.split("/");
  const lastSegment = pathParts[pathParts.length - 1];
  const campaignId = lastSegment === "new" || lastSegment === "campaigns" ? null : lastSegment;
  const isNew = !campaignId;

  const [campaign, setCampaign] = useState<Omit<Campaign, "id" | "createdAt" | "updatedAt"> & { id?: string; createdAt?: string; updatedAt?: string }>(createDefaultCampaign());
  const [step, setStep] = useState(1);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const isSavingRef = useRef(false);
  const readOnly = campaign.status === "PUBLISHED" || campaign.status === "FINISHED";

  useEffect(() => {
    if (!isNew && campaignId) {
      getCampaignAsync(campaignId, user?.id).then((existing) => {
        if (existing) {
          setCampaign(existing);
          // If it's a published/finished campaign, start at Step 1 for overview.
          // Otherwise, continue where they left off.
          if (existing.status === "PUBLISHED" || existing.status === "FINISHED") {
            setStep(1);
          } else {
            setStep(existing.lastStep || 1);
          }
          setSavedId(existing.id);
        }
      });
    } else if (isNew) {
      setCampaign(createDefaultCampaign());
      setStep(1);
      setSavedId(null);
    }
  }, [campaignId, isNew]);

  const updateField = useCallback(<K extends keyof Campaign>(field: K, value: Campaign[K]) => {
    if (readOnly) return;
    setCampaign((prev) => ({ ...prev, [field]: value }));
  }, [readOnly]);

  const saveDraft = useCallback(async () => {
    const data = { ...campaign, lastStep: step, status: campaign.status || "DRAFT" };
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

  const saveDraftQuietly = useCallback(async () => {
    if (readOnly || isSavingRef.current) return;
    isSavingRef.current = true;
    try {
      const data = { ...campaign, lastStep: step, status: campaign.status || "DRAFT" };
      if (savedId) {
        await updateCampaign(savedId, data);
      } else {
        if (!data.name && !data.brand) return; // Require some minimal input before creating record
        const created = await createCampaign(data, user?.id || "");
        if (created) {
          setSavedId(created.id);
        }
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [campaign, step, savedId, user?.id, readOnly]);

  useEffect(() => {
    if (readOnly || isPublishing) return;
    if (isNew && !savedId && !campaign.name && !campaign.brand) return; 
    
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraftQuietly();
    }, 2000);
    
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [campaign, step, readOnly, isNew, savedId, saveDraftQuietly, isPublishing]);

  const saveDraftAndExit = async () => {
    await saveDraftQuietly();
    toast({ title: "Draft saved", description: "Your campaign draft has been saved." });
    setTimeout(() => setLocation("/dashboard/campaigns"), 500);
  };

  const publish = useCallback(async () => {
    if (isPublishing || isSavingRef.current) return;
    
    // Immediate cancellation of any pending background save
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    
    if (!campaign.name || !campaign.brand || !campaign.product || !campaign.goal || campaign.platforms.length === 0 || !campaign.startDate || !campaign.endDate) {
      toast({ title: "Validation error", description: "Please complete all required fields in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (campaign.endDate < campaign.startDate) {
      toast({ title: "Validation error", description: "End date must be after or equal to start date.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (campaign.totalBudget <= 0) {
      toast({ title: "Validation error", description: "Please set a valid budget in Step 1.", variant: "destructive" });
      setStep(1);
      return;
    }
    if (!campaign.briefs || campaign.briefs.length === 0) {
      toast({ title: "Validation error", description: "Please provide at least one Brief (Step 2).", variant: "destructive" });
      setStep(2);
      return;
    }
    if (!campaign.selectedCreators || campaign.selectedCreators.length === 0) {
      toast({ title: "Validation error", description: "Please add at least one creator (Step 3).", variant: "destructive" });
      setStep(3);
      return;
    }
    const missingDeliverables = campaign.selectedCreators.some((c: any) => !c.deliverables || c.deliverables.length === 0);
    if (missingDeliverables) {
      toast({ title: "Validation error", description: "All selected creators must have at least one deliverable allocated.", variant: "destructive" });
      setStep(3);
      return;
    }
    const missingBriefs = campaign.selectedCreators.some((c: any) => c.deliverables?.some((d: any) => !d.briefId));
    if (missingBriefs) {
      toast({ title: "Validation error", description: "All deliverables must be linked to a brief. Check the Brief column (red fields) in Step 3.", variant: "destructive" });
      setStep(3);
      return;
    }

    setIsPublishing(true);
    isSavingRef.current = true;
    try {
      const data = { ...campaign, status: "PUBLISHED" as const, lastStep: 4 };

      // 30s timeout — publish must NEVER hang forever
      const raceTimeout = (p: Promise<unknown>, ms: number, label: string) =>
        Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error(`${label} timed out`)), ms))]);

      if (savedId) {
        const success = await raceTimeout(updateCampaign(savedId, data), 30000, "Campaign update") as boolean;
        if (success) {
          // Fire-and-forget: calendar sync in background
          if (user?.id) {
            syncCampaignDeliverablesToCalendar({ ...data, id: savedId }, user.id)
              .catch(e => console.warn("[calendar sync] background error:", e));
          }
          toast({ title: "Campaign published! 🎉", description: "Your campaign is now live." });
          window.dispatchEvent(new Event("vairal-campaigns-updated"));
          setTimeout(() => setLocation("/dashboard/campaigns"), 500);
        } else {
          toast({ title: "Publish failed", description: "Could not save the campaign. Check your connection and try again.", variant: "destructive" });
        }
      } else {
        const created = await raceTimeout(createCampaign(data, user?.id || ""), 30000, "Campaign create") as ({ id: string } | null);
        if (created) {
          setSavedId(created.id);
          // Fire-and-forget: calendar sync
          if (user?.id) {
            syncCampaignDeliverablesToCalendar({ ...data, id: created.id }, user.id)
              .catch(e => console.warn("[calendar sync] background error:", e));
          }
          toast({ title: "Campaign published! 🎉", description: "Your campaign is now live." });
          window.dispatchEvent(new Event("vairal-campaigns-updated"));
          setTimeout(() => setLocation("/dashboard/campaigns"), 500);
        } else {
          toast({ title: "Publish failed", description: "Could not create the campaign. Check your connection and try again.", variant: "destructive" });
        }
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      toast({ title: "Publish error", description: msg, variant: "destructive" });
      console.error("[publish] error:", err);
    } finally {
      setIsPublishing(false);
      isSavingRef.current = false;
    }
  }, [campaign, savedId, toast, setLocation, user?.id]);


  const goNext = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!readOnly) {
      saveDraftQuietly().catch(e => console.error("Auto-save error", e));
    }
    if (step < 4) setStep(step + 1);
  };
  
  const goBack = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!readOnly) {
      saveDraftQuietly().catch(e => console.error("Auto-save error", e));
    }
    if (step > 1) setStep(step - 1);
  };
  
  const goToStep = (sNum: number) => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (!readOnly) {
      saveDraftQuietly().catch(e => console.error("Auto-save error", e));
    }
    setStep(sNum);
  };
  
  const goBackToList = async () => {
    try { await saveDraftQuietly(); } catch (e) { console.error("Auto-save error", e); }
    setLocation("/dashboard/campaigns");
  };

  const handleDeleteCampaign = async () => {
    if (!savedId) return;
    if (!confirm("Are you sure you want to delete this campaign? This cannot be undone.")) return;
    const success = await deleteCampaign(savedId);
    if (success) {
      toast({ title: "Campaign deleted" });
      setLocation("/dashboard/campaigns");
    } else {
      toast({ title: "Failed to delete campaign", variant: "destructive" });
    }
  };

  return (
    <div className="flex h-full" data-testid="page-campaign-wizard">
      <div className="w-64 shrink-0 border-r border-border bg-card/50 p-6 hidden md:block">
        <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground gap-1.5" onClick={goBackToList} data-testid="button-back-to-campaigns">
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
                onClick={() => goToStep(sNum)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${isCurrent ? "bg-blue-600 text-white font-medium" : isCompleted ? "text-foreground" : "text-muted-foreground"} hover:bg-accent/50`}
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
          <Badge className="mt-6 bg-green-600/20 text-green-500 border-green-500/20 w-fit">Published</Badge>
        )}
        {savedId && (
          <div className="mt-8 border-t border-border pt-6">
            <Button variant="outline" className="w-full text-red-500 border-red-500/20 hover:bg-red-500/10 hover:text-red-600" onClick={handleDeleteCampaign}>
               <Trash2 className="w-4 h-4 mr-2" /> Delete Campaign
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto w-full">
        <div className="p-4 sm:p-6 w-full max-w-full mx-auto">
          <div className="flex items-center justify-between mb-6 md:hidden">
            <Button variant="ghost" size="sm" onClick={goBackToList} data-testid="button-back-mobile">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <span className="text-sm text-muted-foreground">Step {step} of 4</span>
          </div>

          <h2 className="text-xl font-bold text-foreground mb-1" data-testid="text-step-title">
            {stepLabels[step - 1]}
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Step {step} of 4</p>

          <Card className="p-6 bg-card border-border">
            {step === 1 && <Step1 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 2 && <Step2 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 3 && <Step3 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
            {step === 4 && <Step4 campaign={campaign} updateField={updateField} readOnly={readOnly} />}
          </Card>

          <div className="flex items-center justify-between mt-6 gap-3">
            <Button type="button" variant="outline" onClick={goBack} disabled={step === 1} data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex items-center gap-3">
              {!readOnly && step === 4 && (
                <Button type="button" variant="outline" onClick={saveDraftAndExit} data-testid="button-save-draft">
                  <Save className="w-4 h-4 mr-1" /> Save Draft
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={goNext} data-testid="button-next">
                  Next <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                !readOnly && (
                  <Button
                    type="button"
                    onClick={publish}
                    disabled={isPublishing}
                    className="bg-green-600 hover:bg-green-700 disabled:opacity-70"
                    data-testid="button-publish"
                  >
                    {isPublishing ? (
                      <>
                        <div className="w-4 h-4 mr-1 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Publishing…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-1" /> Publish Campaign
                      </>
                    )}
                  </Button>
                )
              )}
            </div>
          </div>
          {/* Draft auto-save status indicator */}
          {!readOnly && savedId && (
            <p className="text-xs text-muted-foreground text-center mt-2 opacity-60">Auto-saving…</p>
          )}
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
          <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-medium">
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

  const goalTemplates: Record<string, { platforms: string[], budget: number, desc: string }> = {
    "Brand Awareness": { platforms: ["Instagram", "TikTok"], budget: 10000, desc: "Reach a massive audience to build recognition." },
    "Product Launch": { platforms: ["Instagram", "YouTube", "TikTok"], budget: 25000, desc: "Drive hype for a new product release." },
    "Lead Generation": { platforms: ["LinkedIn", "Twitter/X"], budget: 5000, desc: "Collect emails and high-intent leads." },
    "Sales / Conversions": { platforms: ["Instagram", "TikTok"], budget: 15000, desc: "Direct response campaigns for e-commerce." },
    "Content Creation": { platforms: ["Instagram"], budget: 2000, desc: "UGC solely for your own organic channels." },
    "Event Promotion": { platforms: ["Instagram", "Snapchat"], budget: 5000, desc: "Hyping an upcoming physical or virtual event." },
    "App Installs": { platforms: ["TikTok", "Snapchat"], budget: 20000, desc: "Lower CPIs through native authentic creator hooks." },
    "Community Building": { platforms: ["Twitter/X", "YouTube"], budget: 3000, desc: "Foster deep brand loyalty and long-term fans." },
  };

  const handleGoalSelect = (g: string) => {
    if (readOnly) return;
    updateField("goal", g);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Label className="text-base font-semibold">1. Select Your Primary Goal <span className="text-red-400">*</span></Label>
        <p className="text-sm text-muted-foreground mt-1 mb-4">Choose a primary goal for this campaign.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {goals.map((g) => {
            const isSelected = campaign.goal === g;
            const t = goalTemplates[g] || { desc: "Custom objective", platforms: [], budget: 0 };
            return (
              <div 
                key={g}
                onClick={() => handleGoalSelect(g)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${readOnly ? "cursor-default opacity-80" : "cursor-pointer hover:border-blue-500/50"} ${isSelected ? "border-blue-600 bg-blue-600/5 shadow-sm" : "border-border bg-card"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className={`font-semibold text-sm ${isSelected ? "text-blue-600" : "text-foreground"}`}>{g}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border pt-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Campaign Name" required>
            <Input value={campaign.name} onChange={(e) => updateField("name", e.target.value)} disabled={readOnly} placeholder="e.g. Summer 2026 Collection" />
          </FieldGroup>
          <FieldGroup label="Brand Name" required>
            <Input value={campaign.brand} onChange={(e) => updateField("brand", e.target.value)} disabled={readOnly} placeholder="Brand Name" />
          </FieldGroup>
        </div>

        <FieldGroup label="Product or Service to Promote" required>
          <Input value={campaign.product} onChange={(e) => updateField("product", e.target.value)} disabled={readOnly} placeholder="What are the creators promoting?" />
        </FieldGroup>

        <FieldGroup label="Target Platform(s)" required>
          <MultiSelect options={platformOptions} selected={campaign.platforms} onChange={(v) => updateField("platforms", v)} disabled={readOnly} />
        </FieldGroup>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Target Countr(ies)" required>
            <MultiSelect options={countries} selected={campaign.countries || []} onChange={(v) => updateField("countries", v)} disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Target Audience Age Range">
            <MultiSelect options={ageRanges} selected={campaign.audienceAgeRanges} onChange={(v) => updateField("audienceAgeRanges", v)} disabled={readOnly} />
          </FieldGroup>
        </div>

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
    </div>
  );
}

function MoodboardViewer({ items, onChange, readOnly }: { items: any[], onChange: (items: any[]) => void, readOnly: boolean }) {
  const [urlInput, setUrlInput] = useState("");

  const handleAdd = () => {
    if (!urlInput.trim()) return;
    const newItem = {
      id: crypto.randomUUID(),
      url: urlInput.trim(),
    };
    onChange([...items, newItem]);
    setUrlInput("");
  };

  const remove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return 'link'; }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex gap-2">
          <Input 
            value={urlInput} 
            onChange={(e) => setUrlInput(e.target.value)} 
            placeholder="Paste a TikTok, Instagram, or YouTube URL..." 
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAdd())}
          />
          <Button type="button" onClick={handleAdd}>Add to Board</Button>
        </div>
      )}
      
      {items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map(item => (
            <div key={item.id} className="relative group rounded-xl border border-border overflow-hidden bg-muted/20 aspect-[9/16] flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-muted/50 p-4 text-center">
                <span className="text-muted-foreground text-sm font-medium truncate w-full">{getDomain(item.url)}</span>
              </div>
              <div className="p-2 border-t border-border bg-background/95 backdrop-blur text-xs truncate">
                <a href={item.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{item.url}</a>
              </div>
              {!readOnly && (
                <button 
                  onClick={() => remove(item.id)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="h-32 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground bg-muted/5">
          <p className="text-sm">No inspiration links yet. Paste URLs above to build your moodboard.</p>
        </div>
      )}
    </div>
  );
}

function BriefForm({ brief, updateBrief, readOnly }: { brief: CampaignBrief, updateBrief: (f: keyof CampaignBrief, v: any) => void, readOnly: boolean }) {
  const addDeliverable = () => {
    const d: Deliverable = {
      id: crypto.randomUUID(),
      platform: "Instagram",
      contentType: "Reel",
      quantity: 1,
      formatNotes: "",
    };
    updateBrief("deliverables", [...brief.deliverables, d]);
  };

  const updateDeliverable = (i: number, field: keyof Deliverable, value: any) => {
    const deliverables = [...brief.deliverables];
    deliverables[i] = { ...deliverables[i], [field]: value };
    updateBrief("deliverables", deliverables);
  };

  const removeDeliverable = (i: number) => {
    updateBrief("deliverables", brief.deliverables.filter((_: any, j: number) => j !== i));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <FieldGroup label="Brief Title" required>
          <Input value={brief.title} onChange={(e) => updateBrief("title", e.target.value)} disabled={readOnly} placeholder="e.g. Phase 1: Teaser" />
        </FieldGroup>

        <FieldGroup label="Visual Moodboard">
          <p className="text-xs text-muted-foreground mb-2">Paste links to TikToks, Reels, or Shorts that show the vibe you want.</p>
          <MoodboardViewer items={brief.moodboard || []} onChange={(v) => updateBrief("moodboard", v)} readOnly={readOnly} />
        </FieldGroup>

        <FieldGroup label="Key Messages" required>
          <RepeatableList items={brief.keyMessages.length ? brief.keyMessages : [""]} onChange={(v) => updateBrief("keyMessages", v)} placeholder="Key message..." disabled={readOnly} />
        </FieldGroup>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Do's">
            <RepeatableList items={brief.dos?.length ? brief.dos : [""]} onChange={(v) => updateBrief("dos", v)} placeholder="Do..." disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Don'ts">
            <RepeatableList items={brief.donts?.length ? brief.donts : [""]} onChange={(v) => updateBrief("donts", v)} placeholder="Don't..." disabled={readOnly} />
          </FieldGroup>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <FieldGroup label="Hashtags">
            <TagsInput tags={brief.hashtags || []} onChange={(v) => updateBrief("hashtags", v)} placeholder="#hashtag" disabled={readOnly} />
          </FieldGroup>
          <FieldGroup label="Mentions / Tags">
            <TagsInput tags={brief.mentions || []} onChange={(v) => updateBrief("mentions", v)} placeholder="@mention" disabled={readOnly} />
          </FieldGroup>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-base border-b border-border pb-2 mt-6">Deliverables for this Brief</h3>
        {brief.deliverables.map((d: Deliverable, i: number) => (
          <Card key={d.id} className="p-4 bg-muted/20 border-border space-y-4 shadow-none">
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

function Step2({ campaign, updateField, readOnly }: StepProps) {
  const briefs = campaign.briefs || [];
  const [activeTab, setActiveTab] = useState<string>(briefs[0]?.id || "");

  // Sync active tab if it's invalid
  useEffect(() => {
    if (briefs.length > 0 && !briefs.find((b: CampaignBrief) => b.id === activeTab)) {
      setActiveTab(briefs[0].id);
    }
  }, [briefs, activeTab]);

  const addBrief = () => {
    const newBrief: CampaignBrief = {
      id: crypto.randomUUID(),
      title: `Brief ${briefs.length + 1}`,
      keyMessages: [""],
      dos: [""],
      donts: [""],
      hashtags: [],
      mentions: [],
      referenceLinks: [""],
      deliverables: [],
    };
    updateField("briefs", [...briefs, newBrief]);
    setActiveTab(newBrief.id);
  };

  const updateBrief = (i: number, field: keyof CampaignBrief, value: any) => {
    const newBriefs = [...briefs];
    newBriefs[i] = { ...newBriefs[i], [field]: value };
    updateField("briefs", newBriefs);
  };

  const removeBrief = (i: number) => {
    const briefId = briefs[i].id;
    const newBriefs = briefs.filter((_: any, j: number) => j !== i);
    updateField("briefs", newBriefs);
    if (activeTab === briefId && newBriefs.length > 0) {
      setActiveTab(newBriefs[0].id);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
          <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0 justify-start">
            {briefs.map((b: CampaignBrief, i: number) => (
              <TabsTrigger 
                key={b.id} 
                value={b.id}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary border border-transparent rounded-full px-5 py-2 transition-all"
              >
                {b.title || `Brief ${i + 1}`}
              </TabsTrigger>
            ))}
          </TabsList>
          {!readOnly && (
            <Button variant="outline" size="sm" onClick={addBrief} className="ml-4 whitespace-nowrap shadow-sm">
              <Plus className="w-4 h-4 mr-2" /> Add Brief
            </Button>
          )}
        </div>

        {briefs.map((brief: CampaignBrief, i: number) => (
          <TabsContent key={brief.id} value={brief.id} className="mt-0 outline-none space-y-6 border border-border p-6 rounded-lg bg-card/10">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <h3 className="font-semibold text-lg">{brief.title || `Brief ${i + 1}`}</h3>
              {!readOnly && briefs.length > 1 && (
                <Button variant="ghost" size="sm" onClick={() => removeBrief(i)} className="text-red-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4 mr-1" /> Remove Brief
                </Button>
              )}
            </div>
            <BriefForm brief={brief} updateBrief={(field, value) => updateBrief(i, field, value)} readOnly={readOnly} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
function Step3({ campaign, updateField, readOnly }: StepProps) {
  const { toast } = useToast();
  const prefetched = usePrefetchedData();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedBriefs, setExpandedBriefs] = useState<Record<string, boolean>>({});
  const [globalContentTarget, setGlobalContentTarget] = useState<number>(0);
  const [selectedListId, setSelectedListId] = useState<string>("none");

  const toggleBrief = (id: string) => setExpandedBriefs(prev => ({ ...prev, [id]: !prev[id] }));

  const handleListSelection = async (listId: string) => {
    setSelectedListId(listId);
    if (listId === "none") return;

    // Resolve list name from prefetch or DB — don't bail if prefetch is cold
    const cachedList = prefetched.lists.find((l: any) => l.id === listId);
    let listName = cachedList?.name || "";

    try {
      const { fetchListMembers, getListById } = await import("@/services/api/lists");

      // If name wasn't in cache, fetch it from DB
      if (!listName) {
        const listData = await getListById(listId);
        listName = listData?.name || "Selected List";
      }

      const members = await fetchListMembers(listId);

      if (!members || members.length === 0) {
        toast({ title: "Empty List", description: `List "${listName}" has no creators yet. Add some from the Discover or Lists page.` });
        setSelectedListId("none");
        return;
      }

      const existingIds = new Set(campaign.selectedCreators.map((c: any) => c.creatorId));
      const newCreators = members
        .filter((m: any) => !existingIds.has(m.creator_username))
        .map((m: any) => ({ creatorId: m.creator_username, status: "Request Sent", deliverables: [] }));

      if (newCreators.length > 0) {
        updateField("selectedCreators", [...campaign.selectedCreators, ...newCreators]);
        toast({
          title: "Creators Added",
          description: `Added ${newCreators.length} creator${newCreators.length !== 1 ? "s" : ""} from list "${listName}". ${existingIds.size > 0 ? "Combined with your existing shortlist." : ""}`,
        });
      } else {
        toast({
          title: "Already Shortlisted",
          description: `All ${members.length} creators from "${listName}" are already in your shortlist.`,
        });
      }
    } catch (err: any) {
      toast({ title: "Failed to load list", description: err?.message || "Could not fetch list members. Please try again.", variant: "destructive" });
    } finally {
      setSelectedListId("none");
    }
  };

  const [isAllocating, setIsAllocating] = useState(false);

  const autoAllocate = async () => {
    if (campaign.selectedCreators.length === 0 || globalContentTarget <= 0) return;
    
    setIsAllocating(true);
    await new Promise(r => setTimeout(r, 600));

    // Build a map of brief templates: each brief deliverable knows which brief it belongs to
    const briefDeliverablesWithBrief = campaign.briefs?.flatMap((b: any) =>
      (b.deliverables || []).map((d: any) => ({ ...d, briefId: b.id }))
    ) || [];

    const baseCount = Math.floor(globalContentTarget / campaign.selectedCreators.length);
    let remainder = globalContentTarget % campaign.selectedCreators.length;
    
    const newList = campaign.selectedCreators.map((c: any) => {
      const creatorCount = baseCount + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;

      const newDeliverables = Array.from({ length: creatorCount }).map((_, i) => {
        const template = briefDeliverablesWithBrief.length > 0 ? briefDeliverablesWithBrief[i % briefDeliverablesWithBrief.length] : null;
        return {
          id: crypto.randomUUID(),
          platform: template?.platform || "Instagram",
          contentType: template?.contentType || "Reel",
          contentDetails: template?.formatNotes || `Auto-allocated content unit`,
          status: "Not Started",
          briefId: template?.briefId || "",  // ← properly links to brief
        };
      });

      return { ...c, deliverables: newDeliverables };
    });

    updateField("selectedCreators", newList);
    setIsAllocating(false);
    toast({ 
      title: "Content Allocated", 
      description: `Successfully allocated ${globalContentTarget} items across ${campaign.selectedCreators.length} creators.` 
    });
  };

  const totalDeliverables = campaign.briefs?.reduce((acc: number, b: any) => acc + (b.deliverables || []).reduce((a: number, d: any) => a + (d.quantity || 1), 0), 0) || 0;
  const totalKeyMessages = campaign.briefs?.reduce((acc: number, b: any) => acc + (b.keyMessages || []).filter(Boolean).length, 0) || 0;

  const filteredCreators = creatorsData.filter((c) => {
    if (searchQuery && !(c.fullname || "").toLowerCase().includes(searchQuery.toLowerCase()) && !c.username.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const addToShortlist = (id: string) => {
    if (!campaign.selectedCreators.some((c: any) => c.creatorId === id)) {
      updateField("selectedCreators", [...campaign.selectedCreators, { creatorId: id, status: "Request Sent", deliverables: [] }]);
    }
  };
  const removeFromShortlist = (id: string) => {
    updateField("selectedCreators", campaign.selectedCreators.filter((c: any) => c.creatorId !== id));
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
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search creators..." className="pl-9" disabled={readOnly} />
          </div>
          <Select disabled={readOnly} value={selectedListId} onValueChange={handleListSelection}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Add from List..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none" disabled>Select a list</SelectItem>
              {prefetched.lists.map((list: any) => (
                <SelectItem key={list.id} value={list.id}>{list.name} ({list.member_count || 0})</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
              {filteredCreators.slice(0, 15).map((creator) => {
                const isSelected = campaign.selectedCreators.some((c: any) => c.creatorId === creator.username);
                return (
                  <tr key={creator.username} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="p-3">
                      <p className="text-sm font-medium text-foreground">{creator.fullname || creator.username}</p>
                      <p className="text-xs text-muted-foreground">@{creator.username}</p>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{creator.channel}</td>
                    <td className="p-3 text-sm text-muted-foreground">{(creator.followers || 0).toLocaleString()}</td>
                    <td className="p-3 text-right">
                      {!readOnly && (
                        isSelected ? (
                          <Button variant="ghost" size="sm" onClick={() => removeFromShortlist(creator.username)} className="text-green-500 gap-1 hover:text-green-600 hover:bg-green-50">
                            <Check className="w-3 h-3" /> Added
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => addToShortlist(creator.username)} className="gap-1">
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
          <div className="space-y-6 mt-6 mb-20">
            <div className="p-6 bg-blue-600/10 rounded-xl border border-blue-600/20 space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">Content Allocation</h3>
                  <p className="text-sm text-muted-foreground">Define your total platform-wide volume target.</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center pt-2">
                <div className="space-y-1.5 w-full sm:w-auto">
                  <Label className="text-xs text-muted-foreground uppercase font-semibold">Total Quantity</Label>
                  <Input 
                    type="number" 
                    value={globalContentTarget || ""} 
                    onChange={(e) => setGlobalContentTarget(parseInt(e.target.value) || 0)} 
                    className="w-full sm:w-32 bg-card border-border h-11 text-lg font-bold" 
                    min={1} 
                    disabled={readOnly}
                  />
                </div>
                {!readOnly && (
                  <div className="pt-5 w-full sm:w-auto">
                    <Button 
                      onClick={autoAllocate} 
                      variant="default" 
                      className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 font-semibold px-6"
                      disabled={globalContentTarget <= 0 || campaign.selectedCreators.length === 0 || isAllocating}
                    >
                      {isAllocating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Allocating...
                        </>
                      ) : (
                        `Distribute across ${campaign.selectedCreators.length} Creators`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-foreground">Shortlisted Creators ({campaign.selectedCreators.length})</p>
                
                
              </div>
            
            <div className="space-y-3">
                {campaign.selectedCreators.map((cc: any) => {
                const id = cc.creatorId;
                const creatorObj = creatorsData.find((cr) => cr.username === id);
                return (
                  <div key={id} className={`flex flex-col gap-3 p-4 bg-muted/20 border ${isAllocating ? 'opacity-50 pointer-events-none' : ''} border-border/60 hover:border-border rounded-xl transition-all shadow-sm`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-blue-600/10 flex items-center justify-center border border-blue-600/20">
                            <Users className="w-4 h-4 text-blue-500" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-foreground">{creatorObj?.fullname || creatorObj?.username || id}</p>
                            <p className="text-xs text-muted-foreground font-mono">@{id}</p>
                         </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Select 
                          value={cc.status} 
                          onValueChange={(v) => {
                            const newList = campaign.selectedCreators.map((c: any) => c.creatorId === id ? { ...c, status: v } : c);
                            updateField("selectedCreators", newList);
                          }} 
                          disabled={readOnly}
                        >
                          <SelectTrigger className={`w-[140px] h-9 text-xs font-semibold ${
                            cc.status === 'Confirmed' ? 'border-green-600/30 text-green-500 bg-green-500/5' : 
                            cc.status === 'Pending' ? 'border-orange-600/30 text-orange-500 bg-orange-500/5' : ''
                          }`}><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Request Sent" className="text-xs">Request Sent</SelectItem>
                            <SelectItem value="Pending" className="text-xs">Pending</SelectItem>
                            <SelectItem value="Confirmed" className="text-xs">Confirmed</SelectItem>
                          </SelectContent>
                        </Select>

                        {!readOnly && (
                          <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 shrink-0 transition-colors" onClick={() => removeFromShortlist(id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Deliverables Sub-Section (If Confirmed, Pending, or Request Sent) */}
                    {(cc.status === "Confirmed" || cc.status === "Pending" || cc.status === "Request Sent") && (
                      <div className="mt-2 pl-4 border-l-2 border-border/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Deliverables</p>
                          {!readOnly && (
                            <Button variant="outline" size="sm" className="h-7 text-xs bg-muted/30" onClick={() => {
                                const newDeliverable = {
                                  id: crypto.randomUUID(),
                                  platform: "",
                                  contentType: "",
                                  contentDetails: "",
                                  status: "Not Started",
                                };
                              const newList = campaign.selectedCreators.map((c: any) => 
                                c.creatorId === id ? { ...c, deliverables: [...(c.deliverables || []), newDeliverable] } : c
                              );
                              updateField("selectedCreators", newList);
                            }}>
                              <Plus className="w-3 h-3 mr-1" /> Add Deliverable
                            </Button>
                          )}
                        </div>
                        
                        {(cc.deliverables || []).length > 0 ? (
                          <div className="space-y-2">
                            <div className="hidden lg:grid grid-cols-[1fr_1fr_1.5fr_2fr_1fr_1fr_1.5fr_auto] gap-2 px-2 pb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                              <div>Platform</div>
                              <div>Format</div>
                              <div>Brief</div>
                              <div>Details</div>
                              <div>Shoot Due</div>
                              <div>Go Live</div>
                              <div>Status</div>
                              <div className="w-8"></div>
                            </div>
                            {(cc.deliverables || []).map((deliv: any, idx: number) => (
                              <div key={deliv.id || idx} className="grid lg:grid-cols-[1fr_1fr_1.5fr_2fr_1fr_1fr_1.5fr_auto] sm:grid-cols-2 gap-2 items-start bg-muted/10 p-2 rounded-md border border-border/50">
                                
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Platform</label>
                                  <Select 
                                    value={deliv.platform} 
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, platform: v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }} 
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Platform" /></SelectTrigger>
                                    <SelectContent>
                                      {platformOptions.map(p => (
                                          <SelectItem key={p} value={p}>{p}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Format</label>
                                  <Select 
                                    value={deliv.contentType} 
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, contentType: v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }} 
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Format" /></SelectTrigger>
                                    <SelectContent>
                                      {contentTypes.map(c => (
                                          <SelectItem key={c} value={c}>{c}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Brief <span className="text-red-400">*</span></label>
                                  <Select 
                                    value={deliv.briefId || "none"} 
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, briefId: v === "none" ? "" : v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }} 
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className={`h-8 text-xs ${!deliv.briefId ? 'border-red-400/50 bg-red-400/5' : ''}`}>
                                      <SelectValue placeholder="Select Brief *" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">No Brief</SelectItem>
                                      {(campaign.briefs || []).map((b: any) => (
                                          <SelectItem key={b.id} value={b.id}>{b.title || 'Untitled Brief'}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Details</label>
                                  <Input 
                                    placeholder="Details / Description"
                                    className="h-8 text-xs"
                                    value={deliv.contentDetails || ""}
                                    onChange={(e) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, contentDetails: e.target.value } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Shoot Due</label>
                                  <Input 
                                    type="date"
                                    className="h-8 text-xs"
                                    value={deliv.submitShootBefore || ""}
                                    onChange={(e) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, submitShootBefore: e.target.value } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>

                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Go Live</label>
                                  <Input 
                                    type="date"
                                    className="h-8 text-xs"
                                    value={deliv.goLiveOn || ""}
                                    onChange={(e) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, goLiveOn: e.target.value } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }}
                                    disabled={readOnly}
                                  />
                                </div>

                                <div className="flex flex-col gap-1 min-w-[120px]">
                                  <label className="text-[10px] text-muted-foreground leading-none lg:hidden">Status</label>
                                  {cc.status !== "Confirmed" ? (
                                    <div
                                      className={`h-8 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-tight ${
                                        cc.status === "Request Sent"
                                          ? "text-blue-400"
                                          : "text-orange-400"
                                      }`}
                                      title={`Creator must be Confirmed before deliverable status can change. Current: ${cc.status}`}
                                    >
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{cc.status}</span>
                                    </div>
                                  ) : (
                                  <Select 
                                    value={deliv.status} 
                                    onValueChange={(v) => {
                                      const newList = campaign.selectedCreators.map((c: any) => 
                                        c.creatorId === id ? { ...c, deliverables: c.deliverables.map((d: any) => d.id === deliv.id ? { ...d, status: v } : d) } : c
                                      );
                                      updateField("selectedCreators", newList);
                                    }} 
                                    disabled={readOnly}
                                  >
                                    <SelectTrigger className={`h-8 text-[10px] font-bold ${
                                      deliv.status === 'Approved & Scheduled' || deliv.status === 'Live' ? 'bg-green-600 text-white border-green-700' :
                                      deliv.status === 'Shoot Submitted' ? 'bg-blue-600 text-white border-blue-700' :
                                      deliv.status === 'Changes Requested' ? 'bg-red-600 text-white border-red-700' :
                                      'bg-card border-border'
                                    }`}><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Not Started" className="text-xs">Not Started</SelectItem>
                                      <SelectItem value="Awaiting Shoot" className="text-xs">Awaiting Shoot</SelectItem>
                                      <SelectItem value="Shoot Submitted" className="text-xs">Shoot Submitted</SelectItem>
                                      <SelectItem value="Changes Requested" className="text-xs">Changes Requested</SelectItem>
                                      <SelectItem value="Approved & Scheduled" className="text-xs">Approved & Scheduled</SelectItem>
                                      <SelectItem value="Live" className="text-xs">Live</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  )}
                                </div>
                                
                                {!readOnly && (
                                  <div className="flex flex-col gap-1 items-end justify-center h-full">
                                    <label className="text-[10px] opacity-0 leading-none lg:block hidden">Action</label>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0 self-end lg:self-auto"
                                      onClick={() => {
                                        const newList = campaign.selectedCreators.map((c: any) => 
                                          c.creatorId === id ? { ...c, deliverables: c.deliverables.filter((d: any) => d.id !== deliv.id) } : c
                                        );
                                        updateField("selectedCreators", newList);
                                      }}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-muted-foreground italic px-2">No deliverables added yet.</div>
                        )}
                        
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
          </div>
        )}
      </div>

    </div>
  );
}

export function Step4({ campaign, updateField, readOnly }: StepProps) {
  const [_, setLocation] = useLocation();
  const [expandedBriefs, setExpandedBriefs] = useState<Record<string, boolean>>({});
  const toggleBrief = (id: string) => setExpandedBriefs(prev => ({ ...prev, [id]: !prev[id] }));

  const totalDeliverables = campaign.briefs?.reduce((acc: number, b: any) => acc + (b.deliverables || []).reduce((a: number, d: any) => a + (d.quantity || 1), 0), 0) || 0;
  const totalKeyMessages = campaign.briefs?.reduce((acc: number, b: any) => acc + (b.keyMessages || []).filter(Boolean).length, 0) || 0;
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let totalCreatorsCount = 0;
  let confirmedCreators = 0;
  let totalDeliverablesCount = 0;
  let liveDeliverables = 0;

  const STATUS_COLUMNS = [
    "Not Started",
    "Awaiting Shoot",
    "Shoot Submitted",
    "Changes Requested",
    "Approved & Scheduled",
    "Live"
  ];

  const tableData: { creatorName: string; platforms: { platform: string; deliverables: any[] }[] }[] = [];
  const selectedCreators = campaign.selectedCreators || [];

  selectedCreators.forEach((sc: any) => {
    const creator = creatorsData.find(c => c.username === sc.creatorId);
    const creatorName = creator?.fullname || creator?.username || sc.creatorId;

    const platformMap: Record<string, any[]> = {};
    (sc.deliverables || []).forEach((d: any) => {
      if (!platformMap[d.platform]) platformMap[d.platform] = [];
      platformMap[d.platform].push(d);
    });

    const platformsList = Object.keys(platformMap).map(p => {
      return { platform: p, deliverables: platformMap[p] };
    });

    if (platformsList.length > 0) {
      tableData.push({ creatorName, platforms: platformsList });
    }
  });
  const statusCounts: Record<string, number> = {
    "Not Started": 0,
    "Awaiting Shoot": 0,
    "Shoot Submitted": 0,
    "Changes Requested": 0,
    "Approved & Scheduled": 0,
    "Live": 0
  };

  const shootOverdue: any[] = [];
  const goLiveOverdue: any[] = [];
  const changesRequestedAlerts: any[] = [];

  const platformMatrix: Record<string, Record<string, { count: number, creators: Set<string> }>> = {};
  const creatorPipeline: any[] = [];
  const timelineItems: any[] = [];

  campaign.selectedCreators?.forEach((c: any) => {
    totalCreatorsCount++;
    if (c.status === "Confirmed") confirmedCreators++;

    const creatorInfo = creatorsData.find(cd => cd.username === c.creatorId);
    const creatorName = creatorInfo?.fullname || creatorInfo?.username || "Unknown Creator";

    const creatorStats = { name: creatorName, total: 0, live: 0, overdue: 0, changes: 0 };

    c.deliverables?.forEach((d: any) => {
      totalDeliverablesCount++;
      creatorStats.total++;

      if (d.status === "Live") {
        liveDeliverables++;
        creatorStats.live++;
      }
      if (statusCounts[d.status] !== undefined) {
        statusCounts[d.status]++;
      }

      // Matrix Building
      if (!platformMatrix[d.platform]) platformMatrix[d.platform] = {};
      if (!platformMatrix[d.platform][d.contentType]) {
        platformMatrix[d.platform][d.contentType] = { count: 0, creators: new Set() };
      }
      
      platformMatrix[d.platform][d.contentType].count++;
      platformMatrix[d.platform][d.contentType].creators.add(creatorName);

      // Alerts
      if (d.status === "Changes Requested") {
        changesRequestedAlerts.push({ creator: creatorName, platform: d.platform, format: d.contentType });
        creatorStats.changes++;
      }

      if (d.submitShootBefore) {
        const shootDate = new Date(d.submitShootBefore);
        if (shootDate < now && (d.status === "Not Started" || d.status === "Awaiting Shoot")) {
          shootOverdue.push({ creator: creatorName, platform: d.platform, format: d.contentType, date: d.submitShootBefore });
          creatorStats.overdue++;
        }
        timelineItems.push({
          date: d.submitShootBefore,
          type: "Shoot Due",
          title: `Shoot Due: ${creatorName} (${d.platform} ${d.contentType})`,
          status: (shootDate < now && d.status !== "Live" && d.status !== "Approved & Scheduled" && d.status !== "Shoot Submitted") ? "Overdue" : ((d.status === "Shoot Submitted" || d.status === "Approved & Scheduled" || d.status === "Live") ? "Completed" : "Pending"),
          creatorId: c.creatorId
        });
      }

      if (d.goLiveOn) {
        const liveDate = new Date(d.goLiveOn);
        if (liveDate < now && d.status !== "Live") {
          goLiveOverdue.push({ creator: creatorName, platform: d.platform, format: d.contentType, date: d.goLiveOn });
          creatorStats.overdue++;
        }
        timelineItems.push({
          date: d.goLiveOn,
          type: "Go Live",
          title: `Go Live: ${creatorName} (${d.platform} ${d.contentType})`,
          status: d.status === "Live" ? "Completed" : (liveDate < now ? "Overdue" : "Pending"),
          creatorId: c.creatorId
        });
      }
    });

    creatorPipeline.push(creatorStats);
  });

  const Section = ({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
        <h4 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h4>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full max-w-[800px] grid-cols-4 mb-6">
          <TabsTrigger value="dashboard" className="flex gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
          <TabsTrigger value="timeline" className="flex gap-2"><Calendar className="w-4 h-4" /> Timeline</TabsTrigger>
          <TabsTrigger value="summary">Campaign Details</TabsTrigger>
          <TabsTrigger value="briefs">Brief Breakdown</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          {/* Executive KPIs */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="p-4 bg-primary/5 border-primary/20 flex flex-col space-y-1 rounded-xl">
              <span className="text-sm text-muted-foreground font-medium">Creators Pipeline</span>
              <span className="text-2xl font-bold text-foreground">{confirmedCreators} / {totalCreatorsCount}</span>
              <span className="text-xs text-muted-foreground">Confirmed vs Total Initialized</span>
            </Card>
            <Card className="p-4 bg-muted/30 border-border flex flex-col space-y-1 rounded-xl">
              <span className="text-sm text-muted-foreground font-medium">Total Deliverables</span>
              <span className="text-2xl font-bold text-foreground">{totalDeliverablesCount}</span>
              <span className="text-xs text-muted-foreground">Across all creators</span>
            </Card>
            <Card className="p-4 bg-green-500/10 border-green-500/20 flex flex-col space-y-1 rounded-xl">
              <span className="text-sm text-green-600 dark:text-green-400 font-medium">Live Output</span>
              <span className="text-2xl font-bold text-green-700 dark:text-green-300">{liveDeliverables}</span>
              <span className="text-xs text-green-600/70 dark:text-green-400/70">Completed & published deliverables</span>
            </Card>
          </div>

          {/* Progress Bar overall */}
          <Section title="Overall Progress" icon={Activity}>
            {totalDeliverablesCount > 0 ? (
              <div className="space-y-3">
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                  {statusCounts["Live"] > 0 && <div title={`Live: ${statusCounts["Live"]}`} style={{width: `${(statusCounts["Live"]/totalDeliverablesCount)*100}%`}} className="bg-green-500 hover:opacity-80 transition-opacity h-full" />}
                  {statusCounts["Approved & Scheduled"] > 0 && <div title={`Approved & Scheduled: ${statusCounts["Approved & Scheduled"]}`} style={{width: `${(statusCounts["Approved & Scheduled"]/totalDeliverablesCount)*100}%`}} className="bg-emerald-400 hover:opacity-80 transition-opacity h-full" />}
                  {statusCounts["Shoot Submitted"] > 0 && <div title={`Shoot Submitted: ${statusCounts["Shoot Submitted"]}`} style={{width: `${(statusCounts["Shoot Submitted"]/totalDeliverablesCount)*100}%`}} className="bg-blue-400 hover:opacity-80 transition-opacity h-full" />}
                  {statusCounts["Changes Requested"] > 0 && <div title={`Changes Requested: ${statusCounts["Changes Requested"]}`} style={{width: `${(statusCounts["Changes Requested"]/totalDeliverablesCount)*100}%`}} className="bg-red-500 hover:opacity-80 transition-opacity h-full" />}
                  {statusCounts["Awaiting Shoot"] > 0 && <div title={`Awaiting Shoot: ${statusCounts["Awaiting Shoot"]}`} style={{width: `${(statusCounts["Awaiting Shoot"]/totalDeliverablesCount)*100}%`}} className="bg-yellow-400 hover:opacity-80 transition-opacity h-full" />}
                  {statusCounts["Not Started"] > 0 && <div title={`Not Started: ${statusCounts["Not Started"]}`} style={{width: `${(statusCounts["Not Started"]/totalDeliverablesCount)*100}%`}} className="bg-slate-300 dark:bg-slate-600 hover:opacity-80 transition-opacity h-full" />}
                </div>
                <div className="flex flex-wrap gap-4 text-xs font-medium">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    if (count === 0) return null;
                    const colorCircle = 
                      status === "Live" ? "bg-green-500" :
                      status === "Approved & Scheduled" ? "bg-emerald-400" :
                      status === "Shoot Submitted" ? "bg-blue-400" :
                      status === "Changes Requested" ? "bg-red-500" :
                      status === "Awaiting Shoot" ? "bg-yellow-400" :
                      "bg-slate-300 dark:bg-slate-600";
                    return (
                      <div key={status} className="flex items-center gap-1.5 text-muted-foreground">
                        <div className={`w-2.5 h-2.5 rounded-full ${colorCircle}`} />
                        {count} {status}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
                <div className="text-sm text-muted-foreground italic bg-muted/20 p-4 rounded-lg">No deliverables to track yet.</div>
            )}
          </Section>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Alerts */}
            <Section title="Action Required" icon={AlertTriangle}>
              <div className="space-y-3">
                {shootOverdue.length === 0 && goLiveOverdue.length === 0 && changesRequestedAlerts.length === 0 && (
                  <div className="flex items-center gap-2 p-3 text-sm text-green-700 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    All deliverables are on track! No overdue actions.
                  </div>
                )}
                
                {goLiveOverdue.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg overflow-hidden">
                    <div className="bg-red-500/20 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold text-red-700 dark:text-red-400">Go-Live Overdue</div>
                    <div className="p-3 space-y-2">
                       {goLiveOverdue.map((a, i) => (
                         <div key={i} className="text-sm flex justify-between items-center text-red-900 dark:text-red-200">
                           <span className="font-medium">{a.creator} <span className="font-normal text-red-700 dark:text-red-400 text-xs ml-1">({a.platform} {a.format})</span></span>
                           <span className="text-xs bg-red-100 dark:bg-red-900 px-2 py-0.5 rounded-md">{a.date}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {shootOverdue.length > 0 && (
                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg overflow-hidden">
                    <div className="bg-orange-500/20 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold text-orange-700 dark:text-orange-400">Shoot Overdue</div>
                    <div className="p-3 space-y-2">
                       {shootOverdue.map((a, i) => (
                         <div key={i} className="text-sm flex justify-between items-center text-orange-900 dark:text-orange-200">
                           <span className="font-medium">{a.creator} <span className="font-normal text-orange-700 dark:text-orange-400 text-xs ml-1">({a.platform} {a.format})</span></span>
                           <span className="text-xs bg-orange-100 dark:bg-orange-900 px-2 py-0.5 rounded-md">{a.date}</span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                
                {changesRequestedAlerts.length > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg overflow-hidden">
                     <div className="bg-yellow-500/20 py-1.5 px-3 uppercase tracking-wider text-[10px] font-bold text-yellow-700 dark:text-yellow-400">Blocked: Changes Requested</div>
                     <div className="p-3 space-y-2">
                       {changesRequestedAlerts.map((a, i) => (
                         <div key={i} className="text-sm flex justify-between items-center text-yellow-900 dark:text-yellow-200">
                           <span className="font-medium">{a.creator} <span className="font-normal text-yellow-700 dark:text-yellow-400 text-xs ml-1">({a.platform} {a.format})</span></span>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* Matrix & Pipeline */}
            <div className="space-y-8">
              <Section title="Delivery Matrix" icon={LayoutDashboard}>
                <div className="mb-4 flex justify-end">
                  <Button onClick={() => setLocation(`/dashboard/board`)}>
                    Open Execution Board
                  </Button>
                </div>
                <div className="border border-border rounded-lg overflow-hidden bg-card text-sm">
                  <div className="grid grid-cols-[1fr_2fr_1fr] bg-muted/50 p-2 font-medium text-xs text-muted-foreground uppercase tracking-wider">
                    <div>Platform</div>
                    <div>Format</div>
                    <div className="text-right">Total</div>
                  </div>
                  {Object.keys(platformMatrix).length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground italic text-sm">No formats specified</div>
                  ) : (
                    Object.entries(platformMatrix).map(([platform, formats]) => (
                      <div key={platform} className="border-t border-border/50">
                        {Object.entries(formats).map(([format, data], idx) => (
                          <div key={format} className={`grid grid-cols-[1fr_2fr_1fr] p-2 items-center ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                            <div className="font-medium text-foreground">{idx === 0 ? platform : ""}</div>
                            <div className="text-muted-foreground break-words pr-2">
                              {format} <span className="text-[10px] ml-1 bg-muted px-1.5 py-0.5 rounded-full">{data.creators.size} creators</span>
                            </div>
                            <div className="text-right font-bold text-primary">{data.count}</div>
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </Section>

              <Section title="Creator Status pipeline" icon={Users}>
                <div className="border border-border rounded-lg overflow-hidden bg-card text-sm">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-muted/50 p-2 font-medium text-xs text-muted-foreground uppercase tracking-wider text-right">
                    <div className="text-left">Creator</div>
                    <div>Tgt</div>
                    <div>Live</div>
                    <div>Block</div>
                  </div>
                  {creatorPipeline.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground italic text-sm">No creators active</div>
                  ) : (
                    creatorPipeline.map((c, i) => (
                      <div key={i} className="grid grid-cols-[2fr_1fr_1fr_1fr] p-2 items-center border-t border-border/50 text-right">
                        <div className="text-left font-medium text-foreground truncate pr-2">{c.name}</div>
                        <div className="text-muted-foreground">{c.total}</div>
                        <div className={c.live > 0 ? "text-green-600 font-bold" : "text-muted-foreground"}>{c.live}</div>
                        <div className={(c.overdue > 0 || c.changes > 0) ? "text-red-500 font-bold" : "text-muted-foreground"}>
                           {c.overdue + c.changes}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Section>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card className="p-5 bg-card border-border shadow-sm grid sm:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">Overview</h4>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Name</span><span className="text-sm text-foreground text-right font-medium">{campaign.name || "—"}</span></div>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Brand / Product</span><span className="text-sm text-foreground text-right font-medium">{`${campaign.brand || "-"} - ${campaign.product || "-"}`}</span></div>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Goal</span><span className="text-sm text-foreground text-right font-medium">{campaign.goal || "—"}</span></div>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Platform(s)</span><span className="text-sm text-foreground text-right font-medium">{campaign.platforms?.join(", ") || "—"}</span></div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground border-b border-border pb-1">Details</h4>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Timeline</span><span className="text-sm text-foreground text-right font-medium">{`${campaign.startDate || "-"} → ${campaign.endDate || "-"}`}</span></div>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Location(s)</span><span className="text-sm text-foreground text-right font-medium">{campaign.countries?.join(", ") || "—"}</span></div>
              <div className="flex justify-between py-1"><span className="text-sm text-muted-foreground">Target Budget</span><span className="text-sm text-foreground text-right font-medium">{campaign.totalBudget ? campaign.totalBudget.toLocaleString() : "—"}</span></div>
            </div>
          </Card>

          <Card className="p-0 bg-card border-border shadow-sm overflow-hidden">
             <div className="p-4 border-b border-border bg-muted/20">
               <h4 className="text-sm font-semibold text-foreground">Creator Deliverables Overview</h4>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                 <thead className="bg-muted/50 border-b border-border">
                   <tr>
                     <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap min-w-[150px]">Creator Name</th>
                     <th className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Platform</th>
                     {STATUS_COLUMNS.map((status, i) => (
                       <th key={i} className="px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{status}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                   {tableData.length > 0 ? tableData.map((creator, cIdx) => (
                     creator.platforms.map((plat, pIdx) => (
                       <tr key={`${cIdx}-${pIdx}`} className="hover:bg-muted/10 transition-colors">
                         {pIdx === 0 && (
                           <td rowSpan={creator.platforms.length} className="px-4 py-3 border-r border-border align-top bg-card group-hover:bg-transparent transition-colors font-medium">
                             {creator.creatorName}
                           </td>
                         )}
                         <td className="px-4 py-3 border-r border-border font-medium">
                           {plat.platform}
                         </td>
                         {STATUS_COLUMNS.map((colStatus, i) => {
                           const statusDeliverables = plat.deliverables.filter(d => d.status === colStatus);
                           return (
                             <td key={colStatus} className="px-4 py-3 border-r border-border last:border-r-0 align-top text-center">
                               {statusDeliverables.length > 0 ? (
                                 <span className="font-semibold text-foreground">{statusDeliverables.length}</span>
                               ) : (
                                 <span className="text-muted-foreground/20">—</span>
                               )}
                             </td>
                           )
                         })}
                       </tr>
                     ))
                   )) : (
                     <tr>
                       <td colSpan={STATUS_COLUMNS.length + 2} className="px-4 py-8 text-center text-muted-foreground italic">
                         No creators with deliverables added yet.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </Card>
        </TabsContent>
        <TabsContent value="briefs" className="space-y-4">
          {campaign.briefs && campaign.briefs.length > 0 ? (
            <div className="space-y-3">
              {campaign.briefs.map((brief: CampaignBrief, i: number) => {
                const briefDelivTotal = (brief.deliverables || []).reduce((acc: number, d: any) => acc + (d.quantity || 1), 0);
                const briefKmTotal = (brief.keyMessages || []).filter(Boolean).length;
                const isExpanded = expandedBriefs[brief.id];
                return (
                  <div key={brief.id} className="border border-border rounded-lg bg-card overflow-hidden transition-all shadow-sm">
                    <button 
                      onClick={() => toggleBrief(brief.id)}
                      className="w-full flex items-center justify-between p-3 bg-muted/20 hover:bg-muted/50 transition-colors text-left"
                    >
                      <span className="font-medium text-sm text-foreground">{brief.title || `Brief ${i + 1}`}</span>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mr-1">
                        <span>{briefDelivTotal} Deliverables</span>
                        <span>{briefKmTotal} Key Messages</span>
                        {isExpanded ? <ChevronDown className="w-4 h-4 ml-2" /> : <ChevronRight className="w-4 h-4 ml-2" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-4 border-t border-border grid sm:grid-cols-2 gap-6 bg-card/50">
                        <div className="space-y-3">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Deliverables</h5>
                          <ul className="space-y-2">
                            {(brief.deliverables || []).map((d: any, j: number) => (
                              <li key={j} className="text-sm flex justify-between border-b border-border/50 pb-1 last:border-0 last:pb-0">
                                <span className="text-muted-foreground">{d.platform} - {d.contentType}</span>
                                <span className="font-medium text-foreground">x{d.quantity}</span>
                              </li>
                            ))}
                            {(!brief.deliverables || brief.deliverables.length === 0) && <span className="text-sm text-muted-foreground italic">None specified</span>}
                          </ul>
                        </div>
                        <div className="space-y-3">
                          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Key Messages</h5>
                          <ul className="space-y-1 list-disc pl-4 text-sm text-muted-foreground">
                            {(brief.keyMessages || []).filter(Boolean).map((km: string, j: number) => (
                              <li key={j}>{km}</li>
                            ))}
                            {(!brief.keyMessages || brief.keyMessages.filter(Boolean).length === 0) && <span className="text-sm text-muted-foreground italic pl-0">None specified</span>}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground italic p-4 bg-muted/10 rounded-lg border border-border/50">
              No briefs added yet.
            </div>
          )}
        </TabsContent>
        <TabsContent value="timeline" className="space-y-6">
          <Section title="Project Timeline" icon={Calendar}>
            <div className="relative border-l-2 border-border ml-4 mt-4 space-y-8 pb-4">
              {timelineItems.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((item, i) => {
                 const statusColors = {
                   "Completed": "bg-green-500 border-green-500",
                   "Pending": "bg-muted border-primary/50",
                   "Overdue": "bg-red-500 border-red-500"
                 };
                 const dotColor = statusColors[item.status as keyof typeof statusColors];
                 const isOverdue = item.status === "Overdue";
                 const isCompleted = item.status === "Completed";
                 return (
                   <div key={i} className="relative pl-6">
                     <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 bg-card ${dotColor}`} />
                     <div className="flex flex-col">
                       <span className={`text-xs font-semibold ${isOverdue ? 'text-red-500' : isCompleted ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>{formatDisplayDate(item.date)}</span>
                       <span className="text-sm font-medium text-foreground">{item.title}</span>
                       <span className="text-xs text-muted-foreground mt-0.5">{item.status}</span>
                     </div>
                   </div>
                 );
              })}
              {timelineItems.length === 0 && (
                 <div className="pl-6 text-sm text-muted-foreground italic">No timeline events yet. Set "Shoot Due" or "Go Live" dates on deliverables to see them here.</div>
              )}
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
