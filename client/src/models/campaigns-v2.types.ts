// Database/Supabase mapping schema based directly on `campaigns.md` specifications.

export type DeliverableV2 = {
  id: string;
  platform: string;
  contentType: string;
  quantity: number;
  formatNotes?: string;
};

// CreatorDeliverable (Step 3/4)
// Maps to JSONB 'deliverables' in campaigns
export type CreatorDeliverableV2 = {
  id: string; // Atomic deliverable UUID
  creatorId: string; // Foreign reference to creators table conceptually
  platform: string;  
  contentType: string; 
  quantity: number;
  formatNotes: string; 
  status: "pending" | "uploaded" | "revisions_requested" | "approved" | "live";
  dueDate?: string | null;      // Internal draft deadline
  goLiveDate?: string | null;   // Public launch deadline
};

// CreatorStatus (Step 3) 
// Maps to JSONB 'selected_creators' array
export type CreatorStatusV2 = {
  creatorId: string;
  status: "request_sent" | "pending" | "confirmed" | "rejected";
};

// CampaignBrief (Step 2)
// Maps to JSONB 'briefs'
export type CampaignBriefV2 = {
  id: string;
  title: string;
  keyMessages: string[];
  dos: string[];
  donts: string[];
  hashtags: string[];
  mentions: string[];
  referenceLinks: string[];
};

// The Root Container (Step 1 -> 4)
export type CampaignV2 = {
  id: string; // UUID
  
  // App context
  userId?: string;

  // Metadata
  name: string;
  brand: string;
  product: string;
  goal: string;

  // Logistics & Financials
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;

  // Targeting Arrays
  countries: string[];
  platforms: string[];
  audienceAgeRanges: string[];

  // Complex child entities
  briefs: CampaignBriefV2[];
  selectedCreators: CreatorStatusV2[];
  deliverables: CreatorDeliverableV2[];

  // State
  status: "DRAFT" | "PUBLISHED" | "FINISHED";
  lastStep: number;

  createdAt: string;
  updatedAt: string;
};

export const defaultCampaignV2 = (): Omit<CampaignV2, "id" | "createdAt" | "updatedAt"> => {
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  return {
    name: "",
    brand: "",
    product: "",
    goal: "",
    startDate: today,
    endDate: today,
    totalBudget: 0,
    currency: "USD",
    countries: [],
    platforms: [],
    audienceAgeRanges: [],
    briefs: [
      {
        id: crypto.randomUUID(),
        title: "Brief 1",
        keyMessages: [""],
        dos: [],
        donts: [],
        hashtags: [],
        mentions: [],
        referenceLinks: []
      }
    ],
    selectedCreators: [],
    deliverables: [],
    status: "DRAFT",
    lastStep: 1
  };
};

export const goalsV2 = [
  "Brand Awareness",
  "Product Launch",
  "Lead Generation",
  "Sales / Conversions",
  "Content Creation",
  "Event Promotion",
  "App Installs",
  "Community Building",
];

export const platformOptionsV2 = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter/X",
  "LinkedIn",
  "Snapchat",
];

export const countriesV2 = [
  "United Arab Emirates",
  "Saudi Arabia",
  "United States",
  "United Kingdom",
  "India",
  "Pakistan",
  "Canada",
];

export const ageRangesV2 = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

export const currenciesV2 = [
  { code: "AED", symbol: "د.إ", label: "AED (د.إ)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
];

export const contentTypesV2 = [
  "Story",
  "Reel",
  "Post",
  "Video",
  "Short",
];
