import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/providers/auth.provider";
import { fetchCampaignsV2 } from "@/services/api/campaigns-v2";
import { CampaignV2 } from "@/models/campaigns-v2.types";
import { Plus, Megaphone, Calendar as CalendarIcon, DollarSign, MoreHorizontal, Copy, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function CampaignsV2Page() {
  const [_, setLocation] = useLocation();
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignV2[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user?.id) return;
      const data = await fetchCampaignsV2(user.id);
      setCampaigns(data);
      setLoading(false);
    }
    load();
    
    // Add listener for cache invalidation
    const handleUpdate = () => load();
    window.addEventListener("vairal-campaigns-updated", handleUpdate);
    return () => window.removeEventListener("vairal-campaigns-updated", handleUpdate);
  }, [user?.id]);

  const handleCreate = () => {
    setLocation("/dashboard/campaigns-v2/new");
  };

  const handleEdit = (id: string) => {
    setLocation(`/dashboard/campaigns-v2/${id}`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns V2</h1>
          <p className="text-muted-foreground mt-1">
            Manage your high-performance deliverable pipeline.
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Create New Campaign
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 bg-muted/30 border-dashed border-2">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold mb-2">Launch your first V2 Campaign</h3>
          <p className="text-muted-foreground text-center max-w-md mx-auto mb-8">
            Create atomic deliverables, track progress via the executive dashboard, and automate creator onboarding.
          </p>
          <Button onClick={handleCreate} size="lg" className="h-12 px-8 gap-2 group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-semibold text-base">Create Campaign</span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const isActive = campaign.status === "PUBLISHED";
            
            return (
              <Card 
                key={campaign.id} 
                className="flex flex-col hover:border-primary/50 transition-colors shadow-sm group cursor-pointer"
                onClick={() => handleEdit(campaign.id)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <Badge variant={isActive ? "default" : "secondary"} className={isActive ? "bg-green-500 hover:bg-green-600" : ""}>
                      {campaign.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="-mt-1 -mr-2 opacity-50 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(campaign.id); }}>
                          Edit Strategy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                          <Trash className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div>
                    <CardTitle className="leading-tight mt-3 text-lg line-clamp-1">{campaign.name || "Untitled Campaign"}</CardTitle>
                    <CardDescription className="mt-1 font-medium">{campaign.brand || "Draft Brand"}</CardDescription>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-4 flex-1">
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                      <CalendarIcon className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
                      <span className="truncate">{campaign.startDate} — {campaign.endDate}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                      <DollarSign className="w-4 h-4 mr-2 text-primary/70 shrink-0" />
                      <span className="truncate">{campaign.currency} {campaign.totalBudget.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-0 pb-5">
                  <div className="w-full flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Creators</span>
                      <span className="font-semibold text-foreground text-base">
                        {campaign.selectedCreators.filter(c => c.status === "confirmed").length} <span className="text-muted-foreground text-sm font-normal">/ {campaign.selectedCreators.length}</span>
                      </span>
                    </div>
                    <div className="w-px h-8 bg-border"></div>
                    <div className="flex flex-col">
                      <span className="text-muted-foreground text-xs uppercase tracking-wider">Deliverables</span>
                      <span className="font-semibold text-foreground text-base">
                        {campaign.deliverables.filter(d => d.status === "live").length} <span className="text-muted-foreground text-sm font-normal">/ {campaign.deliverables.length}</span>
                      </span>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
