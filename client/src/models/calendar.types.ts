export type CalendarSlot = {
  id: string;
  date: string;
  influencerName: string;
  platform: string;
  contentType: string;
  status: "Confirmed" | "Pending" | "Cancelled";
  campaign: string;
  campaign_id?: string;
  notes: string;
  slotType: "Shoot Date" | "Scheduled Date";
};

export const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "\u20AC" },
  { code: "GBP", symbol: "\u00A3" },
  { code: "INR", symbol: "\u20B9" },
  { code: "AED", symbol: "\u062F.\u0625" },
  { code: "CAD", symbol: "C$" },
  { code: "AUD", symbol: "A$" },
];

export const contentTypes = ["Story", "Reel", "Post", "Video", "Live Stream", "Short"];
export const platforms = ["Instagram", "YouTube", "TikTok", "Twitter/X", "LinkedIn"];

export function getCurrencySymbol(code: string): string {
  return currencies.find((c) => c.code === code)?.symbol || "$";
}
