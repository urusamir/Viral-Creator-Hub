import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider, useAuth } from "@/lib/auth";
import { DummyDataProvider } from "@/lib/dummy-data";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Landing from "@/pages/landing";
import ComingSoon from "@/pages/coming-soon";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import DiscoverPage from "@/pages/discover";
import PaymentsPage from "@/pages/payments";
import CalendarPage from "@/pages/calendar";
import CampaignsPage from "@/pages/campaigns";
import CampaignWizardPage from "@/pages/campaign-wizard";
import NotFound from "@/pages/not-found";

/**
 * DashboardLayout:
 * Shell (sidebar + header) mounts ONCE and never remounts.
 * All page components are mounted simultaneously and toggled with CSS `hidden`.
 * Navigation = a CSS class change → zero delay, zero remount, zero flicker.
 */
function DashboardLayout() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  // Campaign wizard: /campaigns/new or /campaigns/:id (but not bare /campaigns)
  const isCampaignWizard =
    location === "/dashboard/campaigns/new" ||
    (location.startsWith("/dashboard/campaigns/") &&
      location !== "/dashboard/campaigns/");

  return (
    <DummyDataProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center gap-2 p-3 border-b border-border sm:hidden">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
            {/*
              All pages are pre-mounted. Switching tabs only toggles `hidden`.
              No unmounting, no re-fetching, no flicker — guaranteed instantaneous.
            */}
            <main className="flex-1 overflow-y-auto">
              <div className={location === "/dashboard" ? "" : "hidden"}>
                <DashboardPage />
              </div>
              <div className={location.startsWith("/dashboard/discover") ? "" : "hidden"}>
                <DiscoverPage />
              </div>
              <div className={location.startsWith("/dashboard/payments") ? "" : "hidden"}>
                <PaymentsPage />
              </div>
              <div className={location.startsWith("/dashboard/calendar") ? "" : "hidden"}>
                <CalendarPage />
              </div>
              <div
                className={
                  location.startsWith("/dashboard/campaigns") && !isCampaignWizard
                    ? ""
                    : "hidden"
                }
              >
                <CampaignsPage />
              </div>
              <div className={isCampaignWizard ? "" : "hidden"}>
                <CampaignWizardPage />
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DummyDataProvider>
  );
}

/**
 * AppRoutes: decides whether to render the dashboard shell or public pages.
 * DashboardLayout is rendered as a SINGLE stable element for ALL /dashboard/* paths.
 * It never remounts on sub-page navigation because it's outside the Switch.
 */
function AppRoutes() {
  const [location] = useLocation();

  // Any path starting with /dashboard → render the persistent shell
  if (location.startsWith("/dashboard")) {
    return <DashboardLayout />;
  }

  // All non-dashboard routes use the Switch normally
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <AppRoutes />
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
