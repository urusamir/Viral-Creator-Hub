import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Filter, Users } from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiYoutube } from "react-icons/si";
import { useDummyData } from "@/lib/dummy-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const sampleCreators = [
  {
    name: "Alex Johnson",
    demographics: "Man, 25-34",
    niche: "Sport & Athletics, Lifestyle & ...",
    avatar: "/images/creator-1_1.jpg",
    cover: "/images/creator-1_3.jpg",
    platforms: [
      { icon: SiInstagram, followers: "671.7M", color: "text-pink-500" },
      { icon: SiFacebook, followers: "171.5M", color: "text-blue-500" },
      { icon: SiTiktok, followers: "190.8M", color: "text-foreground" },
    ],
  },
  {
    name: "Maria Garcia",
    demographics: "Woman, 25-34",
    niche: "Entertainment, Social Issues, ...",
    avatar: "/images/creator-woman-2_3.jpg",
    cover: "/images/creator-woman-2_2.jpg",
    platforms: [
      { icon: SiYoutube, followers: "467M", color: "text-red-500" },
      { icon: SiTiktok, followers: "124.7M", color: "text-foreground" },
      { icon: SiFacebook, followers: "187.4M", color: "text-blue-500" },
    ],
  },
  {
    name: "Sofia Martinez",
    demographics: "Woman, 13-17",
    niche: "TV, Film & Animation, Beauty, ...",
    avatar: "/images/creator-woman-2_4.jpg",
    cover: "/images/creator-woman-1_3.jpg",
    platforms: [
      { icon: SiInstagram, followers: "415.3M", color: "text-pink-500" },
      { icon: SiFacebook, followers: "85.5M", color: "text-blue-500" },
      { icon: SiTiktok, followers: "175.1M", color: "text-foreground" },
    ],
  },
  {
    name: "James Wilson",
    demographics: "Man, 37",
    niche: "Sport & Athletics, Lifestyle & ...",
    avatar: "/images/creator-1_4.jpg",
    cover: "/images/creator-1_6.jpg",
    platforms: [
      { icon: SiInstagram, followers: "511.5M", color: "text-pink-500" },
      { icon: SiFacebook, followers: "116.7M", color: "text-blue-500" },
      { icon: SiTiktok, followers: "4.4M", color: "text-foreground" },
    ],
  },
  {
    name: "Liam Brown",
    demographics: "Man, 25-34",
    niche: "Comedy, Entertainment, ...",
    avatar: "/images/creator-1_2.jpg",
    cover: "/images/creator-1_5.jpg",
    platforms: [
      { icon: SiYoutube, followers: "312M", color: "text-red-500" },
      { icon: SiTiktok, followers: "98.2M", color: "text-foreground" },
      { icon: SiInstagram, followers: "67.1M", color: "text-pink-500" },
    ],
  },
  {
    name: "Emma Davis",
    demographics: "Woman, 25-34",
    niche: "Culinary & Food, Lifestyle, ...",
    avatar: "/images/creator-woman-1_4.jpg",
    cover: "/images/creator-woman-1_1.jpg",
    platforms: [
      { icon: SiInstagram, followers: "45.2M", color: "text-pink-500" },
      { icon: SiYoutube, followers: "28.9M", color: "text-red-500" },
      { icon: SiFacebook, followers: "12.3M", color: "text-blue-500" },
    ],
  },
  {
    name: "Noah Taylor",
    demographics: "Man, 18-24",
    niche: "Music, Entertainment, ...",
    avatar: "/images/creator-1_6.jpg",
    cover: "/images/creator-1_1.jpg",
    platforms: [
      { icon: SiTiktok, followers: "89.4M", color: "text-foreground" },
      { icon: SiInstagram, followers: "56.7M", color: "text-pink-500" },
      { icon: SiYoutube, followers: "34.2M", color: "text-red-500" },
    ],
  },
  {
    name: "Olivia White",
    demographics: "Woman, 25-34",
    niche: "Beauty, Style & Fashion, ...",
    avatar: "/images/creator-woman-1_1.jpg",
    cover: "/images/creator-woman-2_4.jpg",
    platforms: [
      { icon: SiInstagram, followers: "78.3M", color: "text-pink-500" },
      { icon: SiTiktok, followers: "45.1M", color: "text-foreground" },
      { icon: SiYoutube, followers: "22.8M", color: "text-red-500" },
    ],
  },
];

const contentTopics = [
  { label: "Lifestyle & Blogs", count: "6.9M" },
  { label: "Beauty, Style & Fashion", count: "4.6M" },
  { label: "Family", count: "2.6M" },
  { label: "Arts, Culture & Society", count: "2.3M" },
  { label: "Travelling & Outdoors", count: "2.3M" },
  { label: "Sport & Athletics", count: "2.1M" },
  { label: "Culinary & Food", count: "2.1M" },
  { label: "TV, Film & Animation", count: "2.1M" },
  { label: "Music", count: "1.8M" },
  { label: "Entertainment", count: "1.5M" },
];

export default function DiscoverPage() {
  const { showDummy, setShowDummy } = useDummyData();

  return (
    <div className="p-6 sm:p-8 max-w-full mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-discover-title">Discovery</h1>
          <p className="text-sm text-muted-foreground mt-1">Find the perfect creators for your brand</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle-discover" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-discover"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>

      {showDummy ? <DummyDataView /> : <EmptyStateView />}
    </div>
  );
}

function DummyDataView() {
  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by creator, social handle, email, or topics"
              className="pl-10"
              data-testid="input-search-creators"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <p className="text-sm text-muted-foreground" data-testid="text-creator-count">
            1 - 24 of 14,357,887 creators
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort:</span>
            <Button variant="outline" data-testid="button-sort">
              Total Followers
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sampleCreators.map((creator, i) => (
            <Card
              key={i}
              className="bg-card border-border overflow-visible hover-elevate cursor-pointer"
              data-testid={`card-creator-${i}`}
            >
              <div className="relative">
                <img
                  src={creator.cover}
                  alt=""
                  className="w-full h-32 object-cover rounded-t-md"
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                  <Avatar className="w-14 h-14 border-2 border-card">
                    <AvatarImage src={creator.avatar} alt={creator.name} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {creator.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="pt-8 pb-4 px-4 text-center">
                <h3 className="text-sm font-semibold text-foreground truncate" data-testid={`text-creator-name-${i}`}>
                  {creator.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">{creator.demographics}</p>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">{creator.niche}</p>

                <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
                  {creator.platforms.map((p, j) => (
                    <div key={j} className="flex flex-col items-center gap-1">
                      <p.icon className={`w-4 h-4 ${p.color}`} />
                      <span className="text-xs text-muted-foreground font-medium">{p.followers}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="hidden lg:block w-72 shrink-0">
        <Card className="p-4 bg-card border-border sticky top-6" data-testid="card-filters">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-semibold text-foreground">Content Topics</h3>
          </div>

          <div className="mb-4">
            <Input placeholder="Start typing..." className="text-sm" data-testid="input-filter-search" />
          </div>

          <div className="space-y-3">
            {contentTopics.map((topic) => (
              <label key={topic.label} className="flex items-center gap-2 cursor-pointer group">
                <Checkbox data-testid={`checkbox-topic-${topic.label.toLowerCase().replace(/[,\s&]+/g, "-")}`} />
                <span className="text-sm text-foreground flex-1 truncate">{topic.label}</span>
                <span className="text-xs text-muted-foreground">({topic.count})</span>
              </label>
            ))}
          </div>

          <div className="border-t border-border mt-4 pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Followers & Eng Rate</h3>
            <div className="space-y-2">
              <Input placeholder="Min followers" className="text-sm" data-testid="input-min-followers" />
              <Input placeholder="Max followers" className="text-sm" data-testid="input-max-followers" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function EmptyStateView() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by creator, social handle, email, or topics"
            className="pl-10"
            data-testid="input-search-creators"
          />
        </div>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <Card className="p-12 bg-card border-border text-center" data-testid="card-empty-state">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Discover creators</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Search and filter through millions of creators to find the perfect match for your brand. Toggle "Preview with data" above to see a preview.
        </p>
      </Card>
    </div>
  );
}
