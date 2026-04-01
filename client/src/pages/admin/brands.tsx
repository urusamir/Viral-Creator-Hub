import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Search,
  Mail,
  Globe,
  MoreVertical,
  Activity
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminBrands() {
  const [brands, setBrands] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleToggleAdmin = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: !currentStatus })
        .eq("id", userId);
        
      if (error) throw error;
      
      setBrands(prev => 
        prev.map(b => b.id === userId ? { ...b, is_admin: !currentStatus } : b)
      );
      
      toast({
        title: "Success",
        description: `User admin status updated to ${!currentStatus}.`,
      });
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error",
        description: err.message || "Failed to update admin status.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    async function fetchBrands() {
      try {
        setIsLoading(true);
        setError(null);
        
        const { data, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .order("id", { ascending: false });
          
        if (profileErr) throw profileErr;
        setBrands(data || []);

      } catch (err: any) {
        console.error("Error fetching brands:", err);
        setError(err.message || "Failed to load brands.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchBrands();
  }, []);

  const filteredBrands = brands.filter(b => 
    (b.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Activity className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Brands Directory</h1>
          <p className="text-slate-500 mt-2">Manage all registered brands on the platform.</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="uppercase tracking-wider border-b border-slate-200 bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-slate-500 font-medium">Company / Email</th>
                <th scope="col" className="px-6 py-4 text-slate-500 font-medium">Platform Role</th>
                <th scope="col" className="px-6 py-4 text-slate-500 font-medium hidden sm:table-cell">Details</th>
                <th scope="col" className="px-6 py-4 text-slate-500 font-medium hidden sm:table-cell">ID</th>
                <th scope="col" className="px-6 py-4 text-slate-500 font-medium text-right">Actions</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No brands match your search.
                  </td>
                </tr>
              ) : (
                filteredBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {brand.company_name || "Unnamed Brand"}
                            {brand.is_admin && (
                              <span className="ml-2 inline-flex items-center rounded-sm bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {brand.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 capitalize">
                      {brand.role || "brand"}
                    </td>
                    <td className="px-6 py-4 text-slate-700 hidden sm:table-cell">
                      {brand.website && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Globe className="h-3 w-3 text-slate-400" />
                          <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline">
                            {brand.website}
                          </a>
                        </div>
                      )}
                      {!brand.website && <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs hidden sm:table-cell">
                      {brand.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-md hover:bg-slate-200 text-slate-400 transition-colors">
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleAdmin(brand.id, !!brand.is_admin)}>
                            {brand.is_admin ? "Remove Admin" : "Make Admin"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
