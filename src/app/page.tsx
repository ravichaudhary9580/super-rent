"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building,
  Building2,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle2,
  Zap,
  PhoneCall,
  Wallet,
  Plus,
  Minus,
  Menu,
  X,
  Home,
  Star,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
  Heart,
  Lock,
  GraduationCap,
  Megaphone,
} from "lucide-react";

const STATS = [
  { value: "50,000+", label: "Verified Beds", color: "text-blue-600" },
  { value: "₹0", label: "Zero Brokerage", color: "text-emerald-600" },
  { value: "25+", label: "Cities Covered", color: "text-indigo-600" },
  { value: "4.9★", label: "User Rating", color: "text-amber-500" },
];

const PROPERTY_TYPES = [
  {
    title: "Student Hostels",
    icon: <Users className="w-7 h-7 text-blue-600" />,
    desc: "Vibrant community living with meals, laundry & study rooms included.",
    price: "₹4,500/mo onwards",
    tag: "Most Popular",
    tagColor: "bg-blue-100 text-blue-700",
    gradient: "from-blue-50 to-indigo-50",
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    count: "12,000+ rooms",
  },
  {
    title: "Co-Living PGs",
    icon: <Home className="w-7 h-7 text-purple-600" />,
    desc: "Modern furnished rooms with high-speed WiFi, AC & daily cleaning.",
    price: "₹7,500/mo onwards",
    tag: "Premium",
    tagColor: "bg-purple-100 text-purple-700",
    gradient: "from-purple-50 to-pink-50",
    border: "border-purple-200",
    iconBg: "bg-purple-100",
    count: "8,500+ rooms",
  },
  {
    title: "Private Rooms",
    icon: <Lock className="w-7 h-7 text-emerald-600" />,
    desc: "Single attached washroom rooms for professionals needing quiet space.",
    price: "₹9,000/mo onwards",
    tag: "Privacy First",
    tagColor: "bg-emerald-100 text-emerald-700",
    gradient: "from-emerald-50 to-teal-50",
    border: "border-emerald-200",
    iconBg: "bg-emerald-100",
    count: "5,200+ rooms",
  },
  {
    title: "1 & 2 BHK Flats",
    icon: <Building2 className="w-7 h-7 text-amber-600" />,
    desc: "Ready-to-move independent apartments for groups and small families.",
    price: "₹14,000/mo onwards",
    tag: "Spacious",
    tagColor: "bg-amber-100 text-amber-700",
    gradient: "from-amber-50 to-orange-50",
    border: "border-amber-200",
    iconBg: "bg-amber-100",
    count: "3,800+ flats",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Search & Discover",
    desc: "Filter by location, budget, room type, meals, and amenities in seconds.",
    icon: <Search className="w-6 h-6" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  {
    num: "02",
    title: "Connect Directly",
    desc: "Talk straight to the verified owner or hostel manager — no middlemen.",
    icon: <PhoneCall className="w-6 h-6" />,
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
  },
  {
    num: "03",
    title: "Visit & Move In",
    desc: "Schedule a physical tour, confirm the room, and move in the same day.",
    icon: <CheckCircle2 className="w-6 h-6" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    role: "Engineering Student, Bangalore",
    review:
      "Found a perfect girls hostel in Koramangala within 2 hours with meals, WiFi and laundry included. Zero brokerage saved me ₹12,000!",
    rating: 5,
    avatar: "PS",
    color: "bg-pink-500",
  },
  {
    name: "Rahul Mehta",
    role: "IT Professional, Pune",
    review:
      "The lead quality on SuperRent is exceptional. My hostel has been at 98% occupancy for the last 6 months because of the platform.",
    rating: 5,
    avatar: "RM",
    color: "bg-blue-600",
  },
  {
    name: "Anjali Nair",
    role: "MBA Student, Hyderabad",
    review:
      "Relocated from Kerala and found a verified girls PG in HSR Layout with AC, meals and power backup. Moved in within 24 hours!",
    rating: 5,
    avatar: "AN",
    color: "bg-purple-600",
  },
];

const FAQS = [
  {
    q: "Is SuperRent really 100% zero brokerage for tenants?",
    a: "Absolutely. Tenants connect directly with verified property owners at zero cost — no registration fees, no booking charges, and no commission ever.",
  },
  {
    q: "How does the lead distribution engine work for owners?",
    a: "When students and professionals search for accommodation, our AI engine routes high-intent leads to matching hostels and PG owners in that precise neighborhood based on budget, preferences, and availability.",
  },
  {
    q: "Are all listings physically verified?",
    a: "Every property undergoes a rigorous verification process — physical address validation, actual photo shoots, owner identity check, and amenity audits before going live.",
  },
  {
    q: "How quickly can I move into my new room?",
    a: "Most students visit and move in within 24–48 hours of their first inquiry. Our direct-contact model eliminates delays caused by intermediaries.",
  },
  {
    q: "What cities are covered by SuperRent?",
    a: "We're live in 25+ major Indian cities including Bangalore, Pune, Hyderabad, Delhi NCR, Mumbai, Chennai, Kolkata, Ahmedabad, and expanding monthly.",
  },
];

export default function LandingPage() {
  const [search, setSearch] = useState("");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tenants" | "owners">("tenants");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll-triggered animations via IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target); // animate once
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div data-theme="light" className="min-h-screen flex flex-col bg-white text-slate-900 antialiased" style={{ colorScheme: "light" }}>

      {/* ─── NAVIGATION ────────────────────────────────────── */}
      <header className="sticky top-0 z-50 pointer-events-none" style={{ color: "#0f172a" }}>
        <div className={`pointer-events-auto transition-all duration-500 ${
          scrolled
            ? "mx-3 sm:mx-6 lg:mx-auto lg:max-w-5xl mt-3 rounded-2xl border border-slate-200/80 shadow-xl shadow-slate-900/10"
            : "border-b border-slate-100"
        }`}
          style={{
            background: scrolled
              ? "rgba(255,255,255,0.88)"
              : "#ffffff",
            backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(20px) saturate(180%)" : "none",
          }}
        >
          <div className={`${scrolled ? "px-4 sm:px-6" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"}`}>
            <div className={`flex justify-between items-center ${scrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"} transition-all duration-300`}>

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2.5 group shrink-0">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300"
                  style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#ffffff" }}
                >
                  <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="leading-none">
                  <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Super<span style={{ color: "#2563eb" }}>Rent</span>
                  </span>
                  {!scrolled && (
                    <span className="hidden sm:block text-[9px] font-bold tracking-[0.15em] uppercase text-slate-400 mt-0.5">
                      Zero Brokerage
                    </span>
                  )}
                </div>
              </Link>

              {/* Desktop Nav — pill group */}
              <nav className="hidden lg:flex items-center">
                <div
                  className="flex items-center gap-1 px-2 py-1.5 rounded-2xl"
                  style={{ background: "rgba(241,245,249,0.8)" }}
                >
                  {[
                    { label: "Explore", href: "/login" },
                    { label: "How It Works", href: "#how-it-works" },
                    { label: "For Owners", href: "#for-owners" },
                    { label: "Reviews", href: "#testimonials" },
                    { label: "FAQs", href: "#faqs" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="relative px-3.5 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all duration-200 group"
                    >
                      {item.label}
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "#2563eb" }} />
                    </Link>
                  ))}
                </div>
              </nav>

              {/* Desktop CTAs */}
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
                  style={{ color: "#475569" }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = "#2563eb"; (e.target as HTMLElement).style.background = "#eff6ff"; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = "#475569"; (e.target as HTMLElement).style.background = "transparent"; }}
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="text-sm font-bold px-5 py-2.5 rounded-xl transition-all active:scale-95 hover:opacity-90 hover:shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
                    color: "#ffffff",
                    boxShadow: "0 4px 12px rgba(37,99,235,0.35)",
                  }}
                >
                  Get Started →
                </Link>
              </div>

              {/* Mobile Actions */}
              <div className="flex sm:hidden items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold px-3 py-1.5 border border-slate-200 rounded-lg"
                  style={{ color: "#334155" }}
                >
                  Sign In
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl transition-colors"
                  style={{ color: "#334155" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "#f1f5f9")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

            </div>
          </div>

          {/* Mobile Dropdown */}
          {mobileMenuOpen && (
            <div className="sm:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: "#f1f5f9" }}>
              {[
                { label: "Explore Properties", href: "/login" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "For Hostel & PG Owners", href: "#for-owners" },
                { label: "Reviews", href: "#testimonials" },
                { label: "FAQs", href: "#faqs" },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                  style={{ color: "#334155" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#eff6ff"; el.style.color = "#2563eb"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "#334155"; }}
                >
                  {item.label}
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </Link>
              ))}
              <div className="pt-2 pb-1 border-t" style={{ borderColor: "#f1f5f9" }}>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center font-bold text-sm py-3 rounded-xl"
                  style={{ background: "linear-gradient(135deg, #2563eb, #4f46e5)", color: "#ffffff" }}
                >
                  Get Started Free →
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>


      {/* ─── HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-32 bg-slate-50/50" style={{ color: "#0f172a" }}>
        {/* Background Grid & Texture */}
        <div className="absolute inset-0 bg-grid-slate-pattern bg-radial-mask pointer-events-none opacity-80" />

        {/* Ambient floating blur orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-[520px] h-[520px] bg-gradient-to-br from-blue-200/50 to-indigo-200/40 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute -bottom-24 -left-24 w-[450px] h-[450px] bg-gradient-to-tr from-purple-200/40 to-blue-200/40 rounded-full blur-3xl animate-float-reverse" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-indigo-100/60 rounded-full blur-2xl animate-pulse-soft" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">

            {/* Top Badge */}
            <div data-animate="pop" data-delay="50" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-bold mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>India's #1 Zero Brokerage Accommodation Platform</span>
            </div>

            {/* Headline */}
            <h1 data-animate="blur-in" data-delay="150" className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-5 sm:mb-7" style={{ color: "#0f172a" }}>
              Find Your Perfect
              <span
                className="block"
                style={{
                  background: "linear-gradient(to right, #2563eb, #4f46e5, #9333ea)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                PG &amp; Hostel
              </span>
              <span className="block" style={{ color: "#0f172a" }}>Without Brokerage</span>
            </h1>

            <p data-animate="fade-up" data-delay="250" className="text-slate-500 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed font-medium mb-8 sm:mb-10">
              Discover verified student hostels, modern co-living spaces, and private rooms with food, high-speed WiFi, and 24/7 security — near your college or workplace.
            </p>

            {/* Trust Badges */}
            <div data-animate="zoom-in" data-delay="300" className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mb-8 sm:mb-10">
              {[
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, text: "100% Verified Listings" },
                { icon: <Zap className="w-4 h-4 text-amber-500" />, text: "Instant Owner Contact" },
                { icon: <Heart className="w-4 h-4 text-red-500" />, text: "Zero Brokerage" },
              ].map((badge) => (
                <span
                  key={badge.text}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm"
                >
                  {badge.icon}
                  {badge.text}
                </span>
              ))}
            </div>

            {/* Search Bar */}
            <div data-animate="flip-up" data-delay="350" className="max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl shadow-slate-200/80 p-3 sm:p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  window.location.href = "/login";
                }}
                className="flex flex-col sm:flex-row gap-2.5"
              >
                <div className="flex flex-1 items-center gap-2.5 px-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-400/20 focus-within:bg-white transition-all">
                  <MapPin className="w-5 h-5 text-blue-500 shrink-0" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="City, locality, college or tech park..."
                    className="flex-1 bg-transparent text-slate-800 placeholder:text-slate-400 text-sm font-medium outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-500/30 hover:shadow-lg transition-all active:scale-95 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  Search Rooms
                </button>
              </form>

              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-medium self-center">Popular:</span>
                {["Koramangala", "HSR Layout", "Hinjewadi", "Gachibowli", "Noida Sector 62"].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setSearch(loc)}
                    className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mt-10 sm:mt-14">
              {STATS.map((s, idx) => (
                <div
                  key={s.label}
                  data-animate="pop"
                  data-delay={String(idx * 80 + 400)}
                  className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  <div className={`text-2xl sm:text-3xl font-black ${s.color}`}>{s.value}</div>
                  <div className="text-xs text-slate-500 font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── PROPERTY TYPES ────────────────────────────────── */}
      <section className="relative py-16 sm:py-24 bg-slate-50 overflow-hidden" style={{ color: "#0f172a" }}>
        {/* Dot pattern texture */}
        <div className="absolute inset-0 bg-dot-slate-pattern bg-radial-mask-soft pointer-events-none opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p data-animate="fade-down" className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">Tailored For You</p>
            <h2 data-animate="blur-in" data-delay="100" className="text-3xl sm:text-4xl font-black text-slate-900">Every Lifestyle, One Platform</h2>
            <p data-animate="fade-up" data-delay="200" className="text-slate-500 text-sm mt-3 max-w-xl mx-auto">From budget student dorms to premium co-living studios — find exactly what you need.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {PROPERTY_TYPES.map((type, idx) => (
              <Link
                key={type.title}
                href="/login"
                data-animate="tilt-in"
                data-delay={String(idx * 100 + 100)}
                className={`group relative flex flex-col bg-gradient-to-br ${type.gradient} border ${type.border} rounded-3xl p-6 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm`}
              >
                {/* Tag */}
                <span className={`self-start text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${type.tagColor}`}>
                  {type.tag}
                </span>

                <div className={`w-14 h-14 rounded-2xl ${type.iconBg} flex items-center justify-center mb-4`}>
                  {type.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1.5">{type.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed flex-1">{type.desc}</p>

                <div className="mt-5 pt-4 border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-blue-700">{type.price}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{type.count}</p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 group-hover:bg-blue-600 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────── */}
      <section id="how-it-works" className="relative py-16 sm:py-24 bg-white overflow-hidden" style={{ color: "#0f172a" }}>
        {/* Dense Grid Texture */}
        <div className="absolute inset-0 bg-grid-dense-pattern bg-radial-mask-soft pointer-events-none opacity-50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p data-animate="fade-down" className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-2">3 Simple Steps</p>
            <h2 data-animate="blur-in" data-delay="100" className="text-3xl sm:text-4xl font-black text-slate-900">How SuperRent Works</h2>
            <p data-animate="fade-up" data-delay="200" className="text-slate-500 text-sm mt-3 max-w-xl mx-auto">Move into your verified accommodation in less than 48 hours.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-10 left-[calc(33.33%+1rem)] right-[calc(33.33%+1rem)] h-px bg-gradient-to-r from-blue-200 via-indigo-300 to-emerald-200 z-0" />

            {STEPS.map((step, i) => (
              <div
                key={step.num}
                data-animate={i === 0 ? "fade-right" : i === 1 ? "flip-up" : "fade-left"}
                data-delay={String(i * 150 + 100)}
                className={`relative z-10 flex flex-col items-center text-center p-8 rounded-3xl bg-white/90 backdrop-blur-sm border-2 ${step.border} shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all`}
              >
                <div className={`w-16 h-16 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-4 shadow-sm`}>
                  {step.icon}
                </div>
                <span className="text-4xl font-black text-slate-200 font-mono mb-2 select-none">{step.num}</span>
                <h3 className="text-lg font-black text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div data-animate="pop" data-delay="450" className="text-center mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-md transition-all active:scale-95"
            >
              Sign In to Search <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOR TENANTS & OWNERS ──────────────────────────── */}
      <section id="for-owners" className="relative py-16 sm:py-24 bg-slate-50 overflow-hidden" style={{ color: "#0f172a" }}>
        {/* Subtle Grid texture */}
        <div className="absolute inset-0 bg-grid-slate-pattern bg-radial-mask pointer-events-none opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Switch */}
          <div data-animate="pop" className="flex justify-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-1.5 p-1.5 bg-slate-200/90 backdrop-blur-sm rounded-2xl shadow-inner">
              {(["tenants", "owners"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition-all whitespace-nowrap ${
                    activeTab === tab ? "bg-white text-slate-900 shadow-sm scale-100" : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  {tab === "tenants" ? (
                    <span className="inline-flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> For Students & Tenants</span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5"><Building className="w-4 h-4" /> For Hostel & PG Owners</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "tenants" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
              <div data-animate="fade-left" data-delay="100" className="order-2 lg:order-1">
                <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3">Tenant Benefits</p>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-5">
                  Safe, Verified Rooms.<br />
                  <span className="text-blue-600">Zero Commission. Ever.</span>
                </h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-7">
                  Stop wasting money on brokers. Every listing is physically verified, and you speak directly with the real property manager.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "Free for all tenants — no registration or hidden charges",
                    "Real photos, verified meal plans & genuine student reviews",
                    "Direct phone & WhatsApp access to property manager",
                    "Save & compare rooms before deciding",
                    "Secure move-in guarantee with verified terms",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-700 text-sm font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-7 py-4 rounded-2xl shadow-md shadow-blue-500/30 transition-all active:scale-95"
                >
                  Browse Verified PGs <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Visual Card */}
              <div data-animate="tilt-in" data-delay="250" className="order-1 lg:order-2 bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-5 sm:p-6" style={{ background: "linear-gradient(to right, #2563eb, #4f46e5)", color: "#ffffff" }}>
                  <h4 className="font-black text-lg sm:text-xl" style={{ color: "#ffffff" }}>Broker vs SuperRent</h4>
                  <p className="text-xs mt-1" style={{ color: "#bfdbfe" }}>What you save every time you use us</p>
                </div>
                <div className="p-5 sm:p-6 space-y-4">
                  {[
                    { label: "Traditional Broker", value: "₹10,000–₹18,000", bad: true, note: "1–1.5 months rent as commission" },
                    { label: "SuperRent Platform", value: "₹0", bad: false, note: "100% free for life" },
                  ].map((row) => (
                    <div key={row.label} className={`p-4 rounded-2xl border ${row.bad ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-bold ${row.bad ? "text-red-700" : "text-emerald-700"}`}>{row.label}</span>
                        <span className={`text-lg font-black ${row.bad ? "text-red-600" : "text-emerald-600"}`}>{row.value}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{row.note}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-slate-100 text-center">
                    <span className="text-2xl font-black text-blue-600">You save ₹12,000+</span>
                    <p className="text-xs text-slate-400 mt-0.5">on every single accommodation search</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16 items-center">
              <div data-animate="fade-left" data-delay="100">
                <p className="text-xs font-black uppercase tracking-widest text-indigo-600 mb-3">Owner Benefits</p>
                <h3 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight mb-5">
                  Fill Vacant Beds Faster.<br />
                  <span className="text-indigo-600">High-Intent Leads Daily.</span>
                </h3>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-7">
                  SuperRent's intelligent engine routes verified student and professional inquiries directly to your inbox in real time.
                </p>
                <div className="space-y-3 mb-8">
                  {[
                    "Location-targeted lead distribution to your exact neighborhood",
                    "Exclusive & shared lead tiers for maximum ROI",
                    "Real-time SMS & WhatsApp notifications on new leads",
                    "Built-in wallet system — unlock leads instantly",
                    "Analytics dashboard to track occupancy and conversions",
                  ].map((feat) => (
                    <div key={feat} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-slate-700 text-sm font-medium">{feat}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/login?mode=signup"
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm px-7 py-4 rounded-2xl shadow-md shadow-indigo-500/30 transition-all active:scale-95"
                >
                  List Your Hostel / PG <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Live Lead Preview */}
              <div data-animate="tilt-in" data-delay="250" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-5 sm:p-6 flex items-center justify-between" style={{ background: "linear-gradient(to right, #4f46e5, #9333ea)", color: "#ffffff" }}>
                  <div>
                    <h4 className="font-black text-lg" style={{ color: "#ffffff" }}>Live Lead Marketplace</h4>
                    <p className="text-xs mt-0.5" style={{ color: "#c7d2fe" }}>Real-time high-intent inquiries</p>
                  </div>
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: "rgba(16,185,129,0.2)", color: "#6ee7b7", border: "1px solid rgba(16,185,129,0.3)" }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Live
                  </span>
                </div>
                <div className="p-5 sm:p-6 space-y-3">
                  {[
                    { area: "Koramangala 5th Block", type: "Boys PG", budget: "₹9,000/mo", intent: "Move-in: 3 days", badge: "Hot", badgeColor: "bg-red-100 text-red-700" },
                    { area: "HSR Layout Sec 2", type: "Girls Hostel", budget: "₹12,000/mo", intent: "Move-in: Immediate", badge: "Exclusive", badgeColor: "bg-indigo-100 text-indigo-700" },
                    { area: "Whitefield", type: "Single Room", budget: "₹15,000/mo", intent: "Move-in: 1 week", badge: "Verified", badgeColor: "bg-emerald-100 text-emerald-700" },
                  ].map((lead) => (
                    <div key={lead.area} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-200 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{lead.area}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{lead.type} • {lead.budget}</p>
                        <p className="text-xs text-blue-600 font-semibold mt-0.5">{lead.intent}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${lead.badgeColor}`}>{lead.badge}</span>
                    </div>
                  ))}
                  <p className="text-center text-xs text-slate-400 pt-2">+127 new leads this week in Bangalore</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── TESTIMONIALS ──────────────────────────────────── */}
      <section id="testimonials" className="relative py-16 sm:py-24 bg-white overflow-hidden" style={{ color: "#0f172a" }}>
        {/* Fine dot pattern */}
        <div className="absolute inset-0 bg-dot-fine-pattern bg-radial-mask pointer-events-none opacity-70" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <p data-animate="fade-down" className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-2">Real Stories</p>
            <h2 data-animate="blur-in" data-delay="100" className="text-3xl sm:text-4xl font-black text-slate-900">What Our Users Say</h2>
            <p data-animate="fade-up" data-delay="200" className="text-slate-500 text-sm mt-3 max-w-lg mx-auto">Trusted by students, professionals, and hostel owners across India.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {TESTIMONIALS.map((t, idx) => (
              <div
                key={t.name}
                data-animate="zoom-in"
                data-delay={String(idx * 150 + 100)}
                className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all"
              >
                <div className="flex items-center gap-1.5 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed mb-5 italic">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className={`w-10 h-10 rounded-2xl ${t.color} text-white font-black text-sm flex items-center justify-center`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ───────────────────────────────────────────── */}
      <section id="faqs" className="relative py-16 sm:py-24 bg-slate-50 overflow-hidden" style={{ color: "#0f172a" }}>
        {/* Dense Grid Texture */}
        <div className="absolute inset-0 bg-grid-dense-pattern bg-radial-mask-soft pointer-events-none opacity-50" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p data-animate="fade-down" className="text-xs font-black uppercase tracking-widest text-blue-600 mb-2">FAQ</p>
            <h2 data-animate="blur-in" data-delay="100" className="text-3xl sm:text-4xl font-black text-slate-900">Got Questions?</h2>
            <p data-animate="fade-up" data-delay="200" className="text-slate-500 text-sm mt-3">Everything you need to know about SuperRent.</p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const open = activeFaq === i;
              return (
                <div
                  key={faq.q}
                  data-animate={i % 2 === 0 ? "fade-left" : "fade-right"}
                  data-delay={String(i * 70 + 50)}
                  className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <div className="w-7 h-7 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                      {open ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>
                  {open && (
                    <div className="px-5 sm:px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ────────────────────────────────────── */}
      <section className="relative py-12 sm:py-20 bg-white overflow-hidden" style={{ color: "#0f172a" }}>
        {/* Subtle dot texture */}
        <div className="absolute inset-0 bg-dot-slate-pattern bg-radial-mask pointer-events-none opacity-40" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-animate="pop"
            className="relative rounded-3xl overflow-hidden p-8 sm:p-16 text-center"
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 50%, #7c3aed 100%)",
              boxShadow: "0 25px 50px -12px rgba(37,99,235,0.4)",
              color: "#ffffff",
            }}
          >
            {/* Grid texture inside CTA */}
            <div className="absolute inset-0 bg-grid-dense-pattern pointer-events-none opacity-15" />

            {/* Decorative Floating Circles */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full animate-float-slow" style={{ background: "rgba(255,255,255,0.12)" }} />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full animate-float-reverse" style={{ background: "rgba(255,255,255,0.12)" }} />

            <div className="relative z-10 space-y-5 sm:space-y-7">
              <div data-animate="pop" data-delay="100" className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold" style={{ background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", color: "#ffffff" }}>
                <Sparkles className="w-3.5 h-3.5" />
                Free Forever for Tenants
              </div>

              <h2 data-animate="blur-in" data-delay="200" className="text-3xl sm:text-5xl font-black tracking-tight leading-tight" style={{ color: "#ffffff" }}>
                Ready to Find Your <br className="hidden sm:inline" />Perfect Room?
              </h2>
              <p data-animate="fade-up" data-delay="300" className="text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "#bfdbfe" }}>
                Join thousands of happy tenants and hostel owners who trust SuperRent for seamless, brokerage-free accommodation.
              </p>

              <div data-animate="pop" data-delay="400" className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-white rounded-xl font-black text-sm shadow-xl hover:bg-slate-100 hover:scale-105 transition-all active:scale-95"
                  style={{ color: "#0f172a" }}
                >
                  Browse All Properties →
                </Link>
                <Link
                  href="/login?mode=signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 hover:bg-white/20 hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.15)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  List Your Hostel / PG
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <Building className="w-5 h-5" />
                </div>
                <span className="text-xl font-black text-white">SuperRent</span>
              </div>
              <p className="text-xs leading-relaxed max-w-48">
                India's premier zero-brokerage accommodation platform. Connecting students and owners directly.
              </p>
              <div className="flex gap-2 pt-1">
                {["Bangalore", "Pune", "Hyderabad", "Delhi"].map((city) => (
                  <span key={city} className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md">
                    {city}
                  </span>
                ))}
              </div>
            </div>

            {/* Accommodations */}
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Properties</h4>
              <ul className="space-y-2.5 text-xs">
                {["Student Hostels", "Co-Living PGs", "Private Rooms", "1 & 2 BHK Flats"].map((item) => (
                  <li key={item}>
                    <Link href="/properties" className="hover:text-white transition-colors">{item}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Portals */}
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Portals</h4>
              <ul className="space-y-2.5 text-xs">
                <li><Link href="/login" className="hover:text-white transition-colors">Tenant Dashboard</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Owner Lead Portal</Link></li>
                <li>
                  <Link href="/admin/login" className="hover:text-amber-400 text-amber-500 font-bold transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" /> Admin Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-extrabold text-white text-xs uppercase tracking-wider mb-4">Support</h4>
              <ul className="space-y-2.5 text-xs">
                <li className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Listings</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Instant Contact</span>
                </li>
                <li className="text-slate-500 pt-1">support@superrent.com</li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} SuperRent Inc. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
                <Link key={item} href="/properties" className="hover:text-slate-300 transition-colors">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
