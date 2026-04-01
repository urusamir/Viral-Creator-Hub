import { useEffect } from "react";
import { Link, Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import AdminDashboard from "./dashboard";
import AdminBrands from "./brands";
import { ArrowLeft, LayoutDashboard, Users } from "lucide-react";

export default function AdminLayout() {
  const { user, profile, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    // Redirect to auth if not logged in
    if (!user) {
      setLocation("/auth");
      return;
    }

    // Redirect to user dashboard if not an admin
    if (profile && !profile.is_admin) {
      setLocation("/dashboard");
      return;
    }

    // Auto-redirect /admin to /admin/dashboard
    if (location === "/admin" || location === "/admin/") {
      setLocation("/admin/dashboard");
    }
  }, [user, profile, isLoading, location, setLocation]);

  // Loading state
  if (isLoading || !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Admin Top Navigation */}
      <header className="bg-slate-900 text-white border-b border-slate-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-md">
                  <LayoutDashboard className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">Admin Portal</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/admin/dashboard">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === "/admin/dashboard" 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}>
                    Overview
                  </a>
                </Link>
                <Link href="/admin/brands">
                  <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location === "/admin/brands" 
                      ? "bg-slate-800 text-white" 
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Brands Directory
                    </div>
                  </a>
                </Link>
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {profile.email}
              </span>
              <div className="h-6 w-px bg-slate-700"></div>
              <Link href="/dashboard">
                <a className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  Exit Admin
                </a>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Admin Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/admin/dashboard" component={AdminDashboard} />
          <Route path="/admin/brands" component={AdminBrands} />
          {/* Fallback catches /admin and renders dashboard until useEffect kicks in */}
          <Route component={AdminDashboard} />
        </Switch>
      </main>
    </div>
  );
}
