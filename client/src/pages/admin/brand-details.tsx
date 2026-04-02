import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  ArrowLeft,
  Mail,
  Globe,
  Calendar,
  CreditCard,
  Target,
  Bookmark,
  ListVideo
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BrandData {
  profile: any;
  savedCreators: any[];
  campaigns: any[];
  lists: any[];
  calendarSlots: any[];
}

export default function AdminBrandDetails(props: { params?: { id: string } }) {
  const [match, routeParams] = useRoute("/admin/brands/:id");
  const brandId = props.params?.id || routeParams?.id;
  
  const [data, setData] = useState<BrandData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      setIsLoading(false);
      setError("Brand ID is missing from the URL.");
      return;
    }

    async function fetchBrandData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch parallel data from supabase
        const [
          profileRes,
          savedCreatorsRes,
          campaignsRes,
          listsRes,
          calendarRes,
          listMembersRes
        ] = await Promise.all([
          supabase.from("profiles").select("*").eq("id", brandId).single(),
          supabase.from("saved_creators").select("*").eq("user_id", brandId).order("created_at", { ascending: false }),
          supabase.from("campaigns").select("*").eq("user_id", brandId).order("created_at", { ascending: false }),
          supabase.from("creator_lists").select("*").eq("user_id", brandId).order("created_at", { ascending: false }),
          supabase.from("calendar_slots").select("*").eq("user_id", brandId).order("date", { ascending: false }),
          supabase.from("creator_list_members").select("*, creator_lists!inner(user_id)").eq("creator_lists.user_id", brandId)
        ]);

        if (profileRes.error) throw profileRes.error;

        // Group members by list_id
        const listMembers = listMembersRes.data || [];
        const listsData = (listsRes.data || []).map(list => ({
          ...list,
          members: listMembers.filter((m: any) => m.list_id === list.id)
        }));

        setData({
          profile: profileRes.data || {},
          savedCreators: savedCreatorsRes.data || [],
          campaigns: campaignsRes.data || [],
          lists: listsData,
          calendarSlots: calendarRes.data || []
        });

      } catch (err: any) {
        console.error("Error fetching brand details:", err);
        setError(err.message || "Failed to load brand data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrandData();
  }, [brandId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-slate-500">Loading brand details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="text-red-500">Error: {error || "Brand not found."}</p>
        <Link href="/admin/brands">
          <Button variant="outline" className="mt-4 border-slate-300">Return to Directory</Button>
        </Link>
      </div>
    );
  }

  const { profile, savedCreators, campaigns, lists, calendarSlots } = data;

  const totalSpent = calendarSlots
    .filter(slot => slot.payment_status === "completed" || slot.has_payment)
    .reduce((sum, slot) => sum + (parseFloat(slot.fee) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <Link href="/admin/brands">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-inner">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                {profile.company_name || "Unnamed Brand"}
                {profile.is_admin && <Badge variant="secondary" className="bg-purple-100 text-purple-800 hover:bg-purple-200">Admin</Badge>}
              </h1>
              <div className="text-slate-500 flex items-center gap-4 text-sm mt-1">
                <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {profile.email}</span>
                {profile.website && (
                  <span className="flex items-center gap-1.5">
                    <Globe className="h-3.5 w-3.5" /> 
                    <a href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                      {profile.website}
                    </a>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Spent</div>
            <div className="text-2xl font-bold text-slate-900">${totalSpent.toLocaleString()}</div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-100/80 p-1 w-full justify-start rounded-lg mb-6 border border-slate-200/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Overview</TabsTrigger>
          <TabsTrigger value="creators" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Saved Creators ({savedCreators.length})</TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="lists" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Lists ({lists.length})</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-6">Calendar & Payments ({calendarSlots.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-emerald-500" />
                  Creators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{savedCreators.length}</div>
                <p className="text-sm text-slate-500 mt-1">Total saved creators</p>
              </CardContent>
            </Card>
            
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-500" />
                  Campaigns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{campaigns.length}</div>
                <p className="text-sm text-slate-500 mt-1">Total created campaigns</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <ListVideo className="h-4 w-4 text-amber-500" />
                  Lists
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{lists.length}</div>
                <p className="text-sm text-slate-500 mt-1">Custom creator lists</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  Calendar Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{calendarSlots.length}</div>
                <p className="text-sm text-slate-500 mt-1">Scheduled bookings</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="creators">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Saved Creators</CardTitle>
              <CardDescription className="text-slate-600">Directory of all creators bookmarked by this brand.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {savedCreators.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No saved creators yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-6 py-3 font-medium">Username</th>
                        <th className="px-6 py-3 font-medium">Name</th>
                        <th className="px-6 py-3 font-medium">Platform</th>
                        <th className="px-6 py-3 font-medium">Followers</th>
                        <th className="px-6 py-3 font-medium">Categories</th>
                        <th className="px-6 py-3 font-medium">Saved At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {savedCreators.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-4 font-medium text-slate-900">@{c.creator_username}</td>
                          <td className="px-6 py-4 text-slate-700">{c.creator_name || "-"}</td>
                          <td className="px-6 py-4 text-slate-700 capitalize">{c.platform || "-"}</td>
                          <td className="px-6 py-4 text-slate-700">
                            {c.followers ? new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(c.followers) : "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-700 max-w-[200px] truncate" title={c.categories?.join(", ")}>
                            {c.categories && c.categories.length > 0 ? c.categories.join(", ") : "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Campaigns</CardTitle>
              <CardDescription className="text-slate-600">All campaigns created by this brand and their parameters.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {campaigns.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No campaigns created yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-6 py-3 font-medium">Campaign Name</th>
                        <th className="px-6 py-3 font-medium">Details</th>
                        <th className="px-6 py-3 font-medium">Budget</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Timeline</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {campaigns.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-4 font-medium text-slate-900">{c.name || "Untitled Campaign"}</td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-700">Goal: <span className="font-medium text-slate-900">{c.goal || "-"}</span></div>
                            <div className="text-sm text-slate-700 mt-1">Product: <span className="font-medium text-slate-900">{c.product || "-"}</span></div>
                          </td>
                          <td className="px-6 py-4 text-slate-800 font-medium whitespace-nowrap">
                            ${parseFloat(String(c.total_budget) || "0").toLocaleString()} {c.currency || "USD"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={c.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {c.status || "Draft"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            <div className="whitespace-nowrap">
                              {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'TBD'} - 
                              {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'TBD'}
                            </div>
                            <div className="text-xs text-slate-500 font-mono mt-1">
                              Created: {new Date(c.created_at).toLocaleDateString()}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lists">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Creator Lists</CardTitle>
              <CardDescription className="text-slate-600">Custom folders/lists and their saved creators.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {lists.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No lists created.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-6 py-3 font-medium">List Name & Contents</th>
                        <th className="px-6 py-3 font-medium">Created At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lists.map((list: any) => (
                        <tr key={list.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{list.name}</div>
                            <div className="text-sm text-slate-600 mt-1 max-w-[600px] leading-relaxed">
                              <span className="font-medium text-slate-800">{list.members?.length || 0} creators</span>
                              {list.members?.length > 0 && <span>: {list.members.map((m: any) => `@${m.creator_username}`).join(', ')}</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                            {new Date(list.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle>Calendar Slots & Payments</CardTitle>
              <CardDescription className="text-slate-600">Log of all creator bookings, campaigns, and associated payments.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {calendarSlots.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No slots or payments found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-6 py-3 font-medium">Creator</th>
                        <th className="px-6 py-3 font-medium">Campaign / Notes</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Fee</th>
                        <th className="px-6 py-3 font-medium">Payment Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calendarSlots.map(slot => (
                        <tr key={slot.id} className="hover:bg-slate-50/80">
                          <td className="px-6 py-4">
                            <div className="font-medium text-slate-900">{slot.influencer_name ? `@${slot.influencer_name}` : (slot.title || "Untitled")}</div>
                            {slot.platform && <div className="text-xs text-slate-500 capitalize mt-1 border border-slate-200 px-1.5 py-0.5 rounded inline-block">{slot.platform}</div>}
                          </td>
                          <td className="px-6 py-4">
                            {slot.campaign && <div className="text-sm text-slate-800 mb-1">Campaign: <span className="font-medium">{slot.campaign}</span></div>}
                            {slot.notes && <div className="text-sm text-slate-600 leading-relaxed max-w-[250px]" title={slot.notes}>{slot.notes}</div>}
                            {!slot.campaign && !slot.notes && <span className="text-slate-400">-</span>}
                          </td>
                          <td className="px-6 py-4 text-slate-700 whitespace-nowrap">
                            {new Date(slot.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-slate-900 font-medium">
                            ${parseFloat(String(slot.fee) || "0").toLocaleString()} {slot.currency || "USD"}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={slot.payment_status === 'completed' ? 'default' : 'outline'} className={
                              slot.payment_status === 'completed' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-200' : ''
                            }>
                              {slot.payment_status || "Pending"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
