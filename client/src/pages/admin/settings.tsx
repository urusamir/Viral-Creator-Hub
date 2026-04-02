import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Search, User, CheckCircle2, XCircle } from "lucide-react";

export default function AdminSettings() {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundUser, setFoundUser] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["admin-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("is_admin", { ascending: false })
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setIsSearching(true);
      setFoundUser(null);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.trim().toLowerCase())
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          toast({
            title: "User not found",
            description: "No user found with the provided email address.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }
      
      setFoundUser(data);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Search Error",
        description: err.message || "Failed to search for user.",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleAdmin = async (user: any) => {
    try {
      setUpdatingId(user.id);
      const newStatus = !user.is_admin;
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: newStatus })
        .eq("id", user.id);
        
      if (error) throw error;
      
      if (foundUser?.id === user.id) {
        setFoundUser({ ...foundUser, is_admin: newStatus });
      }
      
      queryClient.invalidateQueries({ queryKey: ["admin-users-list"] });
      
      toast({
        title: "Success",
        description: `${user.email} is ${newStatus ? 'now' : 'no longer'} an administrator.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Update Error",
        description: err.message || "Failed to update admin status.",
        variant: "destructive"
      });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-2">Manage platform configuration and administrative access.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-800">Admin Permissions</h2>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Quick Search */}
          <div>
            <p className="text-sm text-slate-500 max-w-2xl mb-4">
              Grant or revoke administrative access to specific users by their email address, or select from the directory below.
            </p>
            
            <form onSubmit={handleSearchUser} className="flex gap-3 max-w-md">
              <div className="flex-1 space-y-2">
                <Label htmlFor="email" className="sr-only">User Email</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="Search specific user by email..." 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={isSearching || !email}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </form>

            {foundUser && (
              <div className="mt-4 p-5 border border-blue-200 rounded-lg bg-blue-50/50 max-w-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-900">{foundUser.company_name || 'Unnamed User'}</h3>
                      <p className="text-sm text-slate-500">{foundUser.email}</p>
                      
                      <div className="mt-2 flex items-center gap-2">
                        {foundUser.is_admin ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">
                            <CheckCircle2 className="h-3 w-3" />
                            Administrator
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-sm border border-slate-200">
                            <XCircle className="h-3 w-3" />
                            User
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleToggleAdmin(foundUser)}
                    disabled={updatingId === foundUser.id}
                    variant={foundUser.is_admin ? "destructive" : "default"}
                    className={!foundUser.is_admin ? "bg-blue-600 hover:bg-blue-700" : ""}
                    size="sm"
                  >
                    {updatingId === foundUser.id ? "Updating..." : foundUser.is_admin ? "Revoke Access" : "Make Admin"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <hr className="border-slate-100" />

          {/* Directory List */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-4">All Users Directory</h3>
            
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="uppercase tracking-wider border-b border-slate-200 bg-slate-50 text-xs">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-slate-500 font-medium">User</th>
                      <th scope="col" className="px-6 py-3 text-slate-500 font-medium">Role / Status</th>
                      <th scope="col" className="px-6 py-3 text-slate-500 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {isLoadingUsers ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-400">
                          <div className="w-5 h-5 border-2 border-slate-300 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                          Loading directory...
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                          No users found.
                        </td>
                      </tr>
                    ) : (
                      users.map((user: any) => (
                        <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3">
                            <div>
                              <div className="font-medium text-slate-900">{user.company_name || "Unnamed User"}</div>
                              <div className="text-slate-500">{user.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-3">
                            <div className="flex flex-col items-start gap-1">
                              <span className="capitalize text-xs text-slate-500">
                                {user.role || 'brand'}
                              </span>
                              {user.is_admin && (
                                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded border border-green-200">
                                  <CheckCircle2 className="h-3 w-3" /> Admin
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-3 text-right">
                            <Button
                              variant={user.is_admin ? "outline" : "ghost"}
                              size="sm"
                              className={
                                user.is_admin 
                                ? "text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" 
                                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              }
                              onClick={() => handleToggleAdmin(user)}
                              disabled={updatingId === user.id}
                            >
                              {updatingId === user.id ? "..." : user.is_admin ? "Revoke" : "Make Admin"}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
