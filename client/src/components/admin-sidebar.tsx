import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, LogOut, Settings } from "lucide-react";
import { VairalLogo } from "@/components/vairal-logo";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Users", url: "/admin/brands", icon: Users },
  { title: "Accounts", url: "/admin/accounts", icon: Users }, // Placeholder to match reference visual
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { logout } = useAuth();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    setLocation(url);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/admin-login");
  };

  return (
    <Sidebar className="border-r border-slate-800" variant="sidebar">
      <div className="flex flex-col h-full w-full bg-[#1c1f26]">
        <SidebarHeader className="p-6 pb-2 pt-8 pl-8">
          <a
            href="/admin/dashboard"
            onClick={(e) => handleNav(e, "/admin/dashboard")}
            className="flex items-center gap-3"
          >
            <VairalLogo className="h-6 w-auto text-white" />
            <span className="font-bold text-xl tracking-tight text-white drop-shadow-md">Viral</span>
          </a>
        </SidebarHeader>

        <SidebarContent className="px-6 mt-8">
          <SidebarGroup className="p-0 mb-8">
            <div className="px-2 mb-3 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
              MAIN MENU
            </div>
            <SidebarGroupContent>
              <div className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive = location === item.url || (item.url !== "/admin/accounts" && location.startsWith(item.url + "/"));
                  
                  return (
                    <a
                      key={item.title}
                      href={item.url}
                      onClick={(e) => handleNav(e, item.url)}
                      className={cn(
                        "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm",
                        isActive 
                          ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                      <span>{item.title}</span>
                    </a>
                  );
                })}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-6 mb-4 mt-auto">
          <div className="flex flex-col gap-1">
            <a
              href="/admin/settings"
              onClick={(e) => handleNav(e, "/admin/settings")}
              className={cn(
                "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm",
                location.startsWith("/admin/settings") 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
              )}
            >
              <Settings className="w-5 h-5" strokeWidth={2} />
              <span>Settings</span>
            </a>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-semibold transition-all text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white"
            >
              <LogOut className="w-5 h-5" strokeWidth={2} />
              <span>Log Out</span>
            </button>
          </div>
        </SidebarFooter>
      </div>
    </Sidebar>
  );
}
