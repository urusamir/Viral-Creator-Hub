import { useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import AdminDashboard from "./dashboard";
import AdminBrands from "./brands";
import AdminBrandDetails from "./brand-details";
import AdminSettings from "./settings";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout() {
  const { user, profile, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;
    
    // Security barrier -> Send lost admins to admin-login
    if (!user) {
      setLocation("/admin-login");
      return;
    }

    if (profile && !profile.is_admin) {
      setLocation("/dashboard");
      return;
    }

    if (location === "/admin" || location === "/admin/") {
      setLocation("/admin/dashboard");
    }
  }, [user, profile, isLoading, location, setLocation]);

  if (isLoading || !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full bg-background font-sans overflow-hidden">
        <AdminSidebar />
        
        <div className="flex-1 overflow-auto bg-gray-50 flex flex-col">
          <header className="border-b bg-card sticky top-0 z-10 flex h-16 items-center px-4 gap-4 px-6 md:hidden">
            <SidebarTrigger />
            <h1 className="font-semibold px-2">Admin Portal</h1>
          </header>

          <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            <Switch>
              <Route path="/admin/dashboard" component={AdminDashboard} />
              <Route path="/admin/brands" component={AdminBrands} />
              <Route path="/admin/brands/:id" component={AdminBrandDetails} />
              <Route path="/admin/settings" component={AdminSettings} />
              <Route component={AdminDashboard} />
            </Switch>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
