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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

        const listMembers = listMembersRes.data || [];
        const listsData = (listsRes.data || []).map((list: any) => ({
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
          <Button variant="outline" className="mt-4 border-slate-300 text-slate-700">Return to Directory</Button>
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
          <TabsTrigger value="overview" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 px-6">Overview</TabsTrigger>
          <TabsTrigger value="creators" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 px-6">Saved Creators ({savedCreators.length})</TabsTrigger>
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 px-6">Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="lists" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 px-6">Lists ({lists.length})</TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 px-6">Calendar & Payments ({calendarSlots.length})</TabsTrigger>
        </TabsList>

        {/* ── OVERVIEW TAB ── */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Bookmark className="h-4 w-4 text-emerald-500" />
                Creators
              </div>
              <div className="text-3xl font-bold text-slate-900">{savedCreators.length}</div>
              <p className="text-sm text-slate-500 mt-1">Total saved creators</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Target className="h-4 w-4 text-blue-500" />
                Campaigns
              </div>
              <div className="text-3xl font-bold text-slate-900">{campaigns.length}</div>
              <p className="text-sm text-slate-500 mt-1">Total created campaigns</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <ListVideo className="h-4 w-4 text-amber-500" />
                Lists
              </div>
              <div className="text-3xl font-bold text-slate-900">{lists.length}</div>
              <p className="text-sm text-slate-500 mt-1">Custom creator lists</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <div className="text-sm font-medium text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-purple-500" />
                Calendar Slots
              </div>
              <div className="text-3xl font-bold text-slate-900">{calendarSlots.length}</div>
              <p className="text-sm text-slate-500 mt-1">Scheduled bookings</p>
            </div>
          </div>
        </TabsContent>

        {/* ── SAVED CREATORS TAB ── */}
        <TabsContent value="creators">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Saved Creators</h2>
              <p className="text-sm text-slate-500 mt-1">Directory of all creators bookmarked by this brand.</p>
            </div>
            <div>
              {savedCreators.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No saved creators yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-medium text-slate-600">Username</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Name</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Platform</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Followers</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Engagement</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Categories</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Saved At</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Actions</th>
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
                          <td className="px-6 py-4 text-slate-700">
                            {c.engagement_rate ? `${c.engagement_rate}%` : "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-700 max-w-[200px] truncate" title={c.categories?.join(", ")}>
                            {c.categories && c.categories.length > 0 ? c.categories.join(", ") : "-"}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                            {new Date(c.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            {c.notes ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">View Notes</Button>
                                </DialogTrigger>
                                <DialogContent className="bg-white border-slate-200 shadow-xl">
                                  <DialogHeader>
                                    <DialogTitle className="text-slate-900">Notes on @{c.creator_username}</DialogTitle>
                                    <DialogDescription className="text-slate-500">Saved notes for this creator</DialogDescription>
                                  </DialogHeader>
                                  <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                                    {c.notes}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            ) : (
                              <span className="text-slate-400 text-sm ml-3">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── CAMPAIGNS TAB ── */}
        <TabsContent value="campaigns">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Campaigns</h2>
              <p className="text-sm text-slate-500 mt-1">All campaigns created by this brand and their parameters.</p>
            </div>
            <div>
              {campaigns.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No campaigns created yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-medium text-slate-600">Campaign Name</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Details</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Budget</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Status</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Timeline</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Actions</th>
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
                          <td className="px-6 py-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="whitespace-nowrap bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900">View Details</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-white border-slate-200 shadow-xl">
                                <DialogHeader className="border-b border-slate-100 pb-4">
                                  <DialogTitle className="text-xl text-slate-900">{c.name || "Untitled Campaign"}</DialogTitle>
                                  <DialogDescription className="text-slate-500">Full campaign specification and details</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 mt-4">
                                  {/* Top Highlights Grid */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Goal</h4>
                                      <p className="text-slate-900 font-medium">{c.goal || "-"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Product</h4>
                                      <p className="text-slate-900 font-medium">{c.product || "-"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Platforms</h4>
                                      <p className="text-slate-900 font-medium">{c.platforms?.join(", ") || "-"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Countries</h4>
                                      <p className="text-slate-900 font-medium">{c.countries?.join(", ") || "-"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Budget</h4>
                                      <p className="text-emerald-700 font-bold">${parseFloat(String(c.total_budget) || "0").toLocaleString()} {c.currency || "USD"}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Timeline</h4>
                                      <p className="text-slate-900 font-medium">{c.start_date || "-"} to {c.end_date || "-"}</p>
                                    </div>
                                  </div>

                                  {/* Detailed Content */}
                                  <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm">Audience & Reach</h4>
                                        <div className="flex gap-2 flex-wrap">
                                          {c.audience_age_ranges?.length ? c.audience_age_ranges.map((a: string) => <Badge variant="secondary" key={a} className="bg-blue-50 text-blue-700 border border-blue-100">{a}</Badge>) : <span className="text-slate-400 italic text-sm">Not specified</span>}
                                        </div>
                                      </div>

                                      <div>
                                        <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm">Key Messages</h4>
                                        {c.key_messages?.length ? (
                                          <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
                                            {c.key_messages.map((msg: string, idx: number) => <li key={idx}>{msg}</li>)}
                                          </ul>
                                        ) : <span className="text-slate-400 italic text-sm">None provided</span>}
                                      </div>

                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <h4 className="font-semibold text-emerald-700 mb-2 text-sm">Do's</h4>
                                          {c.dos?.length ? (
                                            <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
                                              {c.dos.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                                            </ul>
                                          ) : <span className="text-slate-400 italic text-sm">None</span>}
                                        </div>
                                        <div>
                                          <h4 className="font-semibold text-red-700 mb-2 text-sm">Don'ts</h4>
                                          {c.donts?.length ? (
                                            <ul className="list-disc pl-5 text-slate-700 space-y-1 text-sm">
                                              {c.donts.map((d: string, idx: number) => <li key={idx}>{d}</li>)}
                                            </ul>
                                          ) : <span className="text-slate-400 italic text-sm">None</span>}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-6">
                                      <div>
                                        <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm">Deliverables</h4>
                                        {c.deliverables?.length ? (
                                          <div className="space-y-3">
                                            {c.deliverables.map((d: any, idx: number) => (
                                              <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                <div className="flex justify-between items-start mb-1">
                                                  <span className="font-medium text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-sm">{d.quantity}x {d.contentType}</span>
                                                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full uppercase">{d.platform}</span>
                                                </div>
                                                {d.formatNotes && <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-2 rounded">{d.formatNotes}</p>}
                                              </div>
                                            ))}
                                          </div>
                                        ) : <span className="text-slate-400 italic text-sm">No deliverables defined</span>}
                                      </div>

                                      <div>
                                        <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm">Tags & Mentions</h4>
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <span className="font-medium text-slate-700 block mb-1.5">Hashtags:</span> 
                                            <div className="flex flex-wrap gap-1.5">
                                              {c.hashtags?.length ? c.hashtags.map((h: string) => <span key={h} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs border border-slate-200">{h}</span>) : <span className="text-slate-400 italic">None</span>}
                                            </div>
                                          </div>
                                          <div className="pt-1">
                                            <span className="font-medium text-slate-700 block mb-1.5">Mentions:</span> 
                                            <div className="flex flex-wrap gap-1.5">
                                              {c.mentions?.length ? c.mentions.map((m: string) => <span key={m} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs border border-blue-100">@{m.replace('@', '')}</span>) : <span className="text-slate-400 italic">None</span>}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Selected Creators */}
                                  <div>
                                    <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm">Selected Creators</h4>
                                    {c.selected_creators?.length ? (
                                      <div className="flex flex-wrap gap-2">
                                        {c.selected_creators.map((cr: string) => (
                                          <span key={cr} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium border border-slate-200">@{cr}</span>
                                        ))}
                                      </div>
                                    ) : <span className="text-slate-400 italic text-sm">No creators selected</span>}
                                  </div>

                                  {/* Reference Links */}
                                  {c.reference_links?.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm">Reference Links</h4>
                                      <ul className="space-y-1">
                                        {c.reference_links.map((link: string, idx: number) => (
                                          <li key={idx}>
                                            <a href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline text-sm truncate block max-w-full">{link}</a>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}

                                  {/* Meta Info */}
                                  <div className="border-t border-slate-100 pt-4 flex justify-between items-center text-xs text-slate-400">
                                    <span>Created: {new Date(c.created_at).toLocaleString()}</span>
                                    <span>Last Step: {c.last_step || "-"}</span>
                                    <span>ID: {c.id?.substring(0, 8)}...</span>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── LISTS TAB ── */}
        <TabsContent value="lists">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Creator Lists</h2>
              <p className="text-sm text-slate-500 mt-1">Custom folders/lists and their saved creators.</p>
            </div>
            <div>
              {lists.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No lists created.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-medium text-slate-600">List Name & Contents</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Created At</th>
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
            </div>
          </div>
        </TabsContent>

        {/* ── CALENDAR & PAYMENTS TAB ── */}
        <TabsContent value="payments">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-800">Calendar Slots & Payments</h2>
              <p className="text-sm text-slate-500 mt-1">Log of all creator bookings, campaigns, and associated payments.</p>
            </div>
            <div>
              {calendarSlots.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No slots or payments found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-3 font-medium text-slate-600">Creator</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Campaign / Notes</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Date</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Fee</th>
                        <th className="px-6 py-3 font-medium text-slate-600">Payment Status</th>
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
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
