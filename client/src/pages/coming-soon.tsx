import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { VairalLogo } from "@/components/vairal-logo";
import { motion } from "framer-motion";
import { useTheme } from "@/providers/theme.provider";
import { Sun, Moon } from "lucide-react";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      data-testid="button-theme-toggle"
      className="text-muted-foreground"
    >
      {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </Button>
  );
}

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between gap-4 p-4 sm:p-6">
        <a href="/" className="flex items-center gap-1" data-testid="link-logo">
          <VairalLogo className="h-28" />
        </a>
        <ThemeToggle />
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-lg"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center mb-8">
            <Bell className="w-10 h-10 text-blue-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Coming{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Soon
            </span>
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            The creator portal is under development. We're building something amazing for creators to monetize their audience and find brand deals.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
