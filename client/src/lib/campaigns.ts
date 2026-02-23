export type BonusRule = {
  metric: string;
  threshold: number;
  amount: number;
};

export type ManualCreator = {
  handle: string;
  platform: string;
  rate: number;
  notes: string;
};

export type Deliverable = {
  id: string;
  platform: string;
  contentType: string;
  quantity: number;
  draftRequired: boolean;
  draftDueDate: string;
  publishDueDate: string;
  usageRights: string;
  usageDuration: string;
  formatNotes: string;
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
  notes: string;
  campaignType: string;
  audienceAgeRanges: string[];
  audienceInterests: string[];
  audienceGender: string;
  tone: string;
  competitorExclusivity: boolean;
  exclusivityCategory: string;
  exclusivityDuration: number;
  totalBudget: number;
  currency: string;
  paymentModel: string;
  budgetPerCreator: number;
  paymentTiming: string;
  bonusRules: BonusRule[];
  selectedCreators: string[];
  manualCreators: ManualCreator[];
  creatorFilters: {
    niche: string;
    followerRange: string;
    engagement: string;
    country: string;
    language: string;
    pastCollab: boolean;
  };
  brandOverview: string;
  productDetails: string;
  keyMessages: string[];
  dos: string[];
  donts: string[];
  mandatoryRequirements: string[];
  hashtags: string[];
  mentions: string[];
  referenceLinks: string[];
  fileUploads: string[];
  deliverables: Deliverable[];
  kpis: string[];
  trackingMethods: string[];
  utmBaseUrl: string;
  promoCodePattern: string;
  reportingFrequency: string;
  exportFormats: string[];
  status: "DRAFT" | "PUBLISHED";
  lastStep: number;
  createdAt: string;
  updatedAt: string;
};

export const STORAGE_KEY = "vairal-campaigns";

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

export const campaignTypes = [
  "Sponsored Post",
  "Product Gifting",
  "Affiliate",
  "Brand Ambassador",
  "Event Coverage",
  "Takeover",
  "UGC",
  "Whitelisting",
];

export const ageRanges = [
  "13-17",
  "18-24",
  "25-34",
  "35-44",
  "45-54",
  "55+",
];

export const tones = [
  "Professional",
  "Casual",
  "Humorous",
  "Educational",
  "Inspirational",
  "Bold",
  "Luxurious",
  "Minimalist",
];

export const currencies = [
  { code: "AED", symbol: "د.إ", label: "AED (د.إ)" },
  { code: "USD", symbol: "$", label: "USD ($)" },
  { code: "PKR", symbol: "₨", label: "PKR (₨)" },
  { code: "EUR", symbol: "€", label: "EUR (€)" },
  { code: "GBP", symbol: "£", label: "GBP (£)" },
  { code: "SAR", symbol: "﷼", label: "SAR (﷼)" },
];

export const paymentModels = [
  "Flat Fee",
  "Per Post",
  "Per Engagement",
  "Revenue Share",
  "Product Only",
  "Hybrid",
];

export const paymentTimings = [
  "Upfront",
  "50/50 Split",
  "On Delivery",
  "Net 30",
  "Net 60",
  "Milestone-based",
];

export const kpis = [
  "Impressions",
  "Reach",
  "Engagement Rate",
  "Click-Through Rate",
  "Conversions",
  "Sales Revenue",
  "App Installs",
  "Video Views",
  "Story Views",
  "Follower Growth",
  "Brand Mentions",
  "Share of Voice",
];

export const trackingMethods = [
  "UTM Links",
  "Promo Codes",
  "Affiliate Links",
  "Pixel Tracking",
  "Platform Analytics",
  "Manual Reporting",
];

export const reportingFrequencies = [
  "Daily",
  "Weekly",
  "Bi-weekly",
  "Monthly",
  "End of Campaign",
];

export const exportFormats = [
  "PDF",
  "CSV",
  "Excel",
  "Google Sheets",
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

export const usageRights = [
  "No Usage Rights",
  "Organic Only",
  "Paid Ads",
  "Full Rights",
  "Whitelisting",
];

export const usageDurations = [
  "30 Days",
  "60 Days",
  "90 Days",
  "6 Months",
  "12 Months",
  "Perpetual",
];

export const followerRanges = [
  "Nano (1K-10K)",
  "Micro (10K-50K)",
  "Mid (50K-200K)",
  "Macro (200K-1M)",
  "Mega (1M+)",
];

export const bonusMetrics = [
  "Views",
  "Likes",
  "Comments",
  "Shares",
  "Clicks",
  "Conversions",
  "Sales",
];

export const mandatoryRequirementOptions = [
  "Brand Tag",
  "Show Product",
  "Hashtag",
  "#ad Disclosure",
  "CTA",
  "Link / Code",
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
    notes: "",
    campaignType: "",
    audienceAgeRanges: [],
    audienceInterests: [],
    audienceGender: "",
    tone: "",
    competitorExclusivity: false,
    exclusivityCategory: "",
    exclusivityDuration: 0,
    totalBudget: 0,
    currency: "USD",
    paymentModel: "",
    budgetPerCreator: 0,
    paymentTiming: "",
    bonusRules: [],
    selectedCreators: [],
    manualCreators: [],
    creatorFilters: {
      niche: "",
      followerRange: "",
      engagement: "",
      country: "",
      language: "",
      pastCollab: false,
    },
    brandOverview: "",
    productDetails: "",
    keyMessages: [""],
    dos: [],
    donts: [],
    mandatoryRequirements: [],
    hashtags: [],
    mentions: [],
    referenceLinks: [],
    fileUploads: [],
    deliverables: [],
    kpis: [],
    trackingMethods: [],
    utmBaseUrl: "",
    promoCodePattern: "",
    reportingFrequency: "",
    exportFormats: [],
    status: "DRAFT",
    lastStep: 1,
  };
}

export function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCampaigns(campaigns: Campaign[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
}

export function getCampaign(id: string): Campaign | undefined {
  const campaigns = loadCampaigns();
  const found = campaigns.find((c) => c.id === id);
  if (found) return found;
  return mockCampaigns.find((c) => c.id === id);
}

export function createCampaign(data: Omit<Campaign, "id" | "createdAt" | "updatedAt">): Campaign {
  const campaigns = loadCampaigns();
  const now = new Date().toISOString();
  const campaign: Campaign = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  campaigns.push(campaign);
  saveCampaigns(campaigns);
  return campaign;
}

export function updateCampaign(id: string, data: Partial<Campaign>): Campaign | undefined {
  const campaigns = loadCampaigns();
  const index = campaigns.findIndex((c) => c.id === id);
  if (index === -1) return undefined;
  campaigns[index] = {
    ...campaigns[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  saveCampaigns(campaigns);
  return campaigns[index];
}

export function deleteCampaign(id: string): boolean {
  const campaigns = loadCampaigns();
  const filtered = campaigns.filter((c) => c.id !== id);
  if (filtered.length === campaigns.length) return false;
  saveCampaigns(filtered);
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
    startDate: "2026-03-01",
    endDate: "2026-04-15",
    notes: "Focus on Gen-Z and millennial beauty enthusiasts.",
    campaignType: "Sponsored Post",
    audienceAgeRanges: ["18-24", "25-34"],
    audienceInterests: ["Beauty", "Skincare", "Makeup"],
    audienceGender: "Female",
    tone: "Bold",
    competitorExclusivity: true,
    exclusivityCategory: "Beauty",
    exclusivityDuration: 90,
    totalBudget: 25000,
    currency: "USD",
    paymentModel: "Flat Fee",
    budgetPerCreator: 2500,
    paymentTiming: "50/50 Split",
    bonusRules: [{ metric: "Views", threshold: 100000, amount: 500 }],
    selectedCreators: ["creator-1", "creator-2"],
    manualCreators: [],
    creatorFilters: { niche: "Beauty", followerRange: "Micro (10K-50K)", engagement: "", country: "United States", language: "", pastCollab: false },
    brandOverview: "Luminara Beauty is a cruelty-free, sustainable beauty brand.",
    productDetails: "New summer palette with 12 warm-toned shades.",
    keyMessages: ["Cruelty-free beauty", "Summer-ready looks"],
    dos: ["Show product in natural light", "Mention shade range"],
    donts: ["No competitor mentions", "No filters on swatches"],
    mandatoryRequirements: ["Brand Tag", "Show Product", "Hashtag", "#ad Disclosure"],
    hashtags: ["#LuminaraSummer", "#GlowUp"],
    mentions: ["@luminarabeauty"],
    referenceLinks: ["https://luminara.example.com/summer"],
    fileUploads: [],
    deliverables: [
      { id: "d-1", platform: "Instagram", contentType: "Reel", quantity: 2, draftRequired: true, draftDueDate: "2026-03-10", publishDueDate: "2026-03-20", usageRights: "Paid Ads", usageDuration: "90 Days", formatNotes: "Vertical 9:16" },
      { id: "d-2", platform: "TikTok", contentType: "Video", quantity: 1, draftRequired: false, draftDueDate: "", publishDueDate: "2026-03-25", usageRights: "Organic Only", usageDuration: "60 Days", formatNotes: "" },
    ],
    kpis: ["Impressions", "Engagement Rate", "Video Views"],
    trackingMethods: ["UTM Links", "Platform Analytics"],
    utmBaseUrl: "https://luminara.example.com",
    promoCodePattern: "GLOW{CREATOR}",
    reportingFrequency: "Weekly",
    exportFormats: ["PDF", "CSV"],
    status: "PUBLISHED",
    lastStep: 8,
    createdAt: "2026-02-10T10:00:00.000Z",
    updatedAt: "2026-02-15T14:30:00.000Z",
  },
  {
    id: "mock-2",
    name: "Ramadan Fitness Challenge",
    brand: "FitLife UAE",
    product: "FitLife App Premium",
    goal: "App Installs",
    countries: ["United Arab Emirates"],
    platforms: ["Instagram", "YouTube", "TikTok"],
    startDate: "2026-03-10",
    endDate: "2026-04-10",
    notes: "Targeting health-conscious audience during Ramadan.",
    campaignType: "Brand Ambassador",
    audienceAgeRanges: ["25-34", "35-44"],
    audienceInterests: ["Fitness", "Health", "Wellness"],
    audienceGender: "",
    tone: "Inspirational",
    competitorExclusivity: false,
    exclusivityCategory: "",
    exclusivityDuration: 0,
    totalBudget: 40000,
    currency: "AED",
    paymentModel: "Hybrid",
    budgetPerCreator: 5000,
    paymentTiming: "Milestone-based",
    bonusRules: [{ metric: "Conversions", threshold: 500, amount: 1000 }],
    selectedCreators: ["creator-3"],
    manualCreators: [{ handle: "@fitguru_dubai", platform: "Instagram", rate: 3000, notes: "Previous collaboration went well" }],
    creatorFilters: { niche: "Fitness", followerRange: "Mid (50K-200K)", engagement: "", country: "United Arab Emirates", language: "", pastCollab: true },
    brandOverview: "FitLife is the leading fitness app in the MENA region.",
    productDetails: "Premium subscription with personalized Ramadan workout plans.",
    keyMessages: ["Stay fit during Ramadan", "Personalized plans"],
    dos: ["Show app interface", "Include workout demo"],
    donts: ["No eating scenes during fasting hours"],
    mandatoryRequirements: ["Brand Tag", "CTA", "Link / Code"],
    hashtags: ["#FitLifeRamadan", "#RamadanFitness"],
    mentions: ["@fitlifeuae"],
    referenceLinks: [],
    fileUploads: [],
    deliverables: [
      { id: "d-3", platform: "Instagram", contentType: "Story", quantity: 5, draftRequired: false, draftDueDate: "", publishDueDate: "2026-03-20", usageRights: "No Usage Rights", usageDuration: "30 Days", formatNotes: "" },
      { id: "d-4", platform: "YouTube", contentType: "Video", quantity: 1, draftRequired: true, draftDueDate: "2026-03-15", publishDueDate: "2026-03-25", usageRights: "Full Rights", usageDuration: "12 Months", formatNotes: "10-15 min long-form" },
    ],
    kpis: ["App Installs", "Click-Through Rate", "Video Views"],
    trackingMethods: ["UTM Links", "Promo Codes", "Platform Analytics"],
    utmBaseUrl: "https://fitlife.example.com",
    promoCodePattern: "RAMADAN{CREATOR}",
    reportingFrequency: "Weekly",
    exportFormats: ["PDF"],
    status: "PUBLISHED",
    lastStep: 8,
    createdAt: "2026-02-18T08:00:00.000Z",
    updatedAt: "2026-02-20T11:00:00.000Z",
  },
  {
    id: "mock-3",
    name: "Tech Review Series - Galaxy S26",
    brand: "Samsung MENA",
    product: "Galaxy S26 Ultra",
    goal: "Brand Awareness",
    countries: ["United Arab Emirates", "Saudi Arabia"],
    platforms: ["YouTube", "Twitter/X"],
    startDate: "2026-04-01",
    endDate: "2026-05-01",
    notes: "Unboxing and review content for launch week.",
    campaignType: "Sponsored Post",
    audienceAgeRanges: ["18-24", "25-34", "35-44"],
    audienceInterests: ["Technology", "Gadgets", "Mobile"],
    audienceGender: "",
    tone: "Professional",
    competitorExclusivity: true,
    exclusivityCategory: "Smartphones",
    exclusivityDuration: 60,
    totalBudget: 75000,
    currency: "AED",
    paymentModel: "Per Post",
    budgetPerCreator: 10000,
    paymentTiming: "On Delivery",
    bonusRules: [],
    selectedCreators: [],
    manualCreators: [{ handle: "@techreviewer_ae", platform: "YouTube", rate: 12000, notes: "" }],
    creatorFilters: { niche: "Technology", followerRange: "Macro (200K-1M)", engagement: "", country: "United Arab Emirates", language: "", pastCollab: false },
    brandOverview: "Samsung is a global leader in consumer electronics.",
    productDetails: "Galaxy S26 Ultra with next-gen AI features.",
    keyMessages: ["AI-powered photography", "All-day battery"],
    dos: ["Show real-world usage"],
    donts: ["No competitor comparisons"],
    mandatoryRequirements: ["Brand Tag", "#ad Disclosure", "Show Product"],
    hashtags: ["#GalaxyS26", "#SamsungMENA"],
    mentions: ["@samsungmena"],
    referenceLinks: ["https://samsung.example.com/s26"],
    fileUploads: [],
    deliverables: [
      { id: "d-6", platform: "YouTube", contentType: "Video", quantity: 1, draftRequired: true, draftDueDate: "2026-04-05", publishDueDate: "2026-04-10", usageRights: "Full Rights", usageDuration: "12 Months", formatNotes: "Unboxing + review, 10-15 min" },
      { id: "d-7", platform: "Twitter/X", contentType: "Post", quantity: 3, draftRequired: false, draftDueDate: "", publishDueDate: "2026-04-12", usageRights: "Organic Only", usageDuration: "30 Days", formatNotes: "Thread format preferred" },
    ],
    kpis: ["Impressions", "Reach", "Video Views"],
    trackingMethods: ["Platform Analytics", "UTM Links"],
    utmBaseUrl: "https://samsung.example.com/s26",
    promoCodePattern: "GALAXY{CREATOR}",
    reportingFrequency: "End of Campaign",
    exportFormats: ["PDF", "Excel"],
    status: "PUBLISHED",
    lastStep: 8,
    createdAt: "2026-02-22T09:00:00.000Z",
    updatedAt: "2026-02-22T09:00:00.000Z",
  },
  {
    id: "mock-4",
    name: "Eid Collection Showcase",
    brand: "Modanisa",
    product: "Eid 2026 Collection",
    goal: "Sales / Conversions",
    countries: ["Saudi Arabia", "United Arab Emirates", "Kuwait"],
    platforms: ["Instagram", "TikTok", "Snapchat"],
    startDate: "2026-04-05",
    endDate: "2026-04-20",
    notes: "Modest fashion campaign targeting GCC region.",
    campaignType: "Affiliate",
    audienceAgeRanges: ["18-24", "25-34"],
    audienceInterests: ["Fashion", "Modest Fashion", "Lifestyle"],
    audienceGender: "Female",
    tone: "Luxurious",
    competitorExclusivity: false,
    exclusivityCategory: "",
    exclusivityDuration: 0,
    totalBudget: 30000,
    currency: "AED",
    paymentModel: "Revenue Share",
    budgetPerCreator: 3000,
    paymentTiming: "Net 30",
    bonusRules: [{ metric: "Sales", threshold: 50, amount: 200 }],
    selectedCreators: ["creator-4", "creator-5"],
    manualCreators: [],
    creatorFilters: { niche: "Fashion", followerRange: "Micro (10K-50K)", engagement: "", country: "Saudi Arabia", language: "", pastCollab: false },
    brandOverview: "Modanisa is a leading modest fashion platform.",
    productDetails: "Curated Eid collection featuring abayas, dresses, and accessories.",
    keyMessages: ["Celebrate Eid in style", "Free shipping on orders over 200 AED"],
    dos: ["Try on haul format", "Show multiple outfits"],
    donts: ["No heavy filters"],
    mandatoryRequirements: ["Brand Tag", "Hashtag", "CTA", "Link / Code"],
    hashtags: ["#ModanisaEid", "#EidStyle2026"],
    mentions: ["@modanisa"],
    referenceLinks: ["https://modanisa.example.com/eid"],
    fileUploads: [],
    deliverables: [
      { id: "d-5", platform: "Instagram", contentType: "Carousel", quantity: 2, draftRequired: true, draftDueDate: "2026-04-08", publishDueDate: "2026-04-12", usageRights: "Organic Only", usageDuration: "60 Days", formatNotes: "Square 1:1" },
    ],
    kpis: ["Conversions", "Sales Revenue", "Click-Through Rate"],
    trackingMethods: ["Affiliate Links", "Promo Codes"],
    utmBaseUrl: "https://modanisa.example.com",
    promoCodePattern: "EID{CREATOR}",
    reportingFrequency: "Bi-weekly",
    exportFormats: ["CSV", "Google Sheets"],
    status: "PUBLISHED",
    lastStep: 8,
    createdAt: "2026-02-20T12:00:00.000Z",
    updatedAt: "2026-02-25T16:00:00.000Z",
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
