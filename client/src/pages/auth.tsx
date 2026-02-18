import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Sun, Moon, Eye, EyeOff } from "lucide-react";
import { VairalLogo } from "@/components/vairal-logo";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} data-testid="button-theme-toggle" className="text-muted-foreground">
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

function TestimonialCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-5 mt-4">
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
        "Vairal has streamlined our entire creator marketing process, allowing us to collaborate with over 50 creators seamlessly, cutting down campaign management time by more than half. It's rare to find a tool that has such an immediate impact."
      </p>
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarFallback className="bg-blue-600 text-white text-sm">GL</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-foreground">Grant Lee</p>
          <p className="text-xs text-muted-foreground">CEO, Gamma</p>
        </div>
      </div>
    </div>
  );
}

const platformOptions = ["Instagram", "TikTok", "YouTube", "Twitter/X", "LinkedIn", "Snapchat"];
const positionOptions = ["Individual Contributor", "Team Manager", "Director/VP", "C-Level", "Other"];
const departmentOptions = ["Founder", "Marketing", "Growth", "Social Media", "Partnerships", "Other"];
const howFoundOptions = ["Google Search", "Social Media", "Referral", "Blog/Article", "Event", "Other"];

export default function AuthPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const modeParam = params.get("mode");
  const [isLogin, setIsLogin] = useState(modeParam === "login");
  const [, setLocation] = useLocation();
  const { login, signup } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setIsLogin(modeParam === "login");
  }, [modeParam]);

  if (isLogin) {
    return <LoginView onSwitch={() => setIsLogin(false)} />;
  }

  return <SignupView onSwitch={() => setIsLogin(true)} />;
}

function LoginView({ onSwitch }: { onSwitch: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
      const user = await login(username, password);
      if (user.onboardingComplete) {
        setLocation("/dashboard");
      } else {
        setLocation("/dashboard");
      }
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <a href="/" className="flex items-center gap-1" data-testid="link-logo">
          <VairalLogo className="h-28" />
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
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Log in to your brand account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-username" className="text-foreground">Email</Label>
              <Input
                id="login-username"
                type="text"
                placeholder="you@company.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                data-testid="input-username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password" className="text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
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
              {loading ? "Please wait..." : "Log in"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Don't have an account?{" "}
            <button onClick={onSwitch} className="text-blue-500" data-testid="button-toggle-auth-mode">
              Sign up
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
}

function SignupView({ onSwitch }: { onSwitch: () => void }) {
  const [step, setStep] = useState(1);
  const [, setLocation] = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [howFoundUs, setHowFoundUs] = useState("");

  const [position, setPosition] = useState("");
  const [department, setDepartment] = useState("");

  const [loading, setLoading] = useState(false);

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleStep1Continue = () => {
    if (!username.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!companyName.trim()) {
      toast({ title: "Please enter your company name", variant: "destructive" });
      return;
    }
    setStep(3);
  };

  const handleStep3Submit = async () => {
    if (!position) {
      toast({ title: "Please select your position", variant: "destructive" });
      return;
    }
    if (!department) {
      toast({ title: "Please select your department", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      await signup(username, password, "brand");
      await apiRequest("PATCH", "/api/auth/onboarding", {
        companyName,
        website,
        platforms: selectedPlatforms,
        monthlyBudget: monthlyBudget ? parseInt(monthlyBudget) : null,
        howFoundUs,
        position,
        department,
        onboardingComplete: true,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
      setLocation("/dashboard");
    } catch (err: any) {
      toast({ title: err?.message || "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <a href="/" className="flex items-center gap-1" data-testid="link-logo">
          <VairalLogo className="h-28" />
        </a>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-4xl bg-card border-border overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`} data-testid="indicator-step-1">
                  1
                </div>
                <div className={`flex-1 h-0.5 ${step >= 2 ? "bg-blue-600" : "bg-muted"}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`} data-testid="indicator-step-2">
                  2
                </div>
                <div className={`flex-1 h-0.5 ${step >= 3 ? "bg-blue-600" : "bg-muted"}`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 3 ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground"}`} data-testid="indicator-step-3">
                  3
                </div>
              </div>

              {step === 1 && (
                <div>
                  <p className="text-sm text-blue-500 mb-1">Create your account</p>
                  <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-signup-title">Get started with Vairal</h2>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Email</Label>
                      <Input
                        type="text"
                        placeholder="you@company.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        data-testid="input-username"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Password</Label>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="At least 6 characters"
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
                      className="w-full bg-blue-600 text-white border-0"
                      onClick={handleStep1Continue}
                      data-testid="button-continue"
                    >
                      Continue
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground text-center mt-6">
                    Already have an account?{" "}
                    <button onClick={onSwitch} className="text-blue-500" data-testid="button-toggle-auth-mode">
                      Log in
                    </button>
                  </p>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="text-sm text-blue-500 mb-1">Step 2 of 3</p>
                  <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-signup-title">Tell us about where you work</h2>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Company name *</Label>
                      <Input
                        placeholder="e.g. Acme Inc."
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        data-testid="input-company-name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Website</Label>
                      <Input
                        placeholder="www.acme.com"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        data-testid="input-website"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">What platforms are you interested in?</Label>
                      <div className="flex flex-wrap gap-2">
                        {platformOptions.map((p) => (
                          <Button
                            key={p}
                            variant={selectedPlatforms.includes(p) ? "default" : "outline"}
                            className={selectedPlatforms.includes(p) ? "bg-blue-600 text-white border-0" : ""}
                            onClick={() => togglePlatform(p)}
                            data-testid={`button-platform-${p.toLowerCase().replace("/", "")}`}
                          >
                            {p}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Monthly influencer budget</Label>
                      <div className="flex items-center gap-2">
                        <div className="bg-muted text-muted-foreground px-3 flex items-center rounded-md border border-border text-sm min-h-9">USD</div>
                        <Input
                          placeholder="e.g. 25000"
                          type="number"
                          value={monthlyBudget}
                          onChange={(e) => setMonthlyBudget(e.target.value)}
                          data-testid="input-budget"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">How did you find us?</Label>
                      <Select value={howFoundUs} onValueChange={setHowFoundUs}>
                        <SelectTrigger data-testid="select-how-found">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {howFoundOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(1)}
                        data-testid="button-back"
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 text-white border-0"
                        onClick={handleStep2Continue}
                        data-testid="button-continue"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-sm text-blue-500 mb-1">Step 3 of 3</p>
                  <h2 className="text-2xl font-bold text-foreground mb-6" data-testid="text-signup-title">Tell us more about yourself</h2>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">I would describe my position as...</Label>
                      <div className="space-y-2">
                        {positionOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setPosition(opt)}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${position === opt ? "border-blue-500 bg-blue-600/10 text-foreground" : "border-border text-foreground hover-elevate"}`}
                            data-testid={`button-position-${opt.toLowerCase().replace(/[\s/]/g, "-")}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">I am a...</Label>
                      <div className="space-y-2">
                        {departmentOptions.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setDepartment(opt)}
                            className={`w-full text-left p-3 rounded-md border transition-colors ${department === opt ? "border-blue-500 bg-blue-600/10 text-foreground" : "border-border text-foreground hover-elevate"}`}
                            data-testid={`button-department-${opt.toLowerCase().replace(/[\s/]/g, "-")}`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setStep(2)}
                        data-testid="button-back"
                      >
                        Back
                      </Button>
                      <Button
                        className="flex-1 bg-blue-600 text-white border-0"
                        onClick={handleStep3Submit}
                        disabled={loading}
                        data-testid="button-submit-signup"
                      >
                        {loading ? "Please wait..." : "Create Account"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="hidden md:flex flex-col bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-r-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/80 to-indigo-700/80" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-[60px]" />
              <div className="relative flex-1" />
              <div className="relative">
                <TestimonialCard />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
