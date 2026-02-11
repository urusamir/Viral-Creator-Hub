import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

const sampleCreators = [
  { name: "Alex Johnson", platform: "Instagram", followers: "520K", engagement: "4.8%", niche: "Fashion" },
  { name: "Maria Garcia", platform: "TikTok", followers: "1.2M", engagement: "6.2%", niche: "Beauty" },
  { name: "James Wilson", platform: "YouTube", followers: "890K", engagement: "3.9%", niche: "Tech" },
  { name: "Sofia Martinez", platform: "Instagram", followers: "340K", engagement: "5.1%", niche: "Fitness" },
  { name: "Liam Brown", platform: "TikTok", followers: "2.1M", engagement: "7.3%", niche: "Comedy" },
  { name: "Emma Davis", platform: "YouTube", followers: "450K", engagement: "4.2%", niche: "Food" },
];

export default function DiscoverPage() {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground" data-testid="text-discover-title">Discover Creators</h1>
        <p className="text-sm text-muted-foreground mt-1">Find the perfect creators for your brand</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search creators by name, niche, or platform..." className="pl-10" data-testid="input-search-creators" />
        </div>
        <Button variant="outline" data-testid="button-filter">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleCreators.map((creator, i) => (
          <Card key={i} className="p-5 bg-card border-border" data-testid={`card-creator-${i}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shrink-0">
                {creator.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{creator.name}</p>
                <p className="text-xs text-muted-foreground">{creator.platform}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="secondary">{creator.niche}</Badge>
              <Badge variant="outline">{creator.followers}</Badge>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">Engagement: <span className="text-green-500 font-medium">{creator.engagement}</span></span>
              <Button variant="outline" data-testid={`button-view-creator-${i}`}>
                View Profile
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
