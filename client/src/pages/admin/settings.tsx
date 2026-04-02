import { useState } from "react";
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
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

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

  const handleToggleAdmin = async () => {
    if (!foundUser) return;
    
    try {
      setIsUpdating(true);
      const newStatus = !foundUser.is_admin;
      
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: newStatus })
        .eq("id", foundUser.id);
        
      if (error) throw error;
      
      setFoundUser({ ...foundUser, is_admin: newStatus });
      
      toast({
        title: "Success",
        description: `User is ${newStatus ? 'now' : 'no longer'} an administrator.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Update Error",
        description: err.message || "Failed to update admin status.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-2">Manage platform configuration and administrative access.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 px-6 py-4 flex items-center gap-3">
          <Shield className="h-5 w-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-800">Admin Permissions</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-500 max-w-2xl">
            Grant or revoke administrative access to users by their email address. Admins have full access to view all brands, manage users, and view platform metrics.
          </p>
          
          <form onSubmit={handleSearchUser} className="flex gap-3 max-w-md">
            <div className="flex-1 space-y-2">
              <Label htmlFor="email" className="sr-only">User Email</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter user email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isSearching || !email}>
              {isSearching ? "Searching..." : "Find User"}
            </Button>
          </form>

          {foundUser && (
            <div className="mt-6 p-5 border border-slate-200 rounded-lg bg-slate-50 max-w-2xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-900">{foundUser.company_name || 'Unnamed User'}</h3>
                    <p className="text-sm text-slate-500">{foundUser.email}</p>
                    
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">Role:</span>
                      <span className="capitalize text-sm text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full">
                        {foundUser.role || 'Brand'}
                      </span>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-700">Admin Status:</span>
                      {foundUser.is_admin ? (
                        <span className="inline-flex items-center gap-1.5 text-sm text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Administrator
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                          <XCircle className="h-3.5 w-3.5" />
                          Regular User
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleToggleAdmin}
                  disabled={isUpdating}
                  variant={foundUser.is_admin ? "destructive" : "default"}
                  className={!foundUser.is_admin ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {isUpdating ? "Updating..." : foundUser.is_admin ? "Revoke Admin" : "Make Admin"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
