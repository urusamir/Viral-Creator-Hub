import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { 
  Building2, 
  Search,
  Mail,
  Globe,
  Activity,
  ArrowRight
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function AdminBrands() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("id", { ascending: false });
        
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const filteredBrands = brands.filter((b: any) => 
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
        <AlertDescription>{error?.message || "An unknown error occurred"}</AlertDescription>
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
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-11 bg-white"
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
                filteredBrands.map((brand: any) => (
                  <tr 
                    key={brand.id} 
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => setLocation(`/admin/brands/${brand.id}`)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-colors">
                          <Building2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 text-base">
                            {brand.company_name || "Unnamed Brand"}
                            {brand.is_admin && (
                              <span className="ml-2 inline-flex items-center rounded-sm bg-purple-100 px-1.5 py-0.5 text-xs font-semibold text-purple-800">
                                Admin
                              </span>
                            )}
                          </div>
                          <div className="text-slate-500 flex items-center gap-1.5 mt-1">
                            <Mail className="h-3.5 w-3.5" />
                            {brand.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-700 font-medium capitalize">
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
                        {brand.role || "brand"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-700 hidden sm:table-cell">
                      {brand.website && (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <a href={brand.website.startsWith('http') ? brand.website : `https://${brand.website}`} target="_blank" rel="noreferrer" className="hover:text-blue-600 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>
                            {brand.website}
                          </a>
                        </div>
                      )}
                      {!brand.website && <span className="text-slate-400">-</span>}
                    </td>
                    <td className="px-6 py-5 text-slate-400 font-mono text-sm hidden sm:table-cell">
                      {brand.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md transition-all rounded-lg font-medium px-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-[-2px]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/admin/brands/${brand.id}`);
                        }}
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
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
  );
}
