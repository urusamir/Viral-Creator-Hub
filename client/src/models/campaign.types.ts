import { relativeDate, relativeISO } from "./mock-dates";

export type Deliverable = {
  id: string;
  platform: string;
  contentType: string;
  quantity: number;
  formatNotes?: string;
};

export type CreatorDeliverable = {
  id: string;
  platform: string;
  contentType: string;
  contentDetails: string;
  status: "Not Started" | "Awaiting Shoot" | "Shoot Submitted" | "Changes Requested" | "Approved & Scheduled" | "Live";
  submitShootBefore?: string | null;
  goLiveOn?: string | null;
};

export type CampaignCreator = {
  creatorId: string;
  status: "Request Sent" | "Pending" | "Confirmed";
  deliverables: CreatorDeliverable[];
};

export type MoodboardItem = {
  id: string;
  url: string;
  thumbnailUrl?: string;
  note?: string;
};

export type CampaignBrief = {
  id: string;
  title: string;
  keyMessages: string[];
  dos: string[];
  donts: string[];
  hashtags: string[];
  mentions: string[];
  referenceLinks: string[];
  deliverables: Deliverable[];
  moodboard?: MoodboardItem[];
};

export type TimelineMilestone = {
  id: string;
  title: string;
  date: string;
  status: "pending" | "completed";
};

export type Campaign = {
  id: string;
  name: string;
  brand: string;
  product: string;
  goal: string;
  countries: string[];
  platforms: string[];
  startDate: string;
  endDate: string;
  totalBudget: number;
  currency: string;
  audienceAgeRanges: string[];
  keyMessages: string[];
  dos: string[];
  donts: string[];
  hashtags: string[];
  mentions: string[];
  referenceLinks: string[];
  deliverables: Deliverable[];
  briefs?: CampaignBrief[];
  selectedCreators: CampaignCreator[];
  status: "DRAFT" | "PUBLISHED" | "FINISHED";
  lastStep: number;
  paymentStatus?: "pending" | "completed";
  receiptData?: string | null;
  createdAt: string;
  updatedAt: string;
  milestones?: TimelineMilestone[];
};

// No localStorage — Supabase is the single source of truth

export const goals = [
  "Brand Awareness",
  "Product Launch",
  "Lead Generation",
  "Sales / Conversions",
  "Content Creation",
  "Event Promotion",
  "App Installs",
  "Community Building",
];

export const platformOptions = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter/X",
  "LinkedIn",
  "Snapchat",
];

export const countries = [
  "United Arab Emirates",
  "Saudi Arabia",
  "United States",
  "United Kingdom",
  "India",
  "Pakistan",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Egypt",
  "Kuwait",
  "Qatar",
  "Bahrain",
  "Oman",
  "Jordan",
];

export const ageRanges = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

export const currencies = [
  { code: "AED", symbol: "د.إ", label: "AED (د.إ)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "PKR", symbol: "₨", label: "PKR (₨)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "SAR", symbol: "﷼", label: "SAR (﷼)" },
];

export const contentTypes = [
  "Story",
  "Reel",
  "Post",
  "Video",
  "Live Stream",
  "Short",
  "Carousel",
  "Blog Post",
  "Podcast Mention",
];

export function getTodayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function createDefaultCampaign(): Omit<Campaign, "id" | "createdAt" | "updatedAt"> {
  const today = getTodayString();
  return {
    name: "",
    brand: "",
    product: "",
    goal: "",
    countries: [],
    platforms: [],
    startDate: today,
    endDate: today,
    totalBudget: 0,
    currency: "USD",
    audienceAgeRanges: [],
    keyMessages: [""],
    dos: [],
    donts: [],
    hashtags: [],
    mentions: [],
    referenceLinks: [],
    deliverables: [],
    briefs: [
      {
        id: crypto.randomUUID(),
        title: "Brief 1",
        keyMessages: [""],
        dos: [],
        donts: [],
        hashtags: [],
        mentions: [],
        referenceLinks: [],
        deliverables: [],
        moodboard: [],
      }
    ],
    selectedCreators: [],
    status: "DRAFT",
    lastStep: 1,
    paymentStatus: "pending",
    milestones: [],
  };
}

/**
 * Fetch a single campaign from Supabase (or mock data).
 * Used by the campaign wizard when editing an existing campaign.
 */
export async function getCampaignAsync(id: string): Promise<Campaign | undefined> {
  // Check mock campaigns first (for preview mode)
  const mock = mockCampaigns.find((c) => c.id === id);
  if (mock) return mock;

  // Fetch from Supabase
  const { fetchCampaigns } = await import("@/services");
  // We don't know the userId here, so we query directly
  const { supabase } = await import("@/services/supabase");
  const { data, error } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return undefined;

  // Map DB row to Campaign type (reuse the mapper from supabase-data)
  return {
    id: data.id,
    name: data.name,
    brand: data.brand || "",
    product: data.product || "",
    goal: data.goal || "",
    countries: data.countries || [],
    platforms: data.platforms || [],
    startDate: data.start_date || "",
    endDate: data.end_date || "",
    totalBudget: Number(data.total_budget) || 0,
    currency: data.currency || "USD",
    audienceAgeRanges: data.audience_age_ranges || [],
    keyMessages: data.key_messages || [],
    dos: data.dos || [],
    donts: data.donts || [],
    hashtags: data.hashtags || [],
    mentions: data.mentions || [],
    referenceLinks: data.reference_links || [],
    deliverables: data.deliverables || [],
    briefs: data.briefs && Array.isArray(data.briefs) && data.briefs.length > 0 
      ? data.briefs 
      : [{
          id: crypto.randomUUID(),
          title: "Brief 1",
          keyMessages: data.key_messages || [],
          dos: data.dos || [],
          donts: data.donts || [],
          hashtags: data.hashtags || [],
          mentions: data.mentions || [],
          referenceLinks: data.reference_links || [],
          deliverables: data.deliverables || [],
          moodboard: data.moodboard || [],
        }],
    selectedCreators: (data.selected_creators || []).map((c: any) => {
      // Data migration on the fly: Map old status and old phase
      const statusMap: Record<string, any> = {
        "pending": "Pending",
        "confirmed": "Confirmed"
      };
      return {
        creatorId: c.creatorId,
        status: statusMap[c.status] || c.status || "Pending",
        deliverables: c.deliverables || []
      };
    }),
    status: data.status || "DRAFT",
    lastStep: data.last_step || 1,
    paymentStatus: data.payment_status || "pending",
    receiptData: data.receipt_data || null,
    createdAt: data.created_at || new Date().toISOString(),
    updatedAt: data.updated_at || new Date().toISOString(),
    milestones: data.milestones || [],
  };
}

/**
 * Synchronous getter for mock campaigns only (for backward compat).
 */
export function getCampaign(id: string): Campaign | undefined {
  return mockCampaigns.find((c) => c.id === id);
}

export async function createCampaign(data: Omit<Campaign, "id" | "createdAt" | "updatedAt">, userId: string): Promise<Campaign | null> {
  const now = new Date().toISOString();
  const campaign: Campaign = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const { createCampaignInDb } = await import("@/services");
  const result = await createCampaignInDb(campaign, userId);
  if (!result) return null;

  window.dispatchEvent(new Event("vairal-campaigns-updated"));
  return campaign;
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<boolean> {
  const { updateCampaignInDb } = await import("@/services");
  const success = await updateCampaignInDb(id, data);
  if (!success) return false;

  window.dispatchEvent(new Event("vairal-campaigns-updated"));
  return true;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  const { deleteCampaignInDb } = await import("@/services");
  const success = await deleteCampaignInDb(id);
  if (!success) return false;

  window.dispatchEvent(new Event("vairal-campaigns-updated"));
  return true;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "mock-1",
    name: "Summer Glow Collection Launch",
    brand: "Luminara Beauty",
    product: "Summer Glow Palette",
    goal: "Product Launch",
    countries: ["United States", "United Kingdom"],
    platforms: ["Instagram", "TikTok"],
    startDate: relativeDate(-5),
    endDate: relativeDate(25),
    totalBudget: 25000,
    currency: "USD",
    audienceAgeRanges: ["18-24", "25-34"],
    keyMessages: ["Cruelty-free beauty", "Summer-ready looks"],
    dos: ["Show product in natural light", "Mention shade range"],
    donts: ["No competitor mentions", "No filters on swatches"],
    hashtags: ["#LuminaraSummer", "#GlowUp"],
    mentions: ["@luminarabeauty"],
    referenceLinks: ["https://luminara.example.com/summer"],
    deliverables: [
      { id: "d-1", platform: "Instagram", contentType: "Reel", quantity: 2 },
      { id: "d-2", platform: "TikTok", contentType: "Video", quantity: 1 },
    ],
    briefs: [
      {
        id: "mock-brief-1",
        title: "Brief 1",
        keyMessages: ["Cruelty-free beauty", "Summer-ready looks"],
        dos: ["Show product in natural light", "Mention shade range"],
        donts: ["No competitor mentions", "No filters on swatches"],
        hashtags: ["#LuminaraSummer", "#GlowUp"],
        mentions: ["@luminarabeauty"],
        referenceLinks: ["https://luminara.example.com/summer"],
        deliverables: [
          { id: "d-1", platform: "Instagram", contentType: "Reel", quantity: 2 },
          { id: "d-2", platform: "TikTok", contentType: "Video", quantity: 1 },
        ],
      }
    ],
    selectedCreators: [
      { creatorId: "creator-1", status: "Confirmed", deliverables: [] },
      { creatorId: "creator-2", status: "Confirmed", deliverables: [] }
    ],
    status: "PUBLISHED",
    lastStep: 3,
    paymentStatus: "completed",
    receiptData: null,
    createdAt: relativeISO(-20),
    updatedAt: relativeISO(-5),
  },
  {
    id: "mock-2",
    name: "Ramadan Fitness Challenge",
    brand: "FitLife UAE",
    product: "FitLife App Premium",
    goal: "App Installs",
    countries: ["United Arab Emirates"],
    platforms: ["Instagram", "YouTube", "TikTok"],
    startDate: relativeDate(5),
    endDate: relativeDate(35),
    totalBudget: 40000,
    currency: "AED",
    audienceAgeRanges: ["25-34", "35-44"],
    keyMessages: ["Stay fit", "Personalized plans"],
    dos: ["Show app interface", "Include workout demo"],
    donts: ["No eating scenes during fasting hours"],
    hashtags: ["#FitLifeChallenge", "#FitnessGoals"],
    mentions: ["@fitlifeuae"],
    referenceLinks: [],
    deliverables: [
      { id: "d-3", platform: "Instagram", contentType: "Story", quantity: 5 },
      { id: "d-4", platform: "YouTube", contentType: "Video", quantity: 1 },
    ],
    briefs: [
      {
        id: "mock-brief-2",
        title: "Brief 1",
        keyMessages: ["Stay fit", "Personalized plans"],
        dos: ["Show app interface", "Include workout demo"],
        donts: ["No eating scenes during fasting hours"],
        hashtags: ["#FitLifeChallenge", "#FitnessGoals"],
        mentions: ["@fitlifeuae"],
        referenceLinks: [],
        deliverables: [
          { id: "d-3", platform: "Instagram", contentType: "Story", quantity: 5 },
          { id: "d-4", platform: "YouTube", contentType: "Video", quantity: 1 },
        ],
      }
    ],
    selectedCreators: [
      { creatorId: "creator-3", status: "Request Sent", deliverables: [] }
    ],
    status: "DRAFT",
    lastStep: 3,
    paymentStatus: "pending",
    receiptData: null,
    createdAt: relativeISO(-10),
    updatedAt: relativeISO(-8),
  },
];

export const mockCreatorResults = [
  { id: "creator-1", name: "Sara Al-Rashidi", handle: "@sara.beauty", platform: "Instagram", followers: "45K", engagement: "4.2%", niche: "Beauty", country: "United Arab Emirates" },
  { id: "creator-2", name: "Liam Chen", handle: "@liamcreates", platform: "TikTok", followers: "120K", engagement: "6.8%", niche: "Lifestyle", country: "United States" },
  { id: "creator-3", name: "Ahmed Fitness", handle: "@ahmed.fit", platform: "Instagram", followers: "85K", engagement: "5.1%", niche: "Fitness", country: "United Arab Emirates" },
  { id: "creator-4", name: "Fatima Zahra", handle: "@fatimastyle", platform: "Instagram", followers: "32K", engagement: "7.3%", niche: "Fashion", country: "Saudi Arabia" },
  { id: "creator-5", name: "Noor Hijabi", handle: "@noor.modest", platform: "TikTok", followers: "67K", engagement: "5.9%", niche: "Fashion", country: "Kuwait" },
  { id: "creator-6", name: "Tech Wael", handle: "@techwael", platform: "YouTube", followers: "210K", engagement: "3.8%", niche: "Technology", country: "Egypt" },
  { id: "creator-7", name: "Rania Gourmet", handle: "@raniaeats", platform: "Instagram", followers: "55K", engagement: "4.5%", niche: "Food", country: "Jordan" },
  { id: "creator-8", name: "Omar Travels", handle: "@omartravels", platform: "YouTube", followers: "150K", engagement: "4.0%", niche: "Travel", country: "United Arab Emirates" },
];
