import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { fetchAdminBrands } from "@/lib/api/admin";
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { toast } = useToast();

  const { data: brands = [], isLoading, error } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: fetchAdminBrands,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const filteredBrands = brands.filter((b: any) => 
    (b.company_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredBrands.length / itemsPerPage);
  const currentBrands = filteredBrands.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 on search
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  // No full-page spinner — render the page structure immediately.
  // While loading, the table will show "Loading brands..." which is better than a blank spinner.

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
            className="pl-10 h-11 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
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
              {currentBrands.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    {isLoading ? "Loading brands..." : "No brands match your search."}
                  </td>
                </tr>
              ) : (
                currentBrands.map((brand: any) => (
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
                        className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-sm hover:shadow-md hover:shadow-blue-500/25 transition-all rounded-full font-medium px-5 py-2 group-hover:-translate-y-0.5 border border-indigo-500/20"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/admin/brands/${brand.id}`);
                        }}
                      >
                        <span className="relative z-10 flex items-center gap-1.5">
                          View Details
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
            <div className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, filteredBrands.length)}</span> of <span className="font-medium text-slate-900">{filteredBrands.length}</span> brands
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="bg-white"
              >
                Previous
              </Button>
              <div className="flex items-center max-sm:hidden gap-1 px-2 text-sm text-slate-600">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="bg-white"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
