import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAdminAuth } from "@/lib/auth-admin";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

type Mode = "login" | "check-email" | "signup";

export default function AdminAuthPage() {
  const [mode, setMode] = useState<Mode>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // First-time setup state
  const [setupEmail, setSetupEmail] = useState("");
  const [setupName, setSetupName] = useState("");
  const [setupPassword, setSetupPassword] = useState("");
  const [showSetupPassword, setShowSetupPassword] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [signingUp, setSigningUp] = useState(false);

  const { login } = useAdminAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // ── Sign In ──────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoginLoading(true);
    try {
      const { isAdmin } = await login(loginEmail, loginPassword);
      if (isAdmin) {
        setLocation("/admin/dashboard");
      } else {
        toast({
          title: "Access denied",
          description: "This account does not have administrator privileges.",
          variant: "destructive",
        });
        setLoginLoading(false);
      }
    } catch (err: any) {
      toast({ title: err?.message || "Invalid admin credentials", variant: "destructive" });
      setLoginLoading(false);
    }
  };

  // ── Step 1: Check if email is pre-authorized ─────────────────────────────
  const handleCheckEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupEmail) return;
    setCheckingEmail(true);
    try {
      const { data, error } = await supabase
        .from("pending_admins")
        .select("email")
        .eq("email", setupEmail.trim().toLowerCase())
        .single();

      if (error || !data) {
        toast({
          title: "No invitation found",
          description: "This email hasn't been granted admin access. Contact your administrator.",
          variant: "destructive",
        });
        return;
      }

      // Email is pre-authorized — show the full signup form
      setMode("signup");
    } catch {
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setCheckingEmail(false);
    }
  };

  // ── Step 2: Complete signup ───────────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupEmail || !setupName || !setupPassword) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    if (setupPassword.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setSigningUp(true);
    try {
      // Create the Supabase auth account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: setupEmail.trim().toLowerCase(),
        password: setupPassword,
        options: { data: { full_name: setupName } },
      });

      if (signUpError) throw signUpError;
      if (!data.user) throw new Error("Signup failed. Please try again.");

      // Set is_admin: true on their profile (upsert handles both trigger-created and new profiles)
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: setupEmail.trim().toLowerCase(),
          is_admin: true,
          role: "brand",
          company_name: setupName,
          onboarding_complete: false,
        },
        { onConflict: "id" }
      );

      // Remove from pending list — they've completed setup
      await supabase.from("pending_admins").delete().eq("email", setupEmail.trim().toLowerCase());

      // Now log them in directly
      const { isAdmin } = await login(setupEmail.trim().toLowerCase(), setupPassword);
      if (isAdmin) {
        toast({ title: `Welcome, ${setupName}!`, description: "Your admin account is ready." });
        setLocation("/admin/dashboard");
      } else {
        toast({
          title: "Account created",
          description: "Please sign in with your new credentials.",
        });
        setMode("login");
        setLoginEmail(setupEmail.trim().toLowerCase());
      }
    } catch (err: any) {
      toast({ title: err?.message || "Signup failed. Please try again.", variant: "destructive" });
    } finally {
      setSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center p-4 sm:p-6">
        <span className="text-xl font-bold tracking-tight text-foreground">Vairal</span>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-6 sm:p-8 bg-card border-border">

          {/* ── MODE: LOGIN ── */}
          {mode === "login" && (
            <>
              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
                <p className="text-sm text-muted-foreground">Sign in with your administrator credentials</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="admin@vairal.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loginLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={loginLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={loginLoading}>
                  {loginLoading ? "Authenticating..." : "Sign into Admin Portal"}
                </Button>
              </form>

              <div className="mt-6 pt-4 border-t border-border text-center">
                <p className="text-sm text-muted-foreground">
                  First time here?{" "}
                  <button
                    onClick={() => setMode("check-email")}
                    className="text-blue-500 hover:text-blue-400 font-medium underline underline-offset-2"
                  >
                    Complete your admin setup →
                  </button>
                </p>
              </div>
            </>
          )}

          {/* ── MODE: CHECK EMAIL (first-time flow step 1) ── */}
          {mode === "check-email" && (
            <>
              <button
                onClick={() => setMode("login")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>

              <div className="mb-6 space-y-2">
                <h1 className="text-2xl font-bold text-foreground">First-time Setup</h1>
                <p className="text-sm text-muted-foreground">
                  Enter the email address that was used to grant you admin access.
                </p>
              </div>

              <form onSubmit={handleCheckEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-email-check">Email address</Label>
                  <Input
                    id="setup-email-check"
                    type="email"
                    placeholder="your@email.com"
                    value={setupEmail}
                    onChange={(e) => setSetupEmail(e.target.value)}
                    disabled={checkingEmail}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={checkingEmail || !setupEmail}>
                  {checkingEmail ? "Checking..." : "Verify Access"}
                </Button>
              </form>
            </>
          )}

          {/* ── MODE: SIGNUP (first-time flow step 2) ── */}
          {mode === "signup" && (
            <>
              <button
                onClick={() => setMode("check-email")}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">Access verified</span>
                </div>
                <h1 className="text-2xl font-bold text-foreground">Create Your Admin Account</h1>
                <p className="text-sm text-muted-foreground">
                  Set your name and password to complete your administrator account setup.
                </p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="setup-email">Email</Label>
                  <Input
                    id="setup-email"
                    type="email"
                    value={setupEmail}
                    disabled
                    className="opacity-60"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-name">Full name</Label>
                  <Input
                    id="setup-name"
                    type="text"
                    placeholder="Your name"
                    value={setupName}
                    onChange={(e) => setSetupName(e.target.value)}
                    disabled={signingUp}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="setup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="setup-password"
                      type={showSetupPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={setupPassword}
                      onChange={(e) => setSetupPassword(e.target.value)}
                      disabled={signingUp}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 text-muted-foreground hover:bg-transparent"
                      onClick={() => setShowSetupPassword(!showSetupPassword)}
                    >
                      {showSetupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full mt-4" disabled={signingUp}>
                  {signingUp ? "Creating account..." : "Create Admin Account"}
                </Button>
              </form>
            </>
          )}

        </Card>
      </div>
    </div>
  );
}
