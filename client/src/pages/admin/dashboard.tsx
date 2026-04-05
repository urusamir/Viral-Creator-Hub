import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { fetchAdminDashboardStats } from "@/lib/api/admin";
import { 
  Building2, 
  Users, 
  CalendarDays, 
  CreditCard,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface AdminStats {
  totalBrands: number;
  totalCampaigns: number;
  totalSavedCreators: number;
  totalCalendarEvents: number;
  totalPayments: number;
  pendingPayments: number;
  recentBrands: any[];
}

export default function AdminDashboard() {
  const { data: stats = {
    totalBrands: 0,
    totalCampaigns: 0,
    totalSavedCreators: 0,
    totalCalendarEvents: 0,
    totalPayments: 0,
    pendingPayments: 0,
    recentBrands: []
  }, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: fetchAdminDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  // No full-page spinner — render the page structure immediately.
  // Stats use default values (0) while loading, which is visually clean.

  if (error) {
    return (
      <Alert variant="destructive">
        <Activity className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error?.message || "An error occurred"}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Get a high-level view of your platform's activity.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Building2 className="h-5 w-5 text-blue-600" />}
          title="Total Brands"
          value={stats.totalBrands.toString()}
          trend="+12% from last month"
          trendUp={true}
        />
        <StatCard 
          icon={<CalendarDays className="h-5 w-5 text-emerald-600" />}
          title="Active Campaigns"
          value={stats.totalCampaigns.toString()}
          trend="In progress"
        />
        <StatCard 
          icon={<CreditCard className="h-5 w-5 text-emerald-600" />}
          title="Completed Payments"
          value={stats.totalPayments.toString()}
          trend="Successfully processed"
        />
        <StatCard 
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          title="Pending Payments"
          value={stats.pendingPayments.toString()}
          trend="Awaiting clearance"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800">Recently Registered Brands</h2>
          <Link href="/admin/brands">
            <a className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
              View all
            </a>
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {stats.recentBrands.length === 0 ? (
            <div className="px-6 py-8 text-center text-slate-500">
              No recent brands found.
            </div>
          ) : (
            stats.recentBrands.map((brand: any) => (
              <div key={brand.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <h3 className="text-sm font-medium text-slate-900">
                    {brand.company_name || brand.email || "Unnamed Brand"}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {brand.email} {brand.website && `• ${brand.website}`}
                  </p>
                </div>
                <div className="text-sm text-slate-400">
                  {/* We don't have created_at in profile, so just showing id portion or static text */}
                  ID: {brand.id.substring(0, 8)}...
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, trend, trendUp }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
      </div>
      {(trend || trendUp !== undefined) && (
        <div className={`mt-4 flex items-center gap-1.5 text-sm ${trendUp ? "text-emerald-600" : "text-slate-500"}`}>
          {trendUp !== undefined && (
            <TrendingUp className="h-4 w-4" />
          )}
          {trend}
        </div>
      )}
    </div>
  );
}
