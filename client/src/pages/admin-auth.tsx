import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { VairalLogo } from "@/components/vairal-logo";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground">
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

export default function AdminAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user, profile, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user && profile) {
      if (profile.is_admin) {
        setLocation("/admin");
      } else {
        toast({ title: "Access denied. Not an admin.", variant: "destructive" });
        setLocation("/dashboard");
      }
    }
  }, [user, profile, isLoading, setLocation, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      // Let the useEffect handle the redirection based on profile after login resolves.
    } catch (err: any) {
      toast({ title: err?.message || "Invalid admin credentials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <div className="flex items-center gap-1">
          <VairalLogo className="h-28" />
        </div>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border">
          <div className="mb-6 space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Admin Portal
            </h1>
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
