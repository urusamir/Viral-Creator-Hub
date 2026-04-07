import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
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
import { PlatformIcon } from "@/utils/platform";
import { formatMonthDay } from "@/utils/format";
import { CalendarSlot, currencies, contentTypes, platforms, getCurrencySymbol } from "@/models/calendar.types";
import { fetchCalendarSlots, createCalendarSlot, updateCalendarSlot, deleteCalendarSlot } from "@/services";
import { toast } from "@/hooks/use-toast";
import { relativeDate } from "@/models/mock-dates";
import { useAuth } from "@/providers/auth.provider";
import { usePrefetchedData } from "@/providers/prefetch.provider";
import { creatorsData } from "@/models/creators.data";
import { useDummyData } from "@/providers/dummy-data.provider";
import { mockCampaigns } from "@/models/campaign.types";

const statusColors: Record<string, { dot: string; text: string; bg: string }> = {
  Confirmed: { dot: "bg-green-500", text: "text-green-500", bg: "bg-green-500/10" },
  Pending: { dot: "bg-yellow-500", text: "text-yellow-500", bg: "bg-yellow-500/10" },
  Cancelled: { dot: "bg-red-500", text: "text-red-500", bg: "bg-red-500/10" },
};

const mockSlots: CalendarSlot[] = [
  { id: "mock-1", date: relativeDate(-5), influencerName: "Alex Johnson", platform: "Instagram", contentType: "Reel", status: "Confirmed", campaign: "Spring Launch", notes: "", slotType: "Scheduled Date" },
  { id: "mock-2", date: relativeDate(-3), influencerName: "Maria Garcia", platform: "YouTube", contentType: "Video", status: "Confirmed", campaign: "Spring Launch", notes: "", slotType: "Scheduled Date" },
  { id: "mock-3", date: relativeDate(-1), influencerName: "James Wilson", platform: "TikTok", contentType: "Short", status: "Pending", campaign: "Product Review", notes: "", slotType: "Scheduled Date" },
  { id: "mock-4", date: relativeDate(0), influencerName: "Sofia Martinez", platform: "Instagram", contentType: "Story", status: "Confirmed", campaign: "Brand Collab", notes: "", slotType: "Shoot Date" },
  { id: "mock-5", date: relativeDate(0), influencerName: "Emma Chen", platform: "Instagram", contentType: "Post", status: "Pending", campaign: "Brand Collab", notes: "", slotType: "Shoot Date" },
  { id: "mock-6", date: relativeDate(2), influencerName: "Alex Johnson", platform: "TikTok", contentType: "Live Stream", status: "Confirmed", campaign: "Brand Collab", notes: "", slotType: "Scheduled Date" },
  { id: "mock-7", date: relativeDate(4), influencerName: "David Kim", platform: "YouTube", contentType: "Video", status: "Pending", campaign: "Tech Review Series", notes: "", slotType: "Scheduled Date" },
  { id: "mock-8", date: relativeDate(5), influencerName: "Liam Brown", platform: "TikTok", contentType: "Short", status: "Confirmed", campaign: "Quick Bites", notes: "", slotType: "Shoot Date" },
  { id: "mock-9", date: relativeDate(7), influencerName: "Olivia White", platform: "Instagram", contentType: "Reel", status: "Pending", campaign: "Spring Launch", notes: "", slotType: "Scheduled Date" },
  { id: "mock-10", date: relativeDate(10), influencerName: "Noah Taylor", platform: "Twitter/X", contentType: "Post", status: "Cancelled", campaign: "Brand Awareness", notes: "", slotType: "Scheduled Date" },
  { id: "mock-11", date: relativeDate(14), influencerName: "Maria Garcia", platform: "Instagram", contentType: "Story", status: "Confirmed", campaign: "Next Month Prep", notes: "", slotType: "Shoot Date" },
  { id: "mock-12", date: relativeDate(18), influencerName: "Emma Chen", platform: "LinkedIn", contentType: "Post", status: "Pending", campaign: "B2B Outreach", notes: "", slotType: "Scheduled Date" },
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

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dayHeaders = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const prefetched = usePrefetchedData();
  const { showDummy, setShowDummy } = useDummyData();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [userSlots, setUserSlots] = useState<CalendarSlot[]>(() => prefetched.calendarSlots);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addModalDate, setAddModalDate] = useState("");
  const [editSlot, setEditSlot] = useState<CalendarSlot | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CalendarSlot | null>(null);
  const [activeTab, setActiveTab] = useState<"All" | "Shoot Date" | "Scheduled Date">("All");

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

  // Sync from prefetch provider when it updates (covers event-driven refreshes)
  useEffect(() => {
    if (prefetched.calendarSlots.length > 0 || userSlots.length === 0) {
      setUserSlots(prefetched.calendarSlots);
    }
  }, [prefetched.calendarSlots]);

  useEffect(() => {
    if (!user?.id) {
      setUserSlots([]);
      return;
    }
    
    // Skip initial fetch if we already have pre-fetched data
    if (userSlots.length > 0) return;

    const loadData = () => {
      setIsLoadingSlots(true);
      fetchCalendarSlots(user.id)
        .then((slots) => setUserSlots(slots))
        .catch(() => setUserSlots([]))
        .finally(() => setIsLoadingSlots(false));
    };

    loadData();
  }, [user?.id]);

  const campaignSlots = useMemo(() => {
    const campaignsToUse = showDummy ? mockCampaigns : prefetched.campaigns;
    return campaignsToUse.flatMap(campaign => {
      const creators = campaign.selectedCreators || [];
      return creators
        .flatMap((cc: any) => {
          const slots: CalendarSlot[] = [];
          const creatorObj = creatorsData.find(cr => cr.username === cc.creatorId);
          const name = creatorObj ? (creatorObj.fullname || creatorObj.username) : cc.creatorId;
          
          const deliverables = cc.deliverables || [];
          
          deliverables.forEach((deliverable: any) => {
            const platform = deliverable.platform || creatorObj?.channel || (campaign.platforms && campaign.platforms[0]) || "Instagram";
            const cType = deliverable.contentType || "Campaign";

            if (deliverable.submitShootBefore) {
              slots.push({
                id: `campaign-${campaign.id}-${cc.creatorId}-${deliverable.id}-shoot`,
                date: deliverable.submitShootBefore,
                influencerName: name,
                platform,
                contentType: cType,
                status: deliverable.status === "Live" || deliverable.status === "Approved & Scheduled" ? "Confirmed" : "Pending",
                campaign: campaign.name,
                campaign_id: campaign.id,
                notes: deliverable.contentDetails ? `Shoot due: ${deliverable.contentDetails}` : `Shoot due for ${campaign.name}`,
                slotType: "Shoot Date"
              });
            }
            if (deliverable.goLiveOn) {
              slots.push({
                id: `campaign-${campaign.id}-${cc.creatorId}-${deliverable.id}-schedule`,
                date: deliverable.goLiveOn,
                influencerName: name,
                platform,
                contentType: cType,
                status: "Pending",
                campaign: campaign.name,
                campaign_id: campaign.id,
                notes: deliverable.contentDetails ? `Go live: ${deliverable.contentDetails}` : `Go live for ${campaign.name}`,
                slotType: "Scheduled Date"
              });
            }
          });
          
          return slots;
        });
    });
  }, [prefetched.campaigns, showDummy]);

  // Real data and mock data are always separate — toggle switches between them, never combines
  const allSlots = showDummy ? campaignSlots : [...userSlots, ...campaignSlots];

  const filteredSlots = allSlots.filter(
    (s) =>
      statusFilters[s.status as keyof typeof statusFilters] &&
      platformFilters[s.platform as keyof typeof platformFilters] &&
      (activeTab === "All" || s.slotType === activeTab)
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

  const handleAddSlot = async (slot: Omit<CalendarSlot, "id">) => {
    // 1. Close modal immediately
    setAddModalOpen(false);

    // 2. Add to UI immediately with a temporary ID
    const tempId = crypto.randomUUID();
    const newSlot: CalendarSlot = { ...slot, id: tempId };
    setUserSlots((prev) => [...prev, newSlot]);

    // 3. Sync to Supabase in background
    if (!user?.id) {
      toast({ title: "Not logged in", description: "Please log in to save slots.", variant: "destructive" });
      setUserSlots((prev) => prev.filter((s) => s.id !== tempId));
      return;
    }
    const created = await createCalendarSlot(slot, user.id);
    if (created) {
      setUserSlots((prev) => prev.map((s) => (s.id === tempId ? { ...created } : s)));
    } else {
      toast({ title: "Sync Failed", description: "Slot reverted.", variant: "destructive" });
      setUserSlots((prev) => prev.filter((s) => s.id !== tempId));
    }
  };

  const handleEditSlot = async (updated: CalendarSlot) => {
    // 1. Keep a copy of the old slot for rollback
    const oldSlot = userSlots.find((s) => s.id === updated.id);
    
    // 2. Update UI immediately
    setUserSlots((prev) =>
      prev.map((s) => {
        if (s.id !== updated.id) return s;
        return { ...updated };
      })
    );
    setEditSlot(null);

    // 3. Sync to Supabase
    const success = await updateCalendarSlot(updated.id, updated);
    if (!success && oldSlot) {
       setUserSlots((prev) => prev.map((s) => (s.id === updated.id ? oldSlot : s)));
    }
  };

  const handleDeleteSlot = async (id: string) => {
    // 1. Keep a copy for rollback
    const oldSlot = userSlots.find((s) => s.id === id);

    // 2. Remove from UI immediately
    setUserSlots((prev) => prev.filter((s) => s.id !== id));
    setDeleteConfirm(null);
    setEditSlot(null);

    // 3. Sync to Supabase
    const success = await deleteCalendarSlot(id);
    if (!success && oldSlot) {
        setUserSlots((prev) => [...prev, oldSlot]);
    }
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
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground" data-testid="text-month-label">
            {monthNames[currentMonth]} {currentYear}
          </h2>
          <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border" data-testid="calendar-tabs">
            {(["All", "Shoot Date", "Scheduled Date"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-blue-100 text-blue-800 shadow-sm dark:bg-blue-900/40 dark:text-blue-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
                data-testid={`tab-${tab.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {tab === "All" ? "All Slots" : tab}
              </button>
            ))}
          </div>
        </div>
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
                          if (slot.campaign_id) {
                            setLocation(`/dashboard/campaigns/${slot.campaign_id}`);
                          } else {
                            setEditSlot(slot);
                          }
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
                        <p className="text-muted-foreground truncate">{formatMonthDay(slot.date)} • {slot.slotType || "Scheduled"}</p>
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
              Remove {deleteConfirm?.influencerName}'s slot on {deleteConfirm ? formatMonthDay(deleteConfirm.date) : ""}?
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
  const [slotType, setSlotType] = useState<"Shoot Date" | "Scheduled Date">("Scheduled Date");
  const [campaign, setCampaign] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const prefetched = usePrefetchedData();
  const campaigns = prefetched.campaigns || [];

  const allowReschedule = useMemo(() => {
    if (mode !== "edit" || !initialData?.date) return true;
    const now = new Date();
    const targetDate = new Date(`${initialData.date}T00:00:00`);
    now.setHours(0, 0, 0, 0);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays >= 3;
  }, [mode, initialData]);

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
      setSlotType(initialData.slotType || "Scheduled Date");
      setCampaign(initialData.campaign || "");
      setCampaignId(initialData.campaign_id || "");
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
      setSlotType("Scheduled Date");
      setCampaign("");
      setCampaignId("");
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
      slotType,
      campaign: campaign.trim(),
      campaign_id: campaignId || undefined,
      notes: notes.trim(),
    });
  };

  const isDisabled = !influencerName.trim() || !platform || !date;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground" data-testid="text-modal-title">
            {mode === "add" ? "Add Slot" : "Edit / Reschedule Slot"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === "add" ? "Add a new influencer slot" : "Edit or reschedule an existing influencer slot"}
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
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-sm font-bold">
                {mode === "edit" ? "Reschedule Date" : "Date"}
              </Label>
              {!allowReschedule && mode === "edit" && (
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 rounded">
                  Cannot reschedule (too close to live date)
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Select disabled={!allowReschedule} value={String(dateMonth)} onValueChange={(v) => { setDateMonth(parseInt(v)); setErrors((p) => ({ ...p, date: false })); }}>
                <SelectTrigger data-testid="select-date-month">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, i) => (
                    <SelectItem key={i} value={String(i)}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select disabled={!allowReschedule} value={String(dateDay)} onValueChange={(v) => { setDateDay(parseInt(v)); setErrors((p) => ({ ...p, date: false })); }}>
                <SelectTrigger data-testid="select-date-day">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1).map((d) => (
                    <SelectItem key={d} value={String(d)}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select disabled={!allowReschedule} value={String(dateYear)} onValueChange={(v) => { setDateYear(parseInt(v)); setErrors((p) => ({ ...p, date: false })); }}>
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

          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Slot Type *</Label>
            <div className="flex gap-2" data-testid="slottype-pills">
              {(["Shoot Date", "Scheduled Date"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setSlotType(st)}
                  className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors border ${
                    slotType === st
                      ? "bg-blue-100 text-blue-800 border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                  data-testid={`button-slottype-${st.replace(/\s+/g, '-').toLowerCase()}`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>



          <div className="space-y-1.5">
            <Label className="text-foreground text-sm">Campaign</Label>
            <Select 
              value={campaignId || "none"} 
              onValueChange={(val) => {
                if (val === "none") {
                  setCampaign("");
                  setCampaignId("");
                } else {
                  setCampaignId(val);
                  const selected = campaigns.find(c => c.id === val);
                  if (selected) {
                    setCampaign(selected.name);
                  }
                }
              }}
            >
              <SelectTrigger data-testid="select-campaign">
                <SelectValue placeholder="Select campaign (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {campaigns.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
