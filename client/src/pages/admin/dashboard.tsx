import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Users, 
  CalendarDays, 
  CreditCard,
  Activity,
  ArrowRight,
  TrendingUp,
  CheckCircle2
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

interface AdminStats {
  totalBrands: number;
  totalCampaigns: number;
  totalSavedCreators: number;
  totalCalendarEvents: number;
  totalPayments: number;
  recentBrands: any[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  
  const { data: stats = {
    totalBrands: 0,
    totalCampaigns: 0,
    totalSavedCreators: 0,
    totalCalendarEvents: 0,
    totalPayments: 0,
    recentBrands: []
  }, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      // Fetch total profiles (Brands)
      const { count: brandCount, data: recentBrands, error: profileErr } = await supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .order("id", { ascending: false })
        .limit(5);
      if (profileErr) throw profileErr;

      // Fetch campaigns
      const { count: campaignCount, error: campErr } = await supabase
        .from("campaigns")
        .select("*", { count: "exact" });
      if (campErr) throw campErr;

      // Fetch saved creators
      const { count: savedCount, error: savedErr } = await supabase
        .from("saved_creators")
        .select("*", { count: "exact" });
      if (savedErr) throw savedErr;

      // Fetch calendar slots
      const { data: calendarData, error: calErr } = await supabase
        .from("calendar_slots")
        .select("*");
      if (calErr) throw calErr;
      
      const totalPayments = calendarData?.filter((s: any) => s.has_payment).length || 0;

      return {
        totalBrands: brandCount || 0,
        totalCampaigns: campaignCount || 0,
        totalSavedCreators: savedCount || 0,
        totalCalendarEvents: calendarData?.length || 0,
        totalPayments: totalPayments,
        recentBrands: recentBrands || []
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <Activity className="h-4 w-4" />
        <AlertTitle>Error Loading Dashboard</AlertTitle>
        <AlertDescription>{error?.message || "An error occurred"}</AlertDescription>
      </Alert>
    );
  }

  const firstName = user?.email?.split('@')[0] || "Admin";

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Overview</h1>
        <p className="text-blue-600 font-medium bg-blue-50/80 inline-block px-3 py-1 rounded-md mt-3">
          Welcome back, {firstName}
        </p>
      </div>

      {/* Main Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Huge Hero Card - Left */}
        <div className="lg:col-span-2 bg-[#1A2542] rounded-[24px] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl">
          {/* subtle glow effect in bg */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="relative z-10">
            <p className="text-blue-200/80 text-[13px] font-bold tracking-widest uppercase mb-4">Total Platform Brands</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-[72px] leading-none font-bold tracking-tighter">{stats.totalBrands}</h2>
              <span className="text-xl text-blue-200 font-medium">brands</span>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-end mt-12">
            <Button className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 rounded-xl px-6 py-6 font-semibold transition-all">
              <Users className="w-4 h-4 mr-2" />
              Manage Directory
            </Button>
          </div>
        </div>

        {/* Small Stacked Cards - Right */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-blue-50/50 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-bold text-gray-900 text-lg">System Health</h3>
              <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Stable</span>
            </div>
            <div>
               <div className="flex justify-between text-sm mb-2 text-gray-600 font-medium">
                 <span>Active Campaigns</span>
                 <span className="font-bold text-gray-900">{stats.totalCampaigns}</span>
               </div>
               <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-blue-50/50 flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900 text-lg">Payments</h3>
              <CreditCard className="text-blue-600 w-5 h-5" />
            </div>
            <div className="mt-1">
              <h4 className="text-4xl font-bold tracking-tight text-gray-900">{stats.totalPayments}</h4>
              <p className="text-sm font-medium text-gray-500 mt-2">Recorded transactions</p>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity & Highlights */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Key Metrics</h2>
            <Button variant="ghost" className="text-blue-600 font-semibold hover:text-blue-800 hover:bg-blue-50">
              View Analytics <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Cards container mimicking the Next Unlockable reward style */}
          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="text-xs font-bold text-blue-600 tracking-wider uppercase mb-1">Creator Hub</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{stats.totalSavedCreators} Creators Saved</h3>
                <p className="text-sm text-gray-500 font-medium">Total number of creators saved by brands across the platform.</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-gray-100">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
               <div className="flex items-center gap-4 text-center sm:text-left">
                  <CalendarDays className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Total Calendar Events</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">Sum of all scheduled slots</p>
                  </div>
               </div>
               <div className="px-6 py-3 bg-gray-50 rounded-xl font-bold text-gray-900 text-xl border border-gray-100">
                 {stats.totalCalendarEvents}
               </div>
             </div>
          </div>
        </div>

        {/* Recent Brands - Right vertical column */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          <div className="space-y-6">
            {stats.recentBrands.length === 0 ? (
              <div className="text-center text-gray-500 py-4 text-sm font-medium">
                No recent activity.
              </div>
            ) : (
              stats.recentBrands.map((brand: any, idx: number) => (
                <div key={brand.id} className="flex gap-4 relative">
                  {/* Subtle line connecting items */}
                  {idx !== stats.recentBrands.length - 1 && (
                     <div className="absolute left-3 top-8 bottom-[-24px] w-0.5 bg-gray-100"></div>
                  )}
                  
                  <div className="relative z-10 flex-shrink-0 mt-0.5">
                    <div className="w-6 h-6 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-900">
                        {brand.company_name || "New Brand Joined"}
                      </h4>
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded ml-2 whitespace-nowrap">
                        Joined
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium mt-1 pr-4 truncate">
                      {brand.email}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium mt-1">
                      ID: {brand.id.substring(0, 8)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-4 border-t border-gray-100">
            <Button variant="ghost" className="w-full text-gray-600 font-semibold hover:bg-gray-50 hover:text-gray-900">
              View All Activity
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
