import { useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, LogOut, Settings } from "lucide-react";
import { VairalLogo } from "@/components/vairal-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Overview", url: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Brands Directory", url: "/admin/brands", icon: Users },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    setLocation(url);
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/admin-login");
  };

  return (
    <Sidebar className="bg-white border-r">
      <SidebarHeader className="p-6 pb-4">
        <a
          href="/admin/dashboard"
          onClick={(e) => handleNav(e, "/admin/dashboard")}
          className="flex items-center gap-3"
        >
          <VairalLogo className="h-6 w-auto" />
          <span className="font-bold text-xl tracking-tight text-gray-900">Kavak</span>
        </a>
      </SidebarHeader>

      <SidebarContent className="px-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 mt-4">
              {menuItems.map((item) => {
                const isActive = location === item.url || location.startsWith(item.url + "/");
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        onClick={(e) => handleNav(e, item.url)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-6 rounded-xl font-medium transition-colors text-[15px]",
                          isActive 
                            ? "bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:text-white" 
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        )}
                      >
                        <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-500")} />
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

      <SidebarFooter className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-2 py-3">
          <Avatar className="h-10 w-10 bg-blue-50">
            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
              {user?.email?.slice(0, 2).toUpperCase() || "JD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email?.split('@')[0] || "Jane Doe"}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">Admin Member</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          onClick={handleLogout} 
          className="w-full justify-start text-gray-600 hover:text-gray-900 hover:bg-gray-100 mt-2 px-4"
        >
          <LogOut className="w-5 h-5 mr-3 text-gray-400" />
          <span className="font-medium">Sign Out</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
