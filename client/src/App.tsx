import { useState, useEffect } from "react";
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
import ListsPage from "@/pages/lists";
import ListDetailPage from "@/pages/list-detail";
import NotFound from "@/pages/not-found";
import AdminLayout from "@/pages/admin/layout";
import AdminAuthPage from "@/pages/admin-auth";

type PageKey = "dashboard" | "discover" | "payments" | "calendar" | "campaigns" | "wizard" | "lists" | "listDetail";

function getPageKey(loc: string): PageKey {
  if (loc === "/dashboard") return "dashboard";
  if (loc.startsWith("/dashboard/discover")) return "discover";
  if (loc.startsWith("/dashboard/payments")) return "payments";
  if (loc.startsWith("/dashboard/calendar")) return "calendar";
  if (
    loc === "/dashboard/campaigns/new" ||
    (loc.startsWith("/dashboard/campaigns/") && loc !== "/dashboard/campaigns/")
  ) return "wizard";
  if (loc.startsWith("/dashboard/campaigns")) return "campaigns";
  if (loc.startsWith("/dashboard/lists/")) return "listDetail";
  if (loc.startsWith("/dashboard/lists")) return "lists";
  return "dashboard";
}

/**
 * DashboardLayout:
 *
 * Performance strategy: "Mount on first visit, keep mounted forever."
 *
 * - On initial load, ONLY the current page is rendered → fast first paint.
 * - When the user navigates to a new page for the first time, it gets
 *   added to `mounted` and rendered.
 * - On RETURN visits the page is already mounted and just toggled with
 *   CSS `hidden` → zero delay, zero remount, zero re-fetch.
 *
 * This is the best of both worlds: fast initial load + instant tab switching.
 */
function DashboardLayout() {
  const { user, profile, isLoading } = useAuth();
  const [location] = useLocation();

  const currentKey = getPageKey(location);

  // Seed with the page the user actually landed on — nothing else.
  const [mounted, setMounted] = useState<Set<PageKey>>(() => new Set([currentKey]));

  // When location changes, lazily add the new page to the mounted set.
  // Once added it never leaves — making all future visits instant.
  useEffect(() => {
    setMounted((prev) => {
      if (prev.has(currentKey)) return prev; // already mounted, skip re-render
      const next = new Set(prev);
      next.add(currentKey);
      return next;
    });
  }, [currentKey]);

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

  // Returns "" (visible) when this page is current, "hidden" otherwise.
  const cls = (key: PageKey) => (currentKey === key ? "" : "hidden");

  return (
    <DummyDataProvider>
      <SidebarProvider style={style as React.CSSProperties}>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex flex-col flex-1 overflow-hidden">
            <header className="flex items-center gap-2 p-3 border-b border-border sm:hidden">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
            </header>
            <main className="flex-1 overflow-y-auto">

              {/* Each page only mounts the first time it is visited.
                  After that it stays mounted and is shown/hidden instantly. */}

              {mounted.has("dashboard") && (
                <div className={cls("dashboard")}>
                  <DashboardPage />
                </div>
              )}

              {mounted.has("discover") && (
                <div className={cls("discover")}>
                  <DiscoverPage />
                </div>
              )}

              {mounted.has("payments") && (
                <div className={cls("payments")}>
                  <PaymentsPage />
                </div>
              )}

              {mounted.has("calendar") && (
                <div className={cls("calendar")}>
                  <CalendarPage />
                </div>
              )}

              {mounted.has("campaigns") && (
                <div className={cls("campaigns")}>
                  <CampaignsPage />
                </div>
              )}

              {mounted.has("wizard") && (
                <div className={cls("wizard")}>
                  <CampaignWizardPage />
                </div>
              )}

              {mounted.has("lists") && (
                <div className={cls("lists")}>
                  <ListsPage />
                </div>
              )}

              {mounted.has("listDetail") && (
                <div className={cls("listDetail")}>
                  <ListDetailPage listId={location.replace("/dashboard/lists/", "")} />
                </div>
              )}

            </main>
          </div>
        </div>
      </SidebarProvider>
    </DummyDataProvider>
  );
}

/**
 * AppRoutes: DashboardLayout is a single stable element for all /dashboard/* paths.
 * It never remounts when navigating between sub-pages.
 */
function AppRoutes() {
  const [location] = useLocation();

  if (location.startsWith("/dashboard")) {
    return <DashboardLayout />;
  }

  // Must check /admin-login BEFORE /admin — otherwise it gets caught by AdminLayout
  if (location === "/admin-login") {
    return <AdminAuthPage />;
  }

  if (location.startsWith("/admin")) {
    return <AdminLayout />;
  }

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/coming-soon" component={ComingSoon} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin-login" component={AdminAuthPage} />
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
