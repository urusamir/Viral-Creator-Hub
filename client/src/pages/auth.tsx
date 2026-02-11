import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle" className="text-muted-foreground">
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const user = await login(username, password);
        if (user.onboardingComplete) {
          setLocation("/dashboard");
        } else {
          setLocation("/onboarding");
        }
      } else {
        await signup(username, password, "brand");
        setLocation("/onboarding");
      }
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      toast({ title: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <a href="/" className="flex items-center gap-2" data-testid="link-logo">
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">Vairal</span>
        </a>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border">
          <div className="mb-6">
            <a href="/" className="text-sm text-blue-500 flex items-center gap-1 mb-4" data-testid="link-back">
              <ArrowLeft className="w-3 h-3" />
              Back to home
            </a>
            <h1 className="text-2xl font-bold text-foreground" data-testid="text-auth-title">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isLogin ? "Log in to your brand account" : "Sign up as a brand to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Email</Label>
              <Input
                id="username"
                type="text"
                placeholder="you@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  data-testid="input-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  data-testid="button-toggle-password"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 text-white border-0"
              disabled={loading}
              data-testid="button-submit-auth"
            >
              {loading ? "Please wait..." : isLogin ? "Log in" : "Sign up"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-500"
              data-testid="button-toggle-auth-mode"
            >
              {isLogin ? "Sign up" : "Log in"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}
