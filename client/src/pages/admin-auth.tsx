import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useAdminAuth } from "@/lib/auth-admin";
import { useToast } from "@/hooks/use-toast";

export default function AdminAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      // login() fetches the profile directly and returns isAdmin immediately.
      // No async useEffect race condition — redirect happens right here.
      const { isAdmin } = await login(email, password);

      if (isAdmin) {
        setLocation("/admin/dashboard");
      } else {
        toast({
          title: "Access denied",
          description: "This account does not have administrator privileges.",
          variant: "destructive",
        });
        setLoading(false);
      }
    } catch (err: any) {
      toast({ title: err?.message || "Invalid admin credentials", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <span className="text-xl font-bold tracking-tight text-foreground">Vairal</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with your administrator credentials
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@vairal.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? "Authenticating..." : "Sign into Admin Portal"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
