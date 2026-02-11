import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DollarSign, CreditCard, ArrowUpRight } from "lucide-react";
import { useDummyData } from "@/lib/dummy-data";

const recentPayments = [
  { creator: "Alex Johnson", amount: "$2,500", date: "Feb 10, 2026", status: "Completed" },
  { creator: "Maria Garcia", amount: "$1,800", date: "Feb 8, 2026", status: "Completed" },
  { creator: "James Wilson", amount: "$3,200", date: "Feb 5, 2026", status: "Pending" },
  { creator: "Sofia Martinez", amount: "$1,200", date: "Feb 3, 2026", status: "Completed" },
];

export default function PaymentsPage() {
  const { showDummy, setShowDummy } = useDummyData();

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground" data-testid="text-payments-title">Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage creator payments and invoices</p>
        </div>
        <div className="flex items-center gap-3">
          <Label htmlFor="dummy-toggle-payments" className="text-sm text-muted-foreground">
            Preview with data
          </Label>
          <Switch
            id="dummy-toggle-payments"
            checked={showDummy}
            onCheckedChange={setShowDummy}
            data-testid="switch-dummy-data"
          />
        </div>
      </div>

      {showDummy ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 bg-card border-border" data-testid="card-total-paid">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm text-muted-foreground">Total Paid</p>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">$48,250</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-500">+12% vs last month</span>
              </div>
            </Card>
            <Card className="p-5 bg-card border-border" data-testid="card-pending">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm text-muted-foreground">Pending</p>
                <CreditCard className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">$3,200</p>
              <p className="text-xs text-muted-foreground mt-1">1 payment pending</p>
            </Card>
            <Card className="p-5 bg-card border-border" data-testid="card-creators-paid">
              <div className="flex items-center justify-between gap-2 mb-3">
                <p className="text-sm text-muted-foreground">Creators Paid</p>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">28</p>
              <p className="text-xs text-muted-foreground mt-1">Across all campaigns</p>
            </Card>
          </div>

          <Card className="p-5 bg-card border-border" data-testid="card-payment-history">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Creator</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Amount</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Date</th>
                    <th className="text-left text-xs font-medium text-muted-foreground pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayments.map((p, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="py-3 text-sm text-foreground">{p.creator}</td>
                      <td className="py-3 text-sm text-foreground font-medium">{p.amount}</td>
                      <td className="py-3 text-sm text-muted-foreground">{p.date}</td>
                      <td className="py-3">
                        <Badge
                          variant={p.status === "Completed" ? "default" : "secondary"}
                          className={p.status === "Completed" ? "bg-green-600/20 text-green-500 border-green-500/20" : ""}
                        >
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {["Total Paid", "Pending", "Creators Paid"].map((title) => (
              <Card key={title} className="p-5 bg-card border-border">
                <p className="text-sm text-muted-foreground mb-3">{title}</p>
                <p className="text-2xl font-bold text-foreground">--</p>
                <p className="text-xs text-muted-foreground mt-1">No data yet</p>
              </Card>
            ))}
          </div>

          <Card className="p-12 bg-card border-border text-center" data-testid="card-empty-state">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No payments yet</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Payment history will appear here once you start working with creators. Toggle "Preview with data" above to see a preview.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}
