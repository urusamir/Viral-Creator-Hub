import { CampaignV2 } from "@/models/campaigns-v2.types";

interface StepProps {
  campaign: CampaignV2;
  updateData: (data: Partial<CampaignV2>) => void;
  errors?: Record<string, string>;
}

export function Step4Dashboard({ campaign, updateData, errors }: StepProps) {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Step 4: Summary & Executive Dashboard Stub</h2>
    </div>
  );
}
