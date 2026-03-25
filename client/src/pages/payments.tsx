import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  CreditCard,
  Users,
  CalendarIcon,
  Upload,
  FileText,
  X,
  Check,
  Image as ImageIcon,
} from "lucide-react";
import { SiInstagram, SiYoutube, SiTiktok, SiLinkedin } from "react-icons/si";
import { SiX as SiXIcon } from "react-icons/si";
import { useDummyData } from "@/lib/dummy-data";
import { CalendarSlot, loadSlots, saveSlots, getCurrencySymbol } from "@/lib/calendar-slots";

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: SiInstagram,
  YouTube: SiYoutube,
  TikTok: SiTiktok,
  "Twitter/X": SiXIcon,
  LinkedIn: SiLinkedin,
};

const platformColors: Record<string, string> = {
  Instagram: "text-pink-500",
  YouTube: "text-red-500",
  TikTok: "text-foreground",
  "Twitter/X": "text-foreground",
  LinkedIn: "text-blue-600",
};

function PlatformIcon({ platform, className = "w-3.5 h-3.5" }: { platform: string; className?: string }) {
  const Icon = platformIcons[platform];
  if (!Icon) return null;
  return <Icon className={`${className} ${platformColors[platform] || ""}`} />;
}

const mockPayments = [
  { id: "mp-1", creator: "Alex Johnson", platform: "Instagram", contentType: "Reel", amount: 2500, currency: "USD", date: "2026-02-17", campaign: "Spring Launch 2026", status: "Completed" as const },
  { id: "mp-2", creator: "Maria Garcia", platform: "YouTube", contentType: "Video", amount: 1800, currency: "USD", date: "2026-02-15", campaign: "Spring Launch 2026", status: "Completed" as const },
  { id: "mp-3", creator: "James Wilson", platform: "TikTok", contentType: "Short", amount: 3200, currency: "USD", date: "2026-02-13", campaign: "Product Review", status: "Pending" as const },
  { id: "mp-4", creator: "Sofia Martinez", platform: "Instagram", contentType: "Story", amount: 1200, currency: "EUR", date: "2026-02-10", campaign: "Valentine's Day", status: "Completed" as const },
  { id: "mp-5", creator: "Emma Chen", platform: "Instagram", contentType: "Post", amount: 1500, currency: "USD", date: "2026-02-05", campaign: "Valentine's Day", status: "Pending" as const },
  { id: "mp-6", creator: "David Kim", platform: "YouTube", contentType: "Video", amount: 5000, currency: "GBP", date: "2026-01-30", campaign: "Tech Review Series", status: "Completed" as const },
  { id: "mp-7", creator: "Liam Brown", platform: "TikTok", contentType: "Short", amount: 900, currency: "USD", date: "2026-01-22", campaign: "Quick Bites", status: "Completed" as const },
  { id: "mp-8", creator: "Olivia White", platform: "Instagram", contentType: "Reel", amount: 2200, currency: "USD", date: "2026-01-15", campaign: "Spring Launch 2026", status: "Completed" as const },
  { id: "mp-9", creator: "Noah Taylor", platform: "Twitter/X", contentType: "Post", amount: 750, currency: "USD", date: "2026-01-08", campaign: "Brand Awareness", status: "Completed" as const },
  { id: "mp-10", creator: "Alex Johnson", platform: "TikTok", contentType: "Live Stream", amount: 3000, currency: "USD", date: "2025-12-28", campaign: "Holiday Campaign", status: "Completed" as const },
  { id: "mp-11", creator: "Maria Garcia", platform: "Instagram", contentType: "Story", amount: 1400, currency: "USD", date: "2025-12-22", campaign: "Holiday Campaign", status: "Completed" as const },
  { id: "mp-12", creator: "Emma Chen", platform: "YouTube", contentType: "Video", amount: 2800, currency: "USD", date: "2025-12-15", campaign: "Year-End Review", status: "Pending" as const },
  { id: "mp-13", creator: "Sofia Martinez", platform: "TikTok", contentType: "Reel", amount: 1600, currency: "EUR", date: "2025-12-05", campaign: "Winter Collection", status: "Completed" as const },
  { id: "mp-14", creator: "David Kim", platform: "Instagram", contentType: "Post", amount: 2100, currency: "USD", date: "2025-11-25", campaign: "Black Friday", status: "Completed" as const },
  { id: "mp-15", creator: "Liam Brown", platform: "YouTube", contentType: "Video", amount: 4200, currency: "USD", date: "2025-11-22", campaign: "Black Friday", status: "Completed" as const },
  { id: "mp-16", creator: "Olivia White", platform: "TikTok", contentType: "Short", amount: 1100, currency: "USD", date: "2025-11-10", campaign: "Fall Fashion", status: "Pending" as const },
  { id: "mp-17", creator: "James Wilson", platform: "Instagram", contentType: "Reel", amount: 1900, currency: "GBP", date: "2025-10-20", campaign: "Autumn Launch", status: "Completed" as const },
  { id: "mp-18", creator: "Noah Taylor", platform: "TikTok", contentType: "Short", amount: 650, currency: "USD", date: "2025-09-15", campaign: "Back to School", status: "Completed" as const },
  { id: "mp-19", creator: "Alex Johnson", platform: "YouTube", contentType: "Video", amount: 4500, currency: "USD", date: "2025-08-10", campaign: "Summer Series", status: "Completed" as const },
  { id: "mp-20", creator: "Maria Garcia", platform: "Instagram", contentType: "Reel", amount: 2000, currency: "USD", date: "2025-06-20", campaign: "Summer Vibes", status: "Completed" as const },
  { id: "mp-21", creator: "Sofia Martinez", platform: "YouTube", contentType: "Video", amount: 3500, currency: "EUR", date: "2025-05-12", campaign: "Spring Collection", status: "Completed" as const },
  { id: "mp-22", creator: "David Kim", platform: "TikTok", contentType: "Live Stream", amount: 2700, currency: "USD", date: "2025-04-08", campaign: "Product Launch", status: "Completed" as const },
];

type DateFilter = "7" | "30" | "60" | "90" | "365" | "custom";

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isWithinDateRange(dateStr: string, filter: DateFilter, customStart: string, customEnd: string): boolean {
  const date = new Date(dateStr + "T00:00:00");
  const now = new Date();
  now.setHours(23, 59, 59, 999);

  if (filter === "custom") {
    if (!customStart && !customEnd) return true;
    const start = customStart ? new Date(customStart + "T00:00:00") : new Date(0);
    const end = customEnd ? new Date(customEnd + "T23:59:59") : new Date(9999, 11, 31);
    return date >= start && date <= end;
  }

  const days = parseInt(filter);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  cutoff.setHours(0, 0, 0, 0);
  return date >= cutoff && date <= now;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function buildDateStr(month: number, day: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function PaymentsPage() {
  const [showDummy, setShowDummy] = useState(false);
  const [userSlots, setUserSlots] = useState<CalendarSlot[]>(loadSlots);
  const [dateFilter, setDateFilter] = useState<DateFilter>("30");

  const now = new Date();
  const [startMonth, setStartMonth] = useState(now.getMonth());
  const [startDay, setStartDay] = useState(1);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth());
  const [endDay, setEndDay] = useState(now.getDate());
  const [endYear, setEndYear] = useState(now.getFullYear());

  const customStart = dateFilter === "custom" ? buildDateStr(startMonth, startDay, startYear) : "";
  const customEnd = dateFilter === "custom" ? buildDateStr(endMonth, endDay, endYear) : "";

  const startDaysInMonth = getDaysInMonth(startYear, startMonth);
  const endDaysInMonth = getDaysInMonth(endYear, endMonth);

  useEffect(() => {
    if (startDay > startDaysInMonth) setStartDay(startDaysInMonth);
  }, [startMonth, startYear, startDaysInMonth, startDay]);

  useEffect(() => {
    if (endDay > endDaysInMonth) setEndDay(endDaysInMonth);
  }, [endMonth, endYear, endDaysInMonth, endDay]);
  const [receiptSlot, setReceiptSlot] = useState<CalendarSlot | null>(null);

  useEffect(() => {
    // Reload instantly when Calendar saves a slot (same-tab custom event)
    const reload = () => setUserSlots(loadSlots());
    window.addEventListener("vairal-slots-updated", reload);
    // Also handle cross-tab updates via the native storage event
    window.addEventListener("storage", reload);
    return () => {
      window.removeEventListener("vairal-slots-updated", reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  const realPayments = useMemo(() => {
    return userSlots
      .filter((s) => s.fee && parseFloat(s.fee) > 0)
      .map((s) => ({
        ...s,
        paymentStatus: s.paymentStatus || "pending" as const,
      }));
  }, [userSlots]);

  const hasPayableSlots = realPayments.length > 0;



  const filteredMockPayments = useMemo(() => {
    return mockPayments.filter((p) => isWithinDateRange(p.date, dateFilter, customStart, customEnd));
  }, [dateFilter, customStart, customEnd]);

  const filteredRealPayments = useMemo(() => {
    return realPayments.filter((p) => isWithinDateRange(p.date, dateFilter, customStart, customEnd));
  }, [realPayments, dateFilter, customStart, customEnd]);

  const summaryCards = useMemo(() => {
    if (showDummy) {
      const completed = filteredMockPayments.filter((p) => p.status === "Completed");
      const pending = filteredMockPayments.filter((p) => p.status === "Pending");
      return {
        totalPaid: completed.reduce((sum, p) => sum + p.amount, 0),
        pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
        pendingCount: pending.length,
        creatorsPaid: new Set(completed.map((p) => p.creator)).size,
      };
    }
    const completed = filteredRealPayments.filter((p) => p.paymentStatus === "completed");
    const pending = filteredRealPayments.filter((p) => p.paymentStatus === "pending");
    return {
      totalPaid: completed.reduce((sum, p) => sum + parseFloat(p.fee), 0),
      pendingAmount: pending.reduce((sum, p) => sum + parseFloat(p.fee), 0),
      pendingCount: pending.length,
      creatorsPaid: new Set(completed.map((p) => p.influencerName)).size,
    };
  }, [showDummy, filteredMockPayments, filteredRealPayments]);

  const handleMarkCompleted = useCallback((slotId: string, receiptBase64: string) => {
    try {
      setUserSlots((prev) => {
        const updated = prev.map((s) =>
          s.id === slotId ? { ...s, paymentStatus: "completed" as const, receiptData: receiptBase64 } : s
        );
        saveSlots(updated);
        return updated;
      });
      setReceiptSlot(null);
    } catch {
      alert("Failed to save receipt. The file may be too large for local storage.");
    }
  }, []);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-payments-title">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage creator payments</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle-payments" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-payments"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div />
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
          <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
            <SelectTrigger className="w-[160px]" data-testid="select-date-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="60">Last 60 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {dateFilter === "custom" && (
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">From</Label>
            <Select value={String(startMonth)} onValueChange={(v) => setStartMonth(parseInt(v))}>
              <SelectTrigger className="w-[130px]" data-testid="select-start-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((m, i) => (
                  <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(startDay)} onValueChange={(v) => setStartDay(parseInt(v))}>
              <SelectTrigger className="w-[80px]" data-testid="select-start-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: startDaysInMonth }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(startYear)} onValueChange={(v) => setStartYear(parseInt(v))}>
              <SelectTrigger className="w-[90px]" data-testid="select-start-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Label className="text-sm font-medium text-muted-foreground whitespace-nowrap">To</Label>
            <Select value={String(endMonth)} onValueChange={(v) => setEndMonth(parseInt(v))}>
              <SelectTrigger className="w-[130px]" data-testid="select-end-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((m, i) => (
                  <SelectItem key={i} value={String(i)}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(endDay)} onValueChange={(v) => setEndDay(parseInt(v))}>
              <SelectTrigger className="w-[80px]" data-testid="select-end-day">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: endDaysInMonth }, (_, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(endYear)} onValueChange={(v) => setEndYear(parseInt(v))}>
              <SelectTrigger className="w-[90px]" data-testid="select-end-year">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="p-5" data-testid="card-total-paid">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="text-total-paid">
            {summaryCards.totalPaid > 0 ? `$${summaryCards.totalPaid.toLocaleString()}` : "--"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summaryCards.totalPaid > 0 ? "Completed payments" : "No completed payments"}
          </p>
        </Card>
        <Card className="p-5" data-testid="card-pending">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm text-muted-foreground">Pending</p>
            <CreditCard className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="text-pending">
            {summaryCards.pendingAmount > 0 ? `$${summaryCards.pendingAmount.toLocaleString()}` : "--"}
          </p>
          {summaryCards.pendingCount > 0 ? (
            <Badge className="mt-1 bg-yellow-500/15 text-yellow-500 border-yellow-500/20" data-testid="badge-pending-count">
              {summaryCards.pendingCount} payment{summaryCards.pendingCount > 1 ? "s" : ""} pending
            </Badge>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">No pending payments</p>
          )}
        </Card>
        <Card className="p-5" data-testid="card-creators-paid">
          <div className="flex items-center justify-between gap-2 mb-3">
            <p className="text-sm text-muted-foreground">Creators Paid</p>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground" data-testid="text-creators-paid">
            {summaryCards.creatorsPaid > 0 ? summaryCards.creatorsPaid : "--"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {summaryCards.creatorsPaid > 0 ? "Unique creators" : "No creators paid yet"}
          </p>
        </Card>
      </div>

      {showDummy ? (
        <MockPaymentTable payments={filteredMockPayments} />
      ) : filteredRealPayments.length > 0 ? (
        <RealPaymentTable payments={filteredRealPayments} onRowClick={setReceiptSlot} />
      ) : (
        <Card className="p-12 text-center" data-testid="card-empty-state">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Add calendar slots with fees to see them here as pending payments. Toggle "Preview with data" to see a demo.
          </p>
        </Card>
      )}

      {receiptSlot && (
        <ReceiptModal
          slot={receiptSlot}
          onClose={() => setReceiptSlot(null)}
          onSubmit={handleMarkCompleted}
        />
      )}
    </div>
  );
}

function MockPaymentTable({ payments }: { payments: typeof mockPayments }) {
  return (
    <Card className="p-5" data-testid="card-payment-history">
      <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No payments in this date range</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-payments">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Creator</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platform</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Content</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-sm text-foreground font-medium">{p.creator}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <PlatformIcon platform={p.platform} />
                      <span className="text-sm text-muted-foreground">{p.platform}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{p.contentType}</td>
                  <td className="py-3 text-sm text-muted-foreground">{p.campaign}</td>
                  <td className="py-3 text-sm text-foreground font-medium">
                    {getCurrencySymbol(p.currency)}{p.amount.toLocaleString()}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{formatDisplayDate(p.date)}</td>
                  <td className="py-3">
                    <Badge
                      className={
                        p.status === "Completed"
                          ? "bg-green-500/15 text-green-500 border-green-500/20"
                          : "bg-yellow-500/15 text-yellow-500 border-yellow-500/20"
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function RealPaymentTable({ payments, onRowClick }: { payments: CalendarSlot[]; onRowClick: (slot: CalendarSlot) => void }) {
  return (
    <Card className="p-5" data-testid="card-payment-history">
      <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">No payments in this date range</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="table-payments">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Influencer</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platform</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Content</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Amount</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border last:border-0 cursor-pointer hover-elevate"
                  onClick={() => onRowClick(p)}
                  data-testid={`row-payment-${p.id}`}
                >
                  <td className="py-3 text-sm text-foreground font-medium">{p.influencerName}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <PlatformIcon platform={p.platform} />
                      <span className="text-sm text-muted-foreground">{p.platform}</span>
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{p.contentType}</td>
                  <td className="py-3 text-sm text-muted-foreground">{p.campaign || "--"}</td>
                  <td className="py-3 text-sm text-foreground font-medium">
                    {getCurrencySymbol(p.currency)}{parseFloat(p.fee).toLocaleString()}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{formatDisplayDate(p.date)}</td>
                  <td className="py-3">
                    {p.paymentStatus === "completed" ? (
                      <Badge className="bg-green-500/15 text-green-500 border-green-500/20">
                        <Check className="w-3 h-3 mr-1" />
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-500/15 text-yellow-500 border-yellow-500/20">
                        Pending
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function ReceiptModal({
  slot,
  onClose,
  onSubmit,
}: {
  slot: CalendarSlot;
  onClose: () => void;
  onSubmit: (slotId: string, receiptBase64: string) => void;
}) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(slot.receiptData || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCompleted = slot.paymentStatus === "completed";

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ["image/png", "image/jpeg", "application/pdf"];
    if (!validTypes.includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;

    setReceiptFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setReceiptPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (!receiptPreview) return;
    onSubmit(slot.id, receiptPreview);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isCompleted ? "Payment Details" : "Mark Payment Complete"}</DialogTitle>
          <DialogDescription>
            {isCompleted ? "This payment has been marked as completed." : "Upload a receipt to mark this payment as done."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Influencer", value: slot.influencerName },
              { label: "Platform", value: slot.platform },
              { label: "Date", value: formatDisplayDate(slot.date) },
              { label: "Content Type", value: slot.contentType },
              { label: "Campaign", value: slot.campaign || "--" },
              { label: "Amount", value: `${getCurrencySymbol(slot.currency)}${parseFloat(slot.fee).toLocaleString()} ${slot.currency}` },
            ].map((item) => (
              <div key={item.label} className="rounded-md bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          {isCompleted && receiptPreview ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Receipt</Label>
              {receiptPreview.startsWith("data:application/pdf") ? (
                <div className="flex items-center gap-2 p-3 rounded-md bg-muted/50">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">PDF Receipt uploaded</span>
                </div>
              ) : (
                <img
                  src={receiptPreview}
                  alt="Receipt"
                  className="max-h-48 rounded-md border border-border object-contain"
                  data-testid="img-receipt-preview"
                />
              )}
            </div>
          ) : !isCompleted ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Upload Receipt</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragOver ? "border-blue-500 bg-blue-500/5" : "border-border"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                data-testid="drop-zone-receipt"
              >
                {receiptPreview ? (
                  <div className="space-y-3">
                    {receiptPreview.startsWith("data:application/pdf") ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-foreground">{receiptFile?.name}</span>
                      </div>
                    ) : (
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="max-h-32 mx-auto rounded-md object-contain"
                        data-testid="img-receipt-preview"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setReceiptFile(null); setReceiptPreview(null); }}
                      data-testid="button-remove-receipt"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Drag and drop or{" "}
                      <button
                        type="button"
                        className="text-blue-500 underline"
                        onClick={() => fileInputRef.current?.click()}
                        data-testid="button-browse-file"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-xs text-muted-foreground/70">PNG, JPG or PDF up to 5MB</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file);
                  }}
                  data-testid="input-file-receipt"
                />
              </div>
            </div>
          ) : null}

          {!isCompleted && (
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} data-testid="button-cancel-receipt">
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!receiptPreview}
                data-testid="button-submit-receipt"
              >
                <Check className="w-4 h-4 mr-1" />
                Submit
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
