import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Eye,
  EyeOff,
  X,
  Trash2,
} from "lucide-react";
import { SiInstagram, SiYoutube, SiTiktok, SiLinkedin } from "react-icons/si";
import { SiX } from "react-icons/si";
import { useDummyData } from "@/lib/dummy-data";
import { CalendarSlot, STORAGE_KEY, currencies, contentTypes, platforms, loadSlots, saveSlots, getCurrencySymbol } from "@/lib/calendar-slots";
import { fetchCalendarSlots, createCalendarSlot, updateCalendarSlot, deleteCalendarSlot } from "@/lib/supabase-data";
import { relativeDate } from "@/lib/mock-dates";

const platformIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Instagram: SiInstagram,
  YouTube: SiYoutube,
  TikTok: SiTiktok,
  "Twitter/X": SiX,
  LinkedIn: SiLinkedin,
};

const platformColors: Record<string, string> = {
  Instagram: "text-pink-500",
  YouTube: "text-red-500",
  TikTok: "text-foreground",
  "Twitter/X": "text-foreground",
  LinkedIn: "text-blue-600",
};

const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  Confirmed: { dot: "bg-green-500", text: "text-green-500", bg: "bg-green-500/10" },
  Pending: { dot: "bg-yellow-500", text: "text-yellow-500", bg: "bg-yellow-500/10" },
  Cancelled: { dot: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" },
};

// Dates are relative to today — preview data always feels current
const mockSlots: CalendarSlot[] = [
  { id: "mock-1", date: relativeDate(-5), influencerName: "Alex Johnson", platform: "Instagram", contentType: "Reel", status: "Confirmed", currency: "USD", fee: "2500", campaign: "Spring Launch", notes: "" },
  { id: "mock-2", date: relativeDate(-3), influencerName: "Maria Garcia", platform: "YouTube", contentType: "Video", status: "Confirmed", currency: "USD", fee: "4000", campaign: "Spring Launch", notes: "" },
  { id: "mock-3", date: relativeDate(-1), influencerName: "James Wilson", platform: "TikTok", contentType: "Short", status: "Pending", currency: "USD", fee: "1200", campaign: "Product Review", notes: "" },
  { id: "mock-4", date: relativeDate(0), influencerName: "Sofia Martinez", platform: "Instagram", contentType: "Story", status: "Confirmed", currency: "EUR", fee: "800", campaign: "Brand Collab", notes: "" },
  { id: "mock-5", date: relativeDate(0), influencerName: "Emma Chen", platform: "Instagram", contentType: "Post", status: "Pending", currency: "USD", fee: "1500", campaign: "Brand Collab", notes: "" },
  { id: "mock-6", date: relativeDate(2), influencerName: "Alex Johnson", platform: "TikTok", contentType: "Live Stream", status: "Confirmed", currency: "USD", fee: "3000", campaign: "Brand Collab", notes: "" },
  { id: "mock-7", date: relativeDate(4), influencerName: "David Kim", platform: "YouTube", contentType: "Video", status: "Pending", currency: "GBP", fee: "5000", campaign: "Tech Review Series", notes: "" },
  { id: "mock-8", date: relativeDate(5), influencerName: "Liam Brown", platform: "TikTok", contentType: "Short", status: "Confirmed", currency: "USD", fee: "900", campaign: "Quick Bites", notes: "" },
  { id: "mock-9", date: relativeDate(7), influencerName: "Olivia White", platform: "Instagram", contentType: "Reel", status: "Pending", currency: "USD", fee: "2200", campaign: "Spring Launch", notes: "" },
  { id: "mock-10", date: relativeDate(10), influencerName: "Noah Taylor", platform: "Twitter/X", contentType: "Post", status: "Cancelled", currency: "USD", fee: "600", campaign: "Brand Awareness", notes: "" },
  { id: "mock-11", date: relativeDate(14), influencerName: "Maria Garcia", platform: "Instagram", contentType: "Story", status: "Confirmed", currency: "USD", fee: "1800", campaign: "Next Month Prep", notes: "" },
  { id: "mock-12", date: relativeDate(18), influencerName: "Emma Chen", platform: "LinkedIn", contentType: "Post", status: "Pending", currency: "USD", fee: "1000", campaign: "B2B Outreach", notes: "" },
];


function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function formatDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDisplayDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayHeaders = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function PlatformIcon({ platform, className = "w-3 h-3" }: { platform: string; className?: string }) {
  const Icon = platformIcons[platform];
  if (!Icon) return null;
  return <Icon className={`${className} ${platformColors[platform] || ""}`} />;
}

export default function CalendarPage() {
  const [showDummy, setShowDummy] = useState(false);
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [userSlots, setUserSlots] = useState<CalendarSlot[]>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState("");
  const [editSlot, setEditSlot] = useState<CalendarSlot | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CalendarSlot | null>(null);

  const [statusFilters, setStatusFilters] = useState({
    Confirmed: true,
    Pending: true,
    Cancelled: true,
  });
  const [platformFilters, setPlatformFilters] = useState({
    Instagram: true,
    YouTube: true,
    TikTok: true,
    "Twitter/X": true,
    LinkedIn: true,
  });

  // Load slots from Supabase on mount
  useEffect(() => {
    fetchCalendarSlots().then((slots) => {
      setUserSlots(slots);
      // Also sync to localStorage for cross-page instant access
      saveSlots(slots);
    }).catch(() => {
      // Fallback to localStorage if Supabase fails
      setUserSlots(loadSlots());
    });
  }, []);

  // Real data and mock data are always separate — toggle switches between them, never combines
  const allSlots = showDummy ? mockSlots : userSlots;

  const filteredSlots = allSlots.filter(
    (s) =>
      statusFilters[s.status as keyof typeof statusFilters] &&
      platformFilters[s.platform as keyof typeof platformFilters]
  );

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const openAddModal = (dateStr: string) => {
    setAddModalDate(dateStr);
    setAddModalOpen(true);
  };

  const handleAddSlot = (slot: Omit<CalendarSlot, "id">) => {
    const slotWithPayment = {
      ...slot,
      paymentStatus: slot.fee && parseFloat(slot.fee) > 0 ? ("pending" as const) : undefined,
      receiptData: null,
    };

    // 1. Close modal IMMEDIATELY — no waiting
    setAddModalOpen(false);

    // 2. Create slot with a local ID and add to UI instantly (optimistic)
    const localId = crypto.randomUUID();
    const newSlot: CalendarSlot = { ...slotWithPayment, id: localId };
    setUserSlots((prev) => {
      const updated = [...prev, newSlot];
      saveSlots(updated);
      return updated;
    });

    // 3. Persist to Supabase in the background (fire-and-forget)
    createCalendarSlot(slotWithPayment)
      .then((created) => {
        if (created && created.id !== localId) {
          // Replace local ID with Supabase-generated ID
          setUserSlots((prev) => {
            const updated = prev.map((s) => (s.id === localId ? { ...s, id: created.id } : s));
            saveSlots(updated);
            return updated;
          });
        }
      })
      .catch((e) => {
        console.error("Error persisting calendar slot to Supabase:", e);
        // Slot is already saved locally, so the user still sees it
      });
  };

  const handleEditSlot = (updated: CalendarSlot) => {
    // 1. Update UI immediately
    setUserSlots((prev) => {
      const newSlots = prev.map((s) => {
        if (s.id !== updated.id) return s;
        return { ...updated, paymentStatus: s.paymentStatus, receiptData: s.receiptData };
      });
      saveSlots(newSlots);
      return newSlots;
    });
    setEditSlot(null);

    // 2. Persist to Supabase in background
    updateCalendarSlot(updated.id, updated).catch((e) =>
      console.error("Error updating calendar slot in Supabase:", e)
    );
  };

  const handleDeleteSlot = (id: string) => {
    // 1. Update UI immediately
    setUserSlots((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSlots(updated);
      return updated;
    });
    setDeleteConfirm(null);
    setEditSlot(null);

    // 2. Persist to Supabase in background
    deleteCalendarSlot(id).catch((e) =>
      console.error("Error deleting calendar slot from Supabase:", e)
    );
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const prevMonthDays = getDaysInMonth(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());

  const cells: { day: number; dateStr: string; isCurrentMonth: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = currentMonth === 0 ? 11 : currentMonth - 1;
    const y = currentMonth === 0 ? currentYear - 1 : currentYear;
    cells.push({ day: d, dateStr: formatDate(y, m, d), isCurrentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, dateStr: formatDate(currentYear, currentMonth, d), isCurrentMonth: true });
  }
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      const m = currentMonth === 11 ? 0 : currentMonth + 1;
      const y = currentMonth === 11 ? currentYear + 1 : currentYear;
      cells.push({ day: d, dateStr: formatDate(y, m, d), isCurrentMonth: false });
    }
  }

  const upcomingSlots = filteredSlots
    .filter((s) => {
      const slotDate = new Date(s.date + "T00:00:00");
      return (
        slotDate >= new Date(todayStr + "T00:00:00") &&
        slotDate.getMonth() === currentMonth &&
        slotDate.getFullYear() === currentYear
      );
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-calendar-title">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-1">Schedule and manage influencer live dates</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle-calendar" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-calendar"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className="text-lg font-semibold text-foreground" data-testid="text-month-label">
          {monthNames[currentMonth]} {currentYear}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 text-white border-0"
            onClick={() => openAddModal(todayStr)}
            data-testid="button-add-slot"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Slot
          </Button>
          <Button variant="ghost" onClick={goToToday} data-testid="button-today">
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="button-prev-month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="button-next-month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-7 border-b border-border mb-1">
            {dayHeaders.map((d) => (
              <div key={d} className="text-xs font-medium text-muted-foreground uppercase text-center py-2">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map((cell, idx) => {
              const slotsForDay = filteredSlots.filter((s) => s.date === cell.dateStr);
              const isToday = cell.dateStr === todayStr;
              const isExpanded = expandedDay === cell.dateStr;
              const maxVisible = 2;
              const hiddenCount = slotsForDay.length - maxVisible;

              return (
                <div
                  key={idx}
                  className={`min-h-[100px] border border-border/50 p-1 cursor-pointer transition-colors hover:bg-muted/30 ${!cell.isCurrentMonth ? "opacity-40" : ""}`}
                  onClick={() => openAddModal(cell.dateStr)}
                  data-testid={`cell-${cell.dateStr}`}
                >
                  <div className="flex items-center justify-center mb-1">
                    <span
                      className={`text-sm w-7 h-7 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white font-bold" : "text-foreground"}`}
                    >
                      {cell.day}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {(isExpanded ? slotsForDay : slotsForDay.slice(0, maxVisible)).map((slot) => (
                      <button
                        key={slot.id}
                        className="w-full text-left px-1.5 py-0.5 rounded text-[10px] leading-tight flex items-center gap-1 truncate bg-muted/50 border border-border/50 hover:bg-muted"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (slot.id.startsWith("mock-")) return;
                          setEditSlot(slot);
                        }}
                        data-testid={`slot-chip-${slot.id}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusColors[slot.status].dot}`} />
                        <PlatformIcon platform={slot.platform} className="w-2.5 h-2.5 shrink-0" />
                        <span className="truncate text-foreground">{slot.influencerName}</span>
                      </button>
                    ))}
                    {!isExpanded && hiddenCount > 0 && (
                      <button
                        className="w-full text-left px-1.5 py-0.5 text-[10px] text-blue-500 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDay(cell.dateStr);
                        }}
                        data-testid={`button-more-${cell.dateStr}`}
                      >
                        +{hiddenCount} more
                      </button>
                    )}
                    {isExpanded && slotsForDay.length > maxVisible && (
                      <button
                        className="w-full text-left px-1.5 py-0.5 text-[10px] text-blue-500 font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedDay(null);
                        }}
                      >
                        Show less
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="hidden lg:block w-72 shrink-0">
          <Card className="p-4 bg-card border-border sticky top-6" data-testid="card-calendar-sidebar">
            <h3 className="text-sm font-semibold text-foreground mb-4">Filters</h3>

            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">By Status</p>
              <div className="space-y-2">
                {(["Confirmed", "Pending", "Cancelled"] as const).map((st) => (
                  <button
                    key={st}
                    className="flex items-center justify-between gap-2 w-full text-left text-sm"
                    onClick={() =>
                      setStatusFilters((p) => ({ ...p, [st]: !p[st] }))
                    }
                    data-testid={`filter-status-${st.toLowerCase()}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusColors[st].dot}`} />
                      <span className="text-foreground">{st}</span>
                    </div>
                    {statusFilters[st] ? (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase mb-2">By Platform</p>
              <div className="space-y-2">
                {platforms.map((pl) => (
                  <button
                    key={pl}
                    className="flex items-center justify-between gap-2 w-full text-left text-sm"
                    onClick={() =>
                      setPlatformFilters((p) => ({ ...p, [pl]: !(p as Record<string, boolean>)[pl] }))
                    }
                    data-testid={`filter-platform-${pl.toLowerCase().replace("/", "")}`}
                  >
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={pl} className="w-3.5 h-3.5" />
                      <span className="text-foreground">{pl}</span>
                    </div>
                    {platformFilters[pl as keyof typeof platformFilters] ? (
                      <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">This Month &mdash; Upcoming</h3>
              {upcomingSlots.length === 0 ? (
                <p className="text-xs text-muted-foreground">No slots scheduled this month</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {upcomingSlots.map((slot) => (
                    <div key={slot.id} className="flex items-start gap-2 text-xs" data-testid={`upcoming-${slot.id}`}>
                      <PlatformIcon platform={slot.platform} className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium truncate">{slot.influencerName}</p>
                        <p className="text-muted-foreground">{formatDisplayDate(slot.date)}</p>
                      </div>
                      <span className={`text-[10px] font-medium ${statusColors[slot.status].text}`}>
                        {slot.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <SlotModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialDate={addModalDate}
        onSave={handleAddSlot}
        mode="add"
      />

      {editSlot && (
        <SlotModal
          open={!!editSlot}
          onClose={() => setEditSlot(null)}
          initialDate={editSlot.date}
          onSave={(data) => handleEditSlot({ ...data, id: editSlot.id })}
          onDelete={() => setDeleteConfirm(editSlot)}
          mode="edit"
          initialData={editSlot}
        />
      )}

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Slot</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Remove {deleteConfirm?.influencerName}'s slot on {deleteConfirm ? formatDisplayDate(deleteConfirm.date) : ""}?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirm(null)} data-testid="button-cancel-delete">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteSlot(deleteConfirm.id)}
              data-testid="button-confirm-delete"
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SlotModal({
  open,
  onClose,
  initialDate,
  onSave,
  onDelete,
  mode,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  initialDate: string;
  onSave: (slot: Omit<CalendarSlot, "id">) => void;
  onDelete?: () => void;
  mode: "add" | "edit";
  initialData?: CalendarSlot;
}) {
  const parseDateParts = (dateStr: string) => {
    const now = new Date();
    if (!dateStr) {
      return { m: now.getMonth(), d: now.getDate(), y: now.getFullYear() };
    }
    const parts = dateStr.split("-");
    const y = parseInt(parts[0]);
    const m = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    if (isNaN(y) || isNaN(m) || isNaN(d)) {
      return { m: now.getMonth(), d: now.getDate(), y: now.getFullYear() };
    }
    return { m, d, y };
  };

  const initParts = parseDateParts(initialDate);
  const [dateMonth, setDateMonth] = useState(initParts.m);
  const [dateDay, setDateDay] = useState(initParts.d);
  const [dateYear, setDateYear] = useState(initParts.y);

  const daysInSelectedMonth = getDaysInMonth(dateYear, dateMonth);
  useEffect(() => {
    if (dateDay > daysInSelectedMonth) setDateDay(daysInSelectedMonth);
  }, [dateMonth, dateYear, dateDay, daysInSelectedMonth]);
  const effectiveDay = Math.min(dateDay, daysInSelectedMonth);
  const date = `${dateYear}-${String(dateMonth + 1).padStart(2, "0")}-${String(effectiveDay).padStart(2, "0")}`;

  const [influencerName, setInfluencerName] = useState("");
  const [platform, setPlatform] = useState("");
  const [contentType, setContentType] = useState("");
  const [status, setStatus] = useState<"Confirmed" | "Pending" | "Cancelled">("Pending");
  const [currency, setCurrency] = useState("USD");
  const [fee, setFee] = useState("");
  const [campaign, setCampaign] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const resetForm = useCallback(() => {
    if (mode === "edit" && initialData) {
      const p = parseDateParts(initialData.date);
      setDateMonth(p.m);
      setDateDay(p.d);
      setDateYear(p.y);
      setInfluencerName(initialData.influencerName);
      setPlatform(initialData.platform);
      setContentType(initialData.contentType);
      setStatus(initialData.status);
      setCurrency(initialData.currency);
      setFee(initialData.fee);
      setCampaign(initialData.campaign);
      setNotes(initialData.notes);
    } else {
      const p = parseDateParts(initialDate);
      setDateMonth(p.m);
      setDateDay(p.d);
      setDateYear(p.y);
      setInfluencerName("");
      setPlatform("");
      setContentType("");
      setStatus("Pending");
      setCurrency("USD");
      setFee("");
      setCampaign("");
      setNotes("");
    }
    setErrors({});
  }, [mode, initialData, initialDate]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleSubmit = () => {
    const newErrors: Record<string, boolean> = {};
    if (!influencerName.trim()) newErrors.influencerName = true;
    if (!platform) newErrors.platform = true;
    if (!date) newErrors.date = true;
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      date,
      influencerName: influencerName.trim(),
      platform,
      contentType,
      status,
      currency,
      fee,
      campaign: campaign.trim(),
      notes: notes.trim(),
    });
  };

  const isDisabled = !influencerName.trim() || !platform || !date;
  const currencyObj = currencies.find((c) => c.code === currency);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground" data-testid="text-modal-title">
            {mode === "add" ? "Add Slot" : "Edit Slot"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === "add" ? "Add a new influencer slot" : "Edit an existing influencer slot"}
          </DialogDescription>
        </DialogHeader>

        {mode === "add" && (
          <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 flex gap-3 mb-2" data-testid="info-banner">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Schedule influencer go-live slots</p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70 mt-0.5">
                Track which creators are going live, on which platform, and when. Add one slot at a time.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-foreground text-sm font-bold">Date</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={String(dateMonth)} onValueChange={(v) => { setDateMonth(parseInt(v)); setErrors((p) => ({ ...p, date: false })); }}>
                <SelectTrigger data-testid="select-date-month">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(dateDay)} onValueChange={(v) => { setDateDay(parseInt(v)); setErrors((p) => ({ ...p, date: false })); }}>
                <SelectTrigger data-testid="select-date-day">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(dateYear)} onValueChange={(v) => { setDateYear(parseInt(v)); setErrors((p) => ({ ...p, date: false })); }}>
                <SelectTrigger data-testid="select-date-year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Influencer Name *</Label>
            <Input
              placeholder="e.g., Alex Johnson"
              value={influencerName}
              onChange={(e) => { setInfluencerName(e.target.value); setErrors((p) => ({ ...p, influencerName: false })); }}
              className={errors.influencerName ? "border-red-500" : ""}
              data-testid="input-influencer-name"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Platform *</Label>
            <Select value={platform} onValueChange={(v) => { setPlatform(v); setErrors((p) => ({ ...p, platform: false })); }}>
              <SelectTrigger className={errors.platform ? "border-red-500" : ""} data-testid="select-platform">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {platforms.map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={p} className="w-4 h-4" />
                      <span>{p}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Content Type</Label>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger data-testid="select-content-type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((ct) => (
                  <SelectItem key={ct} value={ct}>{ct}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Status *</Label>
            <div className="flex gap-2" data-testid="status-pills">
              {(["Confirmed", "Pending", "Cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors border ${
                    status === s
                      ? `${statusColors[s].bg} ${statusColors[s].text} border-current`
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                  data-testid={`button-status-${s.toLowerCase()}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex items-center gap-0 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="px-3 text-xs text-muted-foreground uppercase">Optional</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Fee</Label>
            <div className="flex gap-2">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-24 shrink-0" data-testid="select-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.code} {c.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                data-testid="input-fee"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Campaign</Label>
            <Input
              placeholder="e.g., Spring Launch 2026"
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              data-testid="input-campaign"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Notes</Label>
            <Textarea
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={3}
              data-testid="input-notes"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-border">
          {mode === "edit" && onDelete ? (
            <Button variant="ghost" className="text-red-500" onClick={onDelete} data-testid="button-delete-slot">
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} data-testid="button-cancel-slot">
              Cancel
            </Button>
            <Button
              className="bg-blue-600 text-white border-0"
              onClick={handleSubmit}
              disabled={mode === "add" && isDisabled}
              data-testid="button-save-slot"
            >
              {mode === "add" ? "Add Slot" : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
