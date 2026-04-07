import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
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
import { PlatformIcon } from "@/utils/platform";
import { formatDisplayDate } from "@/utils/format";
import { getCurrencySymbol } from "@/models/calendar.types";
import { Campaign } from "@/models/campaign.types";
import { mockCampaigns } from "@/models/campaign.types";
import { fetchCampaigns, updateCampaignInDb } from "@/services/api/campaigns";
import { relativeDate } from "@/models/mock-dates";
import { useAuth } from "@/providers/auth.provider";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { useDummyData } from "@/providers/dummy-data.provider";

const mockPayments = mockCampaigns
  .filter((c) => c.totalBudget && parseFloat(String(c.totalBudget)) > 0)
  .map(c => ({
    ...c,
    paymentStatus: c.status === "FINISHED" ? "completed" as const : "pending" as const,
    date: c.startDate || c.createdAt || new Date().toISOString()
  }));

type DateFilter = "7" | "30" | "60" | "90" | "365" | "custom";

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
  // Include future-dated slots (calendar slots can be scheduled ahead)
  return date >= cutoff;
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function buildDateStr(month: number, day: number, year: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function PaymentsPage() {
  const { user } = useAuth();
  const prefetched = usePrefetchedData();
  const { showDummy, setShowDummy } = useDummyData();
  const [userCampaigns, setUserCampaigns] = useState<Campaign[]>(() => prefetched.campaigns);
  const [dateFilter, setDateFilter] = useState<DateFilter>("365");

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
  const [receiptCampaign, setReceiptCampaign] = useState<Campaign | null>(null);

  // Sync from prefetch provider when it updates (covers event-driven refreshes)
  useEffect(() => {
    if (prefetched.campaigns.length > 0 || userCampaigns.length === 0) {
      setUserCampaigns(prefetched.campaigns);
    }
  }, [prefetched.campaigns]);

  // Fallback: direct fetch if pre-fetched data wasn't available
  useEffect(() => {
    if (!user?.id) return;
    // Skip if we already have data from prefetch
    if (userCampaigns.length > 0) return;

    fetchCampaigns(user.id)
      .then((camps) => setUserCampaigns(camps))
      .catch(() => setUserCampaigns([]));
  }, [user?.id]);

  const realPayments = useMemo(() => {
    return userCampaigns
      .filter((s) => s.totalBudget && parseFloat(String(s.totalBudget)) > 0)
      .map((s) => ({
        ...s,
        paymentStatus: s.paymentStatus || "pending" as const,
        date: s.startDate || s.createdAt || new Date().toISOString()
      }));
  }, [userCampaigns]);

  const hasPayableSlots = realPayments.length > 0;



  const filteredMockPayments = useMemo(() => {
    return mockPayments.filter((p) => isWithinDateRange(p.date, dateFilter, customStart, customEnd));
  }, [dateFilter, customStart, customEnd]);

  const filteredRealPayments = useMemo(() => {
    return realPayments.filter((p) => isWithinDateRange(p.date, dateFilter, customStart, customEnd));
  }, [realPayments, dateFilter, customStart, customEnd]);

  const summaryCards = useMemo(() => {
    if (showDummy) {
      const completed = filteredMockPayments.filter((p) => p.paymentStatus === "completed");
      const pending = filteredMockPayments.filter((p) => p.paymentStatus === "pending");
      return {
        totalPaid: completed.reduce((sum, p) => sum + parseFloat(String(p.totalBudget)), 0),
        pendingAmount: pending.reduce((sum, p) => sum + parseFloat(String(p.totalBudget)), 0),
        pendingCount: pending.length,
        creatorsPaid: new Set(completed.map((p) => p.id)).size,
      };
    }
    const completed = filteredRealPayments.filter((p) => p.paymentStatus === "completed");
    const pending = filteredRealPayments.filter((p) => p.paymentStatus === "pending");
    return {
      totalPaid: completed.reduce((sum, p) => sum + parseFloat(String(p.totalBudget)), 0),
      pendingAmount: pending.reduce((sum, p) => sum + parseFloat(String(p.totalBudget)), 0),
      pendingCount: pending.length,
      creatorsPaid: new Set(completed.map((p) => p.id)).size, // In campaigns, this could be unique campaigns count
    };
  }, [showDummy, filteredMockPayments, filteredRealPayments]);

  const handleMarkCompleted = useCallback(async (campaignId: string, receiptBase64: string) => {
    // Save previous state for rollback
    const previousCampaigns = [...userCampaigns];

    // 1. Update UI immediately
    setUserCampaigns((prev) =>
      prev.map((s) =>
        s.id === campaignId ? { ...s, paymentStatus: "completed" as const, receiptData: receiptBase64 } : s
      )
    );
    setReceiptCampaign(null);

    // 2. Sync to Supabase in background
    try {
      await updateCampaignInDb(campaignId, {
        payment_status: "completed",
        receipt_data: receiptBase64,
      });
    } catch (e) {
      // Rollback if sync fails
      setUserCampaigns(previousCampaigns);
    }
  }, [userCampaigns]);

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
        filteredMockPayments.length > 0 ? (
          <RealPaymentTable payments={filteredMockPayments as Campaign[]} onRowClick={setReceiptCampaign} />
        ) : (
          <Card className="p-12 text-center" data-testid="card-empty-state">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No dummy payments match the selected date filter.
            </p>
          </Card>
        )
      ) : filteredRealPayments.length > 0 ? (
        <RealPaymentTable payments={filteredRealPayments as Campaign[]} onRowClick={setReceiptCampaign} />
      ) : (
        <Card className="p-12 text-center" data-testid="card-empty-state">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <CreditCard className="w-8 h-8 text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Create campaigns with a budget to see them here as pending payments. Toggle "Preview with data" to see a demo.
          </p>
        </Card>
      )}

      {receiptCampaign && (
        <ReceiptModal
          campaign={receiptCampaign}
          onClose={() => setReceiptCampaign(null)}
          onSubmit={handleMarkCompleted}
        />
      )}
    </div>
  );
}



function RealPaymentTable({ payments, onRowClick }: { payments: Campaign[]; onRowClick: (campaign: Campaign) => void }) {
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
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Campaign</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Platform</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Goal</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Budget</th>
                <th className="text-left text-xs font-medium text-muted-foreground pb-3">Timeline</th>
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
                  <td className="py-3 text-sm text-foreground font-medium">{p.name || "Untitled"}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5 flex-wrap max-w-[120px]">
                      {p.platforms && p.platforms.length > 0 ? (
                        p.platforms.map((platform) => (
                           <div key={platform} className="flex items-center gap-1">
                             <PlatformIcon platform={platform} />
                             <span className="text-xs text-muted-foreground">{platform}</span>
                           </div>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">--</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">{p.goal || "--"}</td>
                  <td className="py-3 text-sm text-muted-foreground capitalize">{p.status || "--"}</td>
                  <td className="py-3 text-sm text-foreground font-medium">
                    {getCurrencySymbol(p.currency)}{parseFloat(String(p.totalBudget)).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <div className="text-sm text-foreground font-medium">{p.startDate ? formatDisplayDate(p.startDate as any) : "TBD"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">to {p.endDate ? formatDisplayDate(p.endDate as any) : "TBD"}</div>
                  </td>
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
  campaign,
  onClose,
  onSubmit,
}: {
  campaign: Campaign;
  onClose: () => void;
  onSubmit: (campaignId: string, receiptBase64: string) => void;
}) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(campaign.receiptData || null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isCompleted = campaign.paymentStatus === "completed";

  const handleFileSelect = useCallback((file: File) => {
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Invalid File", description: "Please upload a PNG, JPG, or PDF.", variant: "destructive" });
      return;
    }

    if (file.type.startsWith("image/")) {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_WIDTH = 800;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.6);
        setReceiptFile(file);
        setReceiptPreview(dataUrl);
        URL.revokeObjectURL(objUrl);
      };
      img.src = objUrl;
    } else {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: "File too large", description: "PDFs must be under 2MB.", variant: "destructive" });
        return;
      }
      setReceiptFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleSubmit = () => {
    if (!receiptPreview) return;
    onSubmit(campaign.id, receiptPreview);
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
              { label: "Campaign Name", value: campaign.name || "Untitled" },
              { label: "Goal", value: campaign.goal || "--" },
              { label: "Start Date", value: campaign.startDate ? formatDisplayDate(campaign.startDate as any) : "TBD" },
              { label: "End Date", value: campaign.endDate ? formatDisplayDate(campaign.endDate as any) : "TBD" },
              { label: "Platforms", value: campaign.platforms?.join(", ") || "--" },
              { label: "Status", value: campaign.status || "Draft" },
              { label: "Total Budget", value: `${getCurrencySymbol(campaign.currency)}${parseFloat(String(campaign.totalBudget) || "0").toLocaleString()} ${campaign.currency}` },
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
