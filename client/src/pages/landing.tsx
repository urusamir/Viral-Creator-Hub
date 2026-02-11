import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  BarChart3,
  Users,
  Zap,
  TrendingUp,
  Shield,
  Globe,
  ArrowRight,
  Star,
  CheckCircle,
  Sparkles,
  Target,
  Megaphone,
  CreditCard,
  ChevronRight,
  Play,
  Menu,
  X,
} from "lucide-react";
import { SiInstagram, SiTiktok, SiYoutube, SiX } from "react-icons/si";

function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

function Navbar({ onLoginClick }: { onLoginClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Pricing", href: "#pricing" },
  ];

  return (
    <nav
      data-testid="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          <a href="#" className="flex items-center gap-2 shrink-0" data-testid="link-logo">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-white tracking-tight">Vairal</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-gray-400 transition-colors duration-200"
                data-testid={`link-${link.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              className="hidden sm:inline-flex text-gray-300"
              onClick={onLoginClick}
              data-testid="button-login"
            >
              Log in
            </Button>
            <Button
              className="bg-blue-600 text-white border-0"
              data-testid="button-get-started"
            >
              Get Started
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0e1a]/95 backdrop-blur-xl border-b border-white/5 px-4 pb-4"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block py-3 text-gray-400 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
              data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s/g, "-")}`}
            >
              {link.label}
            </a>
          ))}
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 mt-2 sm:hidden"
            onClick={() => { onLoginClick(); setMobileMenuOpen(false); }}
            data-testid="button-login-mobile"
          >
            Log in
          </Button>
        </motion.div>
      )}
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20" data-testid="section-hero">
      <div className="absolute inset-0 bg-[#060a14]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 bg-blue-600/15 text-blue-400 border-blue-500/20 px-3 py-1.5 text-xs font-medium">
              <Sparkles className="w-3 h-3 mr-1.5" />
              AI-Powered Influencer Marketing
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Where Brands
              <br />
              Meet{" "}
              <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
                Creators
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-lg leading-relaxed">
              Discover, connect, and collaborate with the perfect creators for your brand.
              AI-powered matching, seamless campaigns, real results.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-blue-600 text-white border-0"
                data-testid="button-hero-start"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-white bg-white/5"
                data-testid="button-hero-demo"
              >
                <Play className="w-4 h-4 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center gap-6 sm:gap-10">
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <AnimatedCounter end={250} suffix="M+" />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Creator Profiles</p>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <AnimatedCounter end={15} suffix="K+" />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Campaigns Run</p>
              </div>
              <div className="w-px h-10 bg-white/10 hidden sm:block" />
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  <AnimatedCounter end={340} suffix="%" />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">Avg. ROI</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-500/10">
              <img
                src="/images/dashboard-preview.png"
                alt="Vairal Platform Dashboard"
                className="w-full h-auto"
                data-testid="img-hero-dashboard"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#060a14] via-transparent to-transparent opacity-40" />
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 bg-[#0f1629] border border-white/10 rounded-lg p-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Engagement</p>
                  <p className="text-sm font-semibold text-white">+127%</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-4 -left-6 bg-[#0f1629] border border-white/10 rounded-lg p-3 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Creators Matched</p>
                  <p className="text-sm font-semibold text-white">2,847</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function LogoMarquee() {
  const brands = [
    "Nike", "Spotify", "Adobe", "Shopify", "Netflix",
    "Samsung", "Uber", "Airbnb", "Slack", "Notion",
  ];

  return (
    <section className="relative py-16 bg-[#060a14] border-y border-white/5" data-testid="section-brands">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-sm text-gray-500 uppercase tracking-wider font-medium">
          Trusted by 1,000+ brands worldwide
        </p>
      </div>
      <div className="overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-16 whitespace-nowrap"
        >
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={i}
              className="text-xl sm:text-2xl font-bold text-gray-600/60 tracking-wider select-none"
              data-testid={`text-brand-${brand.toLowerCase()}-${i}`}
            >
              {brand}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Search,
      title: "AI Creator Discovery",
      description:
        "Search 250M+ creator profiles across Instagram, TikTok, YouTube & more. AI matches you with creators who actually fit your brand.",
      color: "blue",
    },
    {
      icon: Target,
      title: "Smart Campaign Management",
      description:
        "From briefs to contracts to payments. Manage your entire influencer pipeline in one connected workflow.",
      color: "indigo",
    },
    {
      icon: BarChart3,
      title: "Real-Time Analytics",
      description:
        "Track EMV, ROAS, engagement, and conversions across every platform. Know exactly what moves the needle.",
      color: "cyan",
    },
    {
      icon: CreditCard,
      title: "Seamless Payments",
      description:
        "Pay creators in 180+ countries with one click. Automated invoicing, tax compliance, and instant payouts.",
      color: "violet",
    },
    {
      icon: Shield,
      title: "Brand Safety & Vetting",
      description:
        "AI-powered audience quality scores, fake follower detection, and content safety analysis before you commit.",
      color: "emerald",
    },
    {
      icon: Globe,
      title: "Multi-Platform Reach",
      description:
        "Run campaigns across Instagram, TikTok, YouTube, Twitter, and LinkedIn from a single dashboard.",
      color: "orange",
    },
  ];

  const colorMap: Record<string, string> = {
    blue: "from-blue-500/20 to-blue-600/5 text-blue-400",
    indigo: "from-indigo-500/20 to-indigo-600/5 text-indigo-400",
    cyan: "from-cyan-500/20 to-cyan-600/5 text-cyan-400",
    violet: "from-violet-500/20 to-violet-600/5 text-violet-400",
    emerald: "from-emerald-500/20 to-emerald-600/5 text-emerald-400",
    orange: "from-orange-500/20 to-orange-600/5 text-orange-400",
  };

  return (
    <section id="features" className="relative py-24 sm:py-32 bg-[#080c18]" data-testid="section-features">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-600/15 text-blue-400 border-blue-500/20 px-3 py-1 text-xs">
            Platform Features
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              scale
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            From discovery to payment, Vairal connects every piece of your influencer marketing strategy.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="bg-[#0c1222] border-white/5 p-6 sm:p-7 h-full group"
                data-testid={`card-feature-${i}`}
              >
                <div
                  className={`w-11 h-11 rounded-lg bg-gradient-to-br ${colorMap[feature.color]} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Discover",
      description: "Use AI-powered search to find creators that match your brand, audience, and budget across every major platform.",
      icon: Search,
    },
    {
      step: "02",
      title: "Connect",
      description: "Send personalized proposals and briefs directly through the platform. Manage negotiations and contracts seamlessly.",
      icon: Megaphone,
    },
    {
      step: "03",
      title: "Launch",
      description: "Activate campaigns with automated workflows. Track content creation, approvals, and publishing in real time.",
      icon: Zap,
    },
    {
      step: "04",
      title: "Measure",
      description: "Get comprehensive analytics on reach, engagement, conversions, and ROI. Optimize and scale what works.",
      icon: BarChart3,
    },
  ];

  return (
    <section id="how-it-works" className="relative py-24 sm:py-32 bg-[#060a14]" data-testid="section-how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-600/15 text-blue-400 border-blue-500/20 px-3 py-1 text-xs">
            How It Works
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Four steps to{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              viral campaigns
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Launch influencer campaigns in minutes, not weeks.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              <div className="text-center">
                <div className="relative mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 flex items-center justify-center mb-6">
                  <step.icon className="w-7 h-7 text-blue-400" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(100%_-_8px)] w-[calc(100%_-_56px)] border-t border-dashed border-white/10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StatsSection() {
  const stats = [
    { value: 250, suffix: "M+", label: "Creator Profiles Indexed" },
    { value: 15, suffix: "K+", label: "Campaigns Launched" },
    { value: 340, suffix: "%", label: "Average ROI" },
    { value: 98, suffix: "%", label: "Client Satisfaction" },
  ];

  return (
    <section className="relative py-20 sm:py-24 bg-[#080c18]" data-testid="section-stats">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-indigo-600/5" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white" data-testid={`text-stat-${i}`}>
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Vairal transformed how we run influencer campaigns. What used to take weeks now takes hours. The AI matching is incredibly accurate.",
      author: "Sarah Chen",
      role: "Head of Marketing, TechFlow",
      rating: 5,
    },
    {
      quote: "We saw a 4x return on our first campaign. The platform makes it so easy to find creators who genuinely connect with our audience.",
      author: "Marcus Rivera",
      role: "Brand Director, FreshWear",
      rating: 5,
    },
    {
      quote: "The analytics dashboard alone is worth it. We can finally prove ROI to leadership and scale our creator partnerships with confidence.",
      author: "Emily Park",
      role: "CMO, GreenLeaf Co.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="relative py-24 sm:py-32 bg-[#060a14]" data-testid="section-testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-600/15 text-blue-400 border-blue-500/20 px-3 py-1 text-xs">
            Testimonials
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Loved by{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              marketers
            </span>{" "}
            worldwide
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="bg-[#0c1222] border-white/5 p-6 sm:p-7 h-full flex flex-col"
                data-testid={`card-testimonial-${i}`}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                    {t.author.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{t.author}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformsSection() {
  const platforms = [
    { name: "Instagram", icon: SiInstagram, color: "from-pink-500 to-purple-600" },
    { name: "TikTok", icon: SiTiktok, color: "from-gray-200 to-gray-400" },
    { name: "YouTube", icon: SiYoutube, color: "from-red-500 to-red-600" },
    { name: "Twitter/X", icon: SiX, color: "from-blue-400 to-blue-500" },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-[#080c18]" data-testid="section-platforms">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Every platform.{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              One dashboard.
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Connect with creators across all major social platforms from a single unified workspace.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 max-w-3xl mx-auto">
          {platforms.map((platform, i) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className="bg-[#0c1222] border-white/5 p-6 sm:p-8 text-center group"
                data-testid={`card-platform-${platform.name.toLowerCase()}`}
              >
                <div className={`w-14 h-14 mx-auto rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center mb-3`}>
                  <platform.icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-sm font-medium text-gray-300">{platform.name}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    {
      name: "Starter",
      price: "49",
      description: "For small brands getting started",
      features: [
        "Up to 50 creator searches/mo",
        "5 active campaigns",
        "Basic analytics",
        "Email support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Growth",
      price: "199",
      description: "For growing brands scaling up",
      features: [
        "Unlimited creator searches",
        "25 active campaigns",
        "Advanced analytics & ROI tracking",
        "Campaign automation",
        "Priority support",
        "Team collaboration (3 seats)",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For large brands and agencies",
      features: [
        "Everything in Growth",
        "Unlimited campaigns & seats",
        "Dedicated account manager",
        "Custom integrations & API",
        "SSO & advanced security",
        "White-label reporting",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-[#060a14]" data-testid="section-pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-blue-600/15 text-blue-400 border-blue-500/20 px-3 py-1 text-xs">
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
            Simple, transparent{" "}
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              pricing
            </span>
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Start free. Scale as you grow. No hidden fees.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card
                className={`p-6 sm:p-7 h-full flex flex-col relative ${
                  plan.popular
                    ? "bg-gradient-to-b from-blue-600/10 to-[#0c1222] border-blue-500/30"
                    : "bg-[#0c1222] border-white/5"
                }`}
                data-testid={`card-pricing-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white border-0 px-3 py-1 text-xs">
                    Most Popular
                  </Badge>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    {plan.price !== "Custom" && <span className="text-sm text-gray-500">$</span>}
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-sm text-gray-500">/month</span>}
                  </div>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-blue-600 text-white border-0"
                      : "bg-white/5 text-white border border-white/10"
                  }`}
                  data-testid={`button-pricing-${plan.name.toLowerCase()}`}
                >
                  {plan.cta}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden" data-testid="section-cta">
      <div className="absolute inset-0 bg-[#080c18]" />
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Ready to go{" "}
            <span className="bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
              Vairal
            </span>
            ?
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-xl mx-auto">
            Join thousands of brands and creators building the future of influencer marketing.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-blue-600 text-white border-0"
              data-testid="button-cta-start"
            >
              Start Your Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/10 text-white bg-white/5"
              data-testid="button-cta-demo"
            >
              Book a Demo
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            No credit card required. 14-day free trial.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Integrations", "API", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press", "Contact"],
    Resources: ["Help Center", "Documentation", "Case Studies", "Webinars"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="bg-[#060a14] border-t border-white/5 pt-16 pb-8" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Vairal</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              The AI-powered influencer marketing platform for modern brands.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-gray-500 transition-colors"
                      data-testid={`link-footer-${link.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            2026 Vairal. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-600 transition-colors" data-testid="link-social-twitter">
              <SiX className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-600 transition-colors" data-testid="link-social-instagram">
              <SiInstagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-600 transition-colors" data-testid="link-social-youtube">
              <SiYoutube className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-600 transition-colors" data-testid="link-social-tiktok">
              <SiTiktok className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function LoginModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c1222] border-white/10 text-white max-w-md p-0 overflow-hidden">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Vairal</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Log in to Vairal
            </DialogTitle>
            <p className="text-sm text-gray-400 mt-1">Choose how you want to continue</p>
          </DialogHeader>

          <div className="space-y-3">
            <button
              className="w-full group relative overflow-visible rounded-md border border-white/10 bg-[#111830] p-5 text-left hover-elevate"
              data-testid="button-login-creator"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white flex items-center gap-2 flex-wrap">
                    I'm a Creator
                    <Badge className="bg-blue-600/20 text-blue-400 border-blue-500/20 text-[10px] px-2 py-0">
                      Popular
                    </Badge>
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Monetize your audience and find brand deals
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 shrink-0" />
              </div>
            </button>

            <button
              className="w-full group relative overflow-visible rounded-md border border-white/10 bg-[#111830] p-5 text-left hover-elevate"
              data-testid="button-login-brand"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-white">
                    I'm a Brand
                  </h3>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Find and manage creator partnerships
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600 shrink-0" />
              </div>
            </button>
          </div>

          <p className="text-xs text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <a href="#" className="text-blue-400 transition-colors" data-testid="link-signup">
              Sign up for free
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Landing() {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <div className="bg-[#060a14] min-h-screen">
      <Navbar onLoginClick={() => setLoginOpen(true)} />
      <HeroSection />
      <LogoMarquee />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <PlatformsSection />
      <TestimonialsSection />
      <PricingSection />
      <CTASection />
      <Footer />
      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}
