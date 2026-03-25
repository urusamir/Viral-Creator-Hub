import { useState, useMemo, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search, X, MapPin, Users, Mail, ExternalLink,
  Heart, MessageCircle, Play, Film, Shield,
  ChevronDown, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  SiInstagram, SiYoutube, SiTiktok, SiFacebook, SiSnapchat,
} from "react-icons/si";
import { creatorsData, type Creator } from "@/lib/creators-data";

// ─── constants ───────────────────────────────────────────────────────────────

const PLATFORM_CATEGORIES = ["Couples", "Family", "Educational", "Comedy", "Lifestyle", "Indian", "Emirati", "GCC", "Asian"];

// Deterministic category assignment per creator
function assignCategories(username: string): string[] {
  const h = username.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const c1 = PLATFORM_CATEGORIES[h % PLATFORM_CATEGORIES.length];
  const c2 = PLATFORM_CATEGORIES[(h * 13 + 5) % PLATFORM_CATEGORIES.length];
  return c1 === c2 ? [c1] : [c1, c2];
}

// Pre-compute categories for each creator so we don't re-run on every filter
const creatorsWithCategories = creatorsData.map((c) => ({
  ...c,
  categories: assignCategories(c.username),
}));

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtNum(n: number | null | undefined): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

function getInitials(name: string): string {
  return name.split(" ").slice(0, 2).map((w) => w[0] || "").join("").toUpperCase();
}

const GRADIENTS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#fd7143,#fcb69f)",
  "linear-gradient(135deg,#30cfd0,#330867)",
];
function avatarGrad(u: string) {
  return GRADIENTS[u.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];
}

const INTEREST_MAP: Record<string, string> = {
  "Clothes, Shoes, Handbags & Accessories": "Fashion",
  "Restaurants, Food & Grocery": "Food & Dining",
  "Friends, Family & Relationships": "Family",
  "Travel, Tourism & Aviation": "Travel",
  "Camera & Photography": "Photography",
  "Beauty & Cosmetics": "Beauty",
  "Toys, Children & Baby": "Parenting",
  "Electronics & Computers": "Tech",
  "Coffee, Tea & Beverages": "Beverages",
  "Fitness & Yoga": "Fitness",
  "Television & Film": "TV & Film",
  "Cars & Motorbikes": "Cars",
  "Luxury Goods": "Luxury",
  "Healthy Lifestyle": "Health",
};
const shortInt = (n: string) => INTEREST_MAP[n] || n;

// ─── Platform Icon helper ─────────────────────────────────────────────────────

function PlatformIcon({ platform, size = "sm" }: { platform: string; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  if (platform === "instagram") return <SiInstagram className={`${cls} text-pink-400`} />;
  if (platform === "youtube") return <SiYoutube className={`${cls} text-red-500`} />;
  if (platform === "tiktok") return <SiTiktok className={`${cls} text-foreground`} />;
  if (platform === "facebook") return <SiFacebook className={`${cls} text-blue-400`} />;
  if (platform === "snapchat") return <SiSnapchat className={`${cls} text-yellow-400`} />;
  // X / Twitter
  if (platform === "twitter") return (
    <svg className={`${cls} text-foreground`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
  return null;
}

function creatorPlatforms(c: Creator): string[] {
  const plats: string[] = [];
  if (c.instagram) plats.push("instagram");
  if (c.youtube) plats.push("youtube");
  if (c.tiktok) plats.push("tiktok");
  if (c.facebook) plats.push("facebook");
  if (c.snapchat) plats.push("snapchat");
  if (c.twitter) plats.push("twitter");
  return plats;
}

// ─── Creator Card ─────────────────────────────────────────────────────────────

function CreatorCard({ creator, onClick }: { creator: typeof creatorsWithCategories[0]; onClick: () => void }) {
  const grad = avatarGrad(creator.username);
  const initials = getInitials(creator.fullname);

  return (
    <Card
      onClick={onClick}
      className="bg-card border-border overflow-hidden cursor-pointer hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200"
      data-testid={`card-creator-${creator.username}`}
    >
      <div className="h-20 w-full" style={{ background: grad }} />
      <div className="flex justify-center -mt-7 mb-2">
        <div className="w-14 h-14 rounded-full border-2 border-card flex items-center justify-center text-white text-lg font-bold" style={{ background: grad }}>
          {initials}
        </div>
      </div>
      <div className="px-4 pb-4 text-center">
        <h3 className="text-sm font-semibold text-foreground truncate">{creator.fullname}</h3>
        <p className="text-xs text-muted-foreground">@{creator.username}</p>
        {(creator.city || creator.country) && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {[creator.city, creator.country].filter(Boolean).join(", ")}
          </p>
        )}

        {/* Stats: Followers | ER only — clean 50/50 split */}
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-border">
          <div className="text-center">
            <div className="text-sm font-bold text-foreground">{fmtNum(creator.followers)}</div>
            <div className="text-[10px] text-muted-foreground">Followers</div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="text-center">
            <div className="text-sm font-bold text-emerald-400">
              {creator.er != null ? `${creator.er}%` : "—"}
            </div>
            <div className="text-[10px] text-muted-foreground">Eng. Rate</div>
          </div>
        </div>

        {/* Single-line: 1 category + 1 interest max, no wrap */}
        <div className="flex gap-1 mt-2 justify-center overflow-hidden">
          {creator.categories[0] && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium whitespace-nowrap shrink-0">
              {creator.categories[0]}
            </span>
          )}
          {creator.topInterests[0] && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap truncate min-w-0">
              {shortInt(creator.topInterests[0].name)}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

// ─── BarRow helper ────────────────────────────────────────────────────────────

function BarRow({ label, pct, color = "bg-blue-500", maxPct = 100 }: { label: string; pct: number; color?: string; maxPct?: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${Math.min((pct / maxPct) * 100, 100)}%` }} />
      </div>
      <span className="text-xs text-foreground w-10 text-right shrink-0">{pct}%</span>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-muted/40 rounded-xl min-h-[64px]">
      <div className="text-base font-bold text-foreground leading-tight">{value}</div>
      <div className="text-[9px] text-muted-foreground mt-0.5 text-center leading-tight whitespace-nowrap">{label}</div>
    </div>
  );
}

// ─── Creator Profile Modal ────────────────────────────────────────────────────

function CreatorProfileModal({ creator, onClose }: { creator: Creator; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [onClose]);

  const grad = avatarGrad(creator.username);
  const initials = getInitials(creator.fullname);
  const credColor = creator.followerCredibility == null ? "text-muted-foreground" : creator.followerCredibility >= 70 ? "text-emerald-400" : creator.followerCredibility >= 50 ? "text-amber-400" : "text-red-400";
  const credBar = creator.followerCredibility == null ? "bg-muted" : creator.followerCredibility >= 70 ? "bg-emerald-500" : creator.followerCredibility >= 50 ? "bg-amber-500" : "bg-red-500";
  const maxCity = Math.max(...creator.topCities.map((c) => c.pct), 1);
  const maxCountry = Math.max(...creator.topCountries.map((c) => c.pct), 1);
  const plats = creatorPlatforms(creator);

  const platformLinks: Record<string, string> = {
    instagram: creator.instagram, youtube: creator.youtube, tiktok: creator.tiktok,
    facebook: creator.facebook, snapchat: creator.snapchat, twitter: creator.twitter,
  };
  const platformColors: Record<string, string> = {
    instagram: "bg-pink-500/10 text-pink-400 border-pink-500/20 hover:bg-pink-500/20",
    youtube: "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20",
    tiktok: "bg-foreground/5 text-foreground/70 border-border hover:bg-foreground/10",
    facebook: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    snapchat: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20",
    twitter: "bg-foreground/5 text-foreground/70 border-border hover:bg-foreground/10",
  };
  const platformLabel: Record<string, string> = {
    instagram: "Instagram", youtube: "YouTube", tiktok: "TikTok",
    facebook: "Facebook", snapchat: "Snapchat", twitter: "X",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end" style={{ background: "rgba(0,0,0,0.65)" }} onClick={onClose}>
      <div className="relative w-full max-w-[640px] bg-background overflow-y-auto shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition-colors">
          <X className="w-4 h-4" />
        </button>

        {/* Cover — avatar sits below it, name fully clear of the cover */}
        <div className="relative shrink-0">
          <div className="h-36 w-full" style={{ background: grad }} />
          {/* Avatar: bottom of cover, extends 50% below */}
          <div className="absolute bottom-0 left-6 translate-y-1/2">
            <div className="w-20 h-20 rounded-2xl border-4 border-background flex items-center justify-center text-white text-2xl font-bold" style={{ background: grad }}>
              {initials}
            </div>
          </div>
        </div>
        {/* Name section — starts well below the cover so nothing overlaps */}
        <div className="px-6 pt-14 pb-4">
          <h2 className="text-xl font-bold text-foreground leading-tight">{creator.fullname}</h2>
          <div className="flex items-center flex-wrap gap-1.5 mt-1">
            <span className="text-sm text-muted-foreground">@{creator.username}</span>
            {(creator.city || creator.country) && (
              <span className="text-sm text-muted-foreground flex items-center gap-0.5">
                <MapPin className="w-3 h-3" />
                {[creator.city, creator.country].filter(Boolean).join(", ")}
              </span>
            )}
            <Badge className="bg-pink-500/15 text-pink-400 border-pink-500/20 text-xs">{creator.channel}</Badge>
            {creator.gender && (
              <Badge variant="outline" className="text-xs">
                {creator.gender === "FEMALE" ? "Female" : creator.gender === "MALE" ? "Male" : creator.gender}
              </Badge>
            )}
          </div>
          {creator.bio && <p className="text-sm text-muted-foreground leading-relaxed mt-3">{creator.bio}</p>}
        </div>

        {/* Stats */}
        <div className="px-6 pb-2">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            <StatBox label="Followers" value={fmtNum(creator.followers)} />
            <StatBox label="Eng. Rate" value={creator.er != null ? `${creator.er}%` : "—"} />
            <StatBox label="Avg Likes" value={fmtNum(creator.avgLikes)} />
            <StatBox label="Avg Comments" value={fmtNum(creator.avgComments)} />
            <StatBox label="Avg Reels" value={fmtNum(creator.avgReelsPlays)} />
            <StatBox label="Total Posts" value={fmtNum(creator.totalPosts)} />
          </div>
        </div>

        <div className="px-6 py-4 space-y-6 flex-1">
          {/* Age */}
          {(creator.age1317 || creator.age1824 || creator.age2534 || creator.age3544) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Age Distribution</h3>
              <div className="space-y-2">
                {[{ label: "13–17", value: creator.age1317 }, { label: "18–24", value: creator.age1824 }, { label: "25–34", value: creator.age2534 }, { label: "35–44", value: creator.age3544 }]
                  .filter((a) => a.value != null)
                  .map((a) => <BarRow key={a.label} label={a.label} pct={a.value!} color="bg-indigo-500" />)}
              </div>
            </div>
          )}

          {/* Gender */}
          {(creator.malePct != null || creator.femalePct != null) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Gender Split</h3>
              <div className="space-y-2">
                {creator.femalePct != null && <BarRow label="Female" pct={creator.femalePct} color="bg-pink-500" />}
                {creator.malePct != null && <BarRow label="Male" pct={creator.malePct} color="bg-blue-500" />}
              </div>
            </div>
          )}

          {/* Countries + Cities */}
          <div className="grid sm:grid-cols-2 gap-6">
            {creator.topCountries.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Top Countries</h3>
                <div className="space-y-2">
                  {creator.topCountries.map((c, i) => <BarRow key={i} label={c.name} pct={c.pct} maxPct={maxCountry} color="bg-violet-500" />)}
                </div>
              </div>
            )}
            {creator.topCities.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Top Cities</h3>
                <div className="space-y-2">
                  {creator.topCities.map((c, i) => <BarRow key={i} label={c.name} pct={c.pct} maxPct={maxCity} color="bg-cyan-500" />)}
                </div>
              </div>
            )}
          </div>

          {/* Interests */}
          {creator.topInterests.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Top Interests</h3>
              <div className="flex flex-wrap gap-2">
                {creator.topInterests.map((t, i) => (
                  <Badge key={i} variant="outline" className="text-xs px-2.5 py-1">
                    {shortInt(t.name)} <span className="text-muted-foreground ml-1.5">{t.pct}%</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Audience Quality */}
          {(creator.followerCredibility != null || creator.notableFollowers != null) && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-muted-foreground" /> Audience Quality
              </h3>
              <div className="space-y-3">
                {creator.followerCredibility != null && (
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Follower Credibility</span>
                      <span className={`font-bold ${credColor}`}>{creator.followerCredibility}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className={`h-full ${credBar} rounded-full`} style={{ width: `${creator.followerCredibility}%` }} />
                    </div>
                  </div>
                )}
                {creator.notableFollowers != null && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Notable Followers</span>
                    <span className="font-medium text-foreground">{creator.notableFollowers}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Platforms & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Platforms & Contact</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {plats.map((p) => (
                <a key={p} href={platformLinks[p]} target="_blank" rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-full transition-colors ${platformColors[p]}`}>
                  <PlatformIcon platform={p} size="sm" /> {platformLabel[p]}
                </a>
              ))}
              {creator.linktree && (
                <a href={creator.linktree} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-full hover:bg-emerald-500/20 transition-colors">
                  <ExternalLink className="w-3 h-3" /> Linktree
                </a>
              )}
            </div>
            {creator.email && (
              <a href={`mailto:${creator.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="w-4 h-4" /> {creator.email}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar Checkbox group ───────────────────────────────────────────────────

function FilterGroup({ title, items, selected, onChange }: {
  title: string;
  items: { label: string; value: string; icon?: React.ReactNode; count?: number }[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (v: string) =>
    onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v]);

  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-2.5">
        {items.map((item) => (
          <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
            <Checkbox
              checked={selected.includes(item.value)}
              onCheckedChange={() => toggle(item.value)}
              data-testid={`checkbox-${title.toLowerCase().replace(/\s+/g, "-")}-${item.value}`}
            />
            {item.icon && <span>{item.icon}</span>}
            <span className="text-sm text-foreground flex-1 truncate">{item.label}</span>
            {item.count != null && <span className="text-xs text-muted-foreground">({item.count})</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

type SortField = "followers" | "er";
type SortDir = "desc" | "asc";

function SortControls({ field, dir, onFieldChange, onDirToggle }: {
  field: SortField; dir: SortDir; onFieldChange: (f: SortField) => void; onDirToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="flex items-center gap-1" ref={ref}>
      <div className="relative">
        <Button variant="outline" size="sm" onClick={() => setOpen((o) => !o)} className="gap-1.5">
          {field === "followers" ? "Total Followers" : "Engagement Rate"}
          <ChevronDown className="w-3.5 h-3.5" />
        </Button>
        {open && (
          <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[160px]">
            {(["followers", "er"] as SortField[]).map((f) => (
              <button key={f} onClick={() => { onFieldChange(f); setOpen(false); }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${field === f ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {f === "followers" ? "Total Followers" : "Engagement Rate"}
              </button>
            ))}
          </div>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={onDirToggle} className="px-2.5" title={dir === "desc" ? "Descending" : "Ascending"}>
        {dir === "desc" ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
      </Button>
    </div>
  );
}

// ─── Main Discover Page ───────────────────────────────────────────────────────

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [minFollowers, setMinFollowers] = useState("");
  const [maxFollowers, setMaxFollowers] = useState("");
  const [sortField, setSortField] = useState<SortField>("followers");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Creator | null>(null);

  // Progressive rendering: show 20, then load more on scroll
  const BATCH = 20;
  const [visibleCount, setVisibleCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Count creators per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    creatorsWithCategories.forEach((c) => c.categories.forEach((cat) => { counts[cat] = (counts[cat] || 0) + 1; }));
    return counts;
  }, []);

  // Platform counts
  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { instagram: 0, youtube: 0, tiktok: 0, facebook: 0, snapchat: 0, twitter: 0 };
    creatorsWithCategories.forEach((c) => {
      if (c.instagram) counts.instagram++;
      if (c.youtube) counts.youtube++;
      if (c.tiktok) counts.tiktok++;
      if (c.facebook) counts.facebook++;
      if (c.snapchat) counts.snapchat++;
      if (c.twitter) counts.twitter++;
    });
    return counts;
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    const minF = parseInt(minFollowers.replace(/[^0-9]/g, "")) || 0;
    const maxF = parseInt(maxFollowers.replace(/[^0-9]/g, "")) || Infinity;

    let list = creatorsWithCategories.filter((c) => {
      if (q && !(
        c.fullname.toLowerCase().includes(q) ||
        c.username.toLowerCase().includes(q) ||
        c.bio.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
      )) return false;

      if (selectedCategories.length > 0 && !selectedCategories.some((sc) => c.categories.includes(sc))) return false;

      if (selectedPlatforms.length > 0 && !selectedPlatforms.some((p) => {
        if (p === "instagram") return !!c.instagram;
        if (p === "youtube") return !!c.youtube;
        if (p === "tiktok") return !!c.tiktok;
        if (p === "facebook") return !!c.facebook;
        if (p === "snapchat") return !!c.snapchat;
        if (p === "twitter") return !!c.twitter;
        return false;
      })) return false;

      const followers = c.followers ?? 0;
      if (minF > 0 && followers < minF) return false;
      if (maxF < Infinity && followers > maxF) return false;

      return true;
    });

    list.sort((a, b) => {
      const va = sortField === "followers" ? (a.followers ?? 0) : (a.er ?? 0);
      const vb = sortField === "followers" ? (b.followers ?? 0) : (b.er ?? 0);
      return sortDir === "desc" ? vb - va : va - vb;
    });

    return list;
  }, [search, selectedCategories, selectedPlatforms, minFollowers, maxFollowers, sortField, sortDir]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(BATCH);
  }, [search, selectedCategories, selectedPlatforms, minFollowers, maxFollowers, sortField, sortDir]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + BATCH, filtered.length));
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [filtered.length]);

  const visibleCreators = filtered.slice(0, visibleCount);

  const categoryItems = PLATFORM_CATEGORIES.map((cat) => ({
    label: cat, value: cat, count: categoryCounts[cat] || 0,
  }));

  const platformItems = [
    { label: "Instagram", value: "instagram", count: platformCounts.instagram, icon: <SiInstagram className="w-3.5 h-3.5 text-pink-400" /> },
    { label: "YouTube", value: "youtube", count: platformCounts.youtube, icon: <SiYoutube className="w-3.5 h-3.5 text-red-500" /> },
    { label: "TikTok", value: "tiktok", count: platformCounts.tiktok, icon: <SiTiktok className="w-3.5 h-3.5 text-foreground" /> },
    { label: "Facebook", value: "facebook", count: platformCounts.facebook, icon: <SiFacebook className="w-3.5 h-3.5 text-blue-400" /> },
    { label: "Snapchat", value: "snapchat", count: platformCounts.snapchat, icon: <SiSnapchat className="w-3.5 h-3.5 text-yellow-400" /> },
    {
      label: "X", value: "twitter", count: platformCounts.twitter, icon: (
        <svg className="w-3.5 h-3.5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {selected && <CreatorProfileModal creator={selected} onClose={() => setSelected(null)} />}

      <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-discover-title">Discovery</h1>
          <p className="text-sm text-muted-foreground mt-1">Find the perfect creators for your brand</p>
        </div>

        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, handle, location, or interest…" className="pl-10" value={search}
                onChange={(e) => setSearch(e.target.value)} data-testid="input-search-creators" />
            </div>

            {/* Count + Sort */}
            <div className="flex items-center justify-between mb-4 gap-3">
              <p className="text-sm text-muted-foreground" data-testid="text-creator-count">
                {filtered.length} creator{filtered.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">Sort by</span>
                <SortControls field={sortField} dir={sortDir}
                  onFieldChange={setSortField}
                  onDirToggle={() => setSortDir((d) => (d === "desc" ? "asc" : "desc"))} />
              </div>
            </div>

            {/* Grid — only renders visibleCreators, not all 100+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {visibleCreators.map((creator) => (
                <CreatorCard key={creator.username} creator={creator} onClick={() => setSelected(creator)} />
              ))}
            </div>

            {/* Sentinel for infinite scroll */}
            {visibleCount < filtered.length && (
              <div ref={sentinelRef} className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {filtered.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No creators match your filters. <button className="text-blue-400 hover:underline ml-1" onClick={() => { setSearch(""); setSelectedCategories([]); setSelectedPlatforms([]); setMinFollowers(""); setMaxFollowers(""); }}>Clear all</button>
              </div>
            )}
          </div>

          {/* Sidebar: outer=sticky (NO overflow), inner=scrollable — prevents CSS sticky+overflow conflict */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-0 h-screen">
              <div className="h-full overflow-y-auto">
                <div className="py-6">
                  <Card className="p-4 bg-card border-border space-y-5" data-testid="card-filters">
                    {/* Categories */}
                    <FilterGroup title="Categories" items={categoryItems} selected={selectedCategories} onChange={setSelectedCategories} />

                    {/* Social Platforms */}
                    <div className="border-t border-border pt-5">
                      <FilterGroup title="Social Platforms" items={platformItems} selected={selectedPlatforms} onChange={setSelectedPlatforms} />
                    </div>

                    {/* Followers Range */}
                    <div className="border-t border-border pt-5">
                      <h3 className="text-sm font-semibold text-foreground mb-3">Followers Range</h3>
                      <div className="space-y-2">
                        <Input placeholder="Min followers" className="text-sm" value={minFollowers}
                          onChange={(e) => setMinFollowers(e.target.value)} data-testid="input-min-followers" />
                        <Input placeholder="Max followers" className="text-sm" value={maxFollowers}
                          onChange={(e) => setMaxFollowers(e.target.value)} data-testid="input-max-followers" />
                      </div>
                    </div>

                    {/* Clear filters */}
                    {(selectedCategories.length > 0 || selectedPlatforms.length > 0 || minFollowers || maxFollowers) && (
                      <Button variant="ghost" size="sm" className="w-full text-muted-foreground hover:text-foreground"
                        onClick={() => { setSelectedCategories([]); setSelectedPlatforms([]); setMinFollowers(""); setMaxFollowers(""); }}>
                        <X className="w-3.5 h-3.5 mr-1.5" /> Clear filters
                      </Button>
                    )}
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
