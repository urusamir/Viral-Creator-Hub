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
import AnalyticsPage from "@/pages/analytics";
import PaymentsPage from "@/pages/payments";
import CalendarPage from "@/pages/calendar";
import CampaignsPage from "@/pages/campaigns";
import CampaignWizardPage from "@/pages/campaign-wizard";
import NotFound from "@/pages/not-found";

function WithDashboardShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

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
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </DummyDataProvider>
  );
}

function DashboardRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <WithDashboardShell>
      <Component />
    </WithDashboardShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <Toaster />
            <Switch>
              <Route path="/" component={Landing} />
              <Route path="/coming-soon" component={ComingSoon} />
              <Route path="/auth" component={AuthPage} />
              <Route path="/dashboard">
                {() => <DashboardRoute component={DashboardPage} />}
              </Route>
              <Route path="/dashboard/discover">
                {() => <DashboardRoute component={DiscoverPage} />}
              </Route>
              <Route path="/dashboard/analytics">
                {() => <DashboardRoute component={AnalyticsPage} />}
              </Route>
              <Route path="/dashboard/payments">
                {() => <DashboardRoute component={PaymentsPage} />}
              </Route>
              <Route path="/dashboard/calendar">
                {() => <DashboardRoute component={CalendarPage} />}
              </Route>
              <Route path="/dashboard/campaigns">
                {() => <DashboardRoute component={CampaignsPage} />}
              </Route>
              <Route path="/dashboard/campaigns/new">
                {() => <DashboardRoute component={CampaignWizardPage} />}
              </Route>
              <Route path="/dashboard/campaigns/:id">
                {() => <DashboardRoute component={CampaignWizardPage} />}
              </Route>
              <Route component={NotFound} />
            </Switch>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
