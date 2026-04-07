import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/providers/auth.provider";
import { CampaignV2, defaultCampaignV2 } from "@/models/campaigns-v2.types";
import { fetchCampaignsV2, saveCampaignV2 } from "@/services/api/campaigns-v2";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Save, Send } from "lucide-react";
import { cn } from "@/lib/utils";

import { Step1Core } from "./steps/step1-core";
import { Step2Brief } from "./steps/step2-brief";
import { Step3Delivery } from "./steps/step3-delivery";
import { Step4Summary } from "./steps/step4-summary";

const steps = ["Core", "Brief", "Ad Creators", "Overview"];

export default function CampaignsV2WizardPage() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  
  const idValue = location.split("/").pop(); // `/dashboard/campaigns-v2/new` or `/dashboard/campaigns-v2/uuid`
  const isNew = idValue === "new" || !idValue;
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<CampaignV2>(() => {
    return { 
        ...defaultCampaignV2(), 
        id: crypto.randomUUID(), 
        userId: user?.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
  });
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Load existing if not new
  useEffect(() => {
    async function loadCampaign() {
      if (isNew || !user?.id) return;
      const all = await fetchCampaignsV2(user.id);
      const existing = all.find(c => c.id === idValue);
      if (existing) {
        setCampaign(existing);
        setCurrentStepIndex(existing.lastStep - 1);
      } else {
        toast({ title: "Not Found", description: "Campaign not found", variant: "destructive" });
        setLocation("/dashboard/campaigns-v2");
      }
      setLoading(false);
    }
    loadCampaign();
  }, [isNew, idValue, user?.id, setLocation]);

  const updateData = (partial: Partial<CampaignV2>) => {
    setCampaign(prev => ({ ...prev, ...partial }));
  };

  const persistToDatabase = async (status: CampaignV2["status"], showToast = true) => {
    if (!user?.id) return false;
    setSaving(true);
    
    const updated = { 
        ...campaign, 
        status, 
        lastStep: currentStepIndex + 1 
    };
    
    // Explicit publish validation logic matches campaigns.md
    if (status === "PUBLISHED") {
        const hasKeyMessage = updated.briefs.some(b => b.keyMessages.some(km => km.trim() !== ""));
        if (!hasKeyMessage) {
            toast({ title: "Validation Error", description: "You must define at least one active Key Message in a Brief before publishing.", variant: "destructive" });
            setSaving(false);
            return false;
        }

        if (!updated.name || !updated.brand) {
             toast({ title: "Validation Error", description: "Campaign Name and Brand are required.", variant: "destructive" });
             setSaving(false);
             return false;
        }
    }
    
    const success = await saveCampaignV2(updated, user.id);
    if (success) {
      setCampaign(updated);
      if (showToast) {
         toast({ title: status === "PUBLISHED" ? "Campaign Published!" : "Draft Saved" });
      }
    }
    setSaving(false);
    return success;
  };

  const handleSaveDraft = () => persistToDatabase("DRAFT");
  const handlePublish = async () => {
     const success = await persistToDatabase("PUBLISHED");
     if (success) setLocation("/dashboard/campaigns-v2");
  };

  const nextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(curr => curr + 1);
      // Auto-save on next
      persistToDatabase(campaign.status, false);
    }
  };
  const prevStep = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(curr => curr - 1);
  };

  if (loading) return <div className="p-8">Loading V2 Component...</div>;

  return (
    <div className="flex flex-col h-full bg-background relative" data-testid="campaigns-v2-wizard">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/dashboard/campaigns-v2")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="font-semibold text-lg">{campaign.name || "Untitled V2 Campaign"}</div>
        </div>

        {/* Stepper Logic */}
        <div className="hidden lg:flex items-center space-x-2">
          {steps.map((label, idx) => (
            <div key={label} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium transition-all",
                  idx === currentStepIndex
                    ? "border-primary bg-primary text-primary-foreground"
                    : idx < currentStepIndex
                    ? "border-primary bg-transparent text-primary" // Completed
                    : "border-muted text-muted-foreground" // Future
                )}
              >
                {idx + 1}
              </div>
              <span className={cn(
                  "ml-2 text-sm font-medium",
                  idx === currentStepIndex ? "text-foreground" : "text-muted-foreground"
              )}>
                {label}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-8 h-px bg-border mx-3" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" /> Save Draft
          </Button>
          <Button onClick={handlePublish} disabled={saving} className="gap-2">
            <Send className="w-4 h-4" /> Publish
          </Button>
        </div>
      </header>

      {/* Main Form Content Area */}
      <main className="flex-1 overflow-y-auto">
         {currentStepIndex === 0 && <Step1Core campaign={campaign} updateData={updateData} />}
         {currentStepIndex === 1 && <Step2Brief campaign={campaign} updateData={updateData} />}
         {currentStepIndex === 2 && <Step3Delivery campaign={campaign} updateData={updateData} />}
         {currentStepIndex === 3 && <Step4Summary campaign={campaign} updateData={updateData} />}
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-border bg-background px-6 py-4 flex items-center justify-between mt-auto shrink-0 z-40">
        <Button variant="outline" onClick={prevStep} disabled={currentStepIndex === 0} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        
        <div className="flex justify-center flex-1 gap-2 lg:hidden">
            <span className="text-sm text-muted-foreground font-medium">Step {currentStepIndex + 1} of 4</span>
        </div>

        {currentStepIndex < steps.length - 1 ? (
          <Button onClick={nextStep} className="gap-2 shrink-0">
            Next <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
           <Button onClick={handlePublish} disabled={saving} className="gap-2 shrink-0 bg-green-600 hover:bg-green-700">
             Publish Campaign
           </Button>
        )}
      </footer>
    </div>
  );
}
