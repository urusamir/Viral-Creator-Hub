import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Search, CreditCard, Calendar, Megaphone, LogOut, Sun, Moon, ListChecks, Activity, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { VairalLogo } from "@/components/vairal-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth.provider";
import { useTheme } from "@/providers/theme.provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, hidden: true /* hidden for now — re-enable by setting to false */ },
  { title: "Discover", url: "/dashboard/discover", icon: Search },
  { title: "Payments", url: "/dashboard/payments", icon: CreditCard },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Campaigns", url: "/dashboard/campaigns", icon: Megaphone },
  { title: "Lists", url: "/dashboard/lists", icon: ListChecks },
];

const manageItems = [
  { title: "Execution Life Cycle", url: "/dashboard/board", icon: ListChecks },
  { title: "Tracking", url: "/dashboard/tracking", icon: Activity },
];

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { state, toggleSidebar } = useSidebar();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    setLocation(url);
    if (state === "expanded" || window.innerWidth < 1024) toggleSidebar();
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 flex flex-row items-center justify-between">
        {state !== "collapsed" && (
          <a
            href="/dashboard"
            onClick={(e) => handleNav(e, "/dashboard")}
            className="flex items-center gap-1"
            data-testid="link-sidebar-logo"
          >
            <VairalLogo className="h-24" />
          </a>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="text-muted-foreground ml-auto hover:bg-white/10"
          title="Toggle Sidebar"
        >
          {state === "expanded" ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => !item.hidden).map((item) => {
                const isActive = location === item.url || (item.url !== "/dashboard" && location.startsWith(item.url));
                const isDashboardActive = item.url === "/dashboard" && location === "/dashboard";
                const active = isDashboardActive || isActive;

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={active}>
                      <a
                        href={item.url}
                        onClick={(e) => handleNav(e, item.url)}
                        data-testid={`link-sidebar-${item.title.toLowerCase()}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="mt-4">Manage</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {manageItems.map((item) => {
                const isActive = location.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-active={isActive}>
                      <a
                        href={item.url}
                        onClick={(e) => handleNav(e, item.url)}
                        data-testid={`link-manage-${item.title.toLowerCase().replace(/ /g, '-')}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-blue-600 text-white text-sm">
              {user?.email?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground">{profile?.company_name || "Brand"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle-sidebar" className="text-muted-foreground">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} data-testid="button-logout" className="text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
