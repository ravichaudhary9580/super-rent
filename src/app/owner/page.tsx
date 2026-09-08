"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Building, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Loader2, 
  Check, 
  ArrowRight,
  Wallet,
  Contact,
  Phone,
  MapPin,
  PlusCircle,
  Building2,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { WalletWidget } from "@/components/WalletWidget";

interface OverviewStats {
  activeListings: number;
  totalProperties: number;
  totalLeads: number;
  hotLeads: number;
  purchasedLeads: number;
  walletBalance: number;
  totalSpent: number;
}

interface RecentLead {
  _id: string;
  tenantName: string;
  tenantPhone: string;
  city: string;
  area: string;
  college?: string;
  budget?: number;
  gender?: string;
  moveInTimeline?: string;
  category?: string;
  propertyTitle?: string;
  price?: number;
  unlockedAt?: string;
}

interface RecentProperty {
  _id: string;
  title: string;
  rent: number;
  location?: {
    city?: string;
    area?: string;
    address?: string;
  };
  images?: string[];
  status?: string;
  type?: string;
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<OverviewStats>({
    activeListings: 0,
    totalProperties: 0,
    totalLeads: 0,
    hotLeads: 0,
    purchasedLeads: 0,
    walletBalance: 0,
    totalSpent: 0
  });
  const [recentPurchasedLeads, setRecentPurchasedLeads] = useState<RecentLead[]>([]);
  const [recentProperties, setRecentProperties] = useState<RecentProperty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState<boolean>(false);

  const fetchOverview = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/owner/overview");
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
        if (data.recentPurchasedLeads) {
          setRecentPurchasedLeads(data.recentPurchasedLeads);
        }
        if (data.recentProperties) {
          setRecentProperties(data.recentProperties);
        }
      }
    } catch (err) {
      console.error("Failed to fetch owner overview:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const ownerName = session?.user?.name || (session?.user as any)?.phone || "Partner";

  const metrics = [
    {
      title: "Active Listings",
      value: stats.activeListings,
      sub: `${stats.totalProperties} properties`,
      icon: <Building className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/owner/properties"
    },
    {
      title: "Available Leads",
      value: stats.totalLeads,
      sub: "Active in your city",
      icon: <Users className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/owner/leads"
    },
    {
      title: "Hot Inquiries",
      value: stats.hotLeads,
      sub: "High intent buyers",
      icon: <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/owner/leads"
    },
    {
      title: "Purchased Leads",
      value: stats.purchasedLeads,
      sub: "Unlocked contacts",
      icon: <Contact className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/owner/purchased-leads"
    },
    {
      title: "Wallet Balance",
      value: `₹${stats.walletBalance.toLocaleString("en-IN")}`,
      sub: `₹${stats.totalSpent.toLocaleString("en-IN")} total spent`,
      icon: <Wallet className="h-4 w-4 sm:h-5 sm:w-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/owner/leads?tab=wallet",
      action: () => setIsAddFundsModalOpen(true),
      actionLabel: "+ Deposit",
      isWallet: true
    }
  ];

  return (
    <div className="px-3 py-3.5 sm:px-6 sm:py-6 lg:p-8 max-w-7xl mx-auto space-y-3.5 sm:space-y-6 lg:space-y-8">
      {/* 1. Header: Compact on Mobile */}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5 sm:mb-1">
            <h1 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">
              Welcome back, {ownerName}! 👋
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-black flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3" />
              <span>Owner Portal</span>
            </span>
          </div>
          <p className="text-slate-500 text-[11px] sm:text-sm font-medium line-clamp-1 sm:line-clamp-none">
            Live command center for listings, tenant lead conversions, and wallet balance.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {/* Quick Deposit Button */}
          <button
            onClick={() => setIsAddFundsModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-all active:scale-95 shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            <span>Top Up Wallet</span>
          </button>

          {/* Add Property Button */}
          <Link
            href="/owner/properties"
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Building className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>Add Property</span>
          </Link>
        </div>
      </div>

      {/* Mount WalletWidget modal for fast deposits */}
      <WalletWidget 
        externalBalance={stats.walletBalance}
        onBalanceUpdate={(newBal) => {
          setStats((prev) => ({ ...prev, walletBalance: newBal }));
          fetchOverview();
        }}
        isModalOpenExternal={isAddFundsModalOpen}
        setIsModalOpenExternal={setIsAddFundsModalOpen}
        modalOnly={true}
      />

      {/* 2. Key Metrics: 2x2 Grid on Mobile (+ full-width Wallet Card) */}
      {isLoading ? (
        <div className="py-12 sm:py-16 text-center bg-white rounded-2xl sm:rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 sm:w-9 sm:h-9 animate-spin text-blue-600 mx-auto mb-2 sm:mb-3" />
          <p className="text-slate-500 font-bold text-xs sm:text-sm">Loading properties, leads, and wallet data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-5">
          {metrics.map((metric) => (
            <div
              key={metric.title}
              className={`bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-slate-300 hover:shadow-md transition-all relative overflow-hidden ${
                metric.isWallet ? "col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${metric.bg} ${metric.color} rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                >
                  {metric.icon}
                </div>

                {metric.action ? (
                  <button
                    onClick={metric.action}
                    className="text-[10px] sm:text-[11px] font-black text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-2 py-0.5 sm:py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {metric.actionLabel}
                  </button>
                ) : (
                  <Link
                    href={metric.href}
                    className="text-slate-400 hover:text-slate-600 p-0.5 sm:p-1 rounded-lg hover:bg-slate-100 transition-colors"
                    title={`View ${metric.title}`}
                  >
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Link>
                )}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-0.5 tracking-tight">
                  {metric.value}
                </h3>
                <p className="text-slate-800 font-extrabold text-[11px] sm:text-sm truncate">{metric.title}</p>
                <p className="text-slate-400 text-[10px] sm:text-[11px] mt-0.5 font-medium truncate">{metric.sub}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Quick Action Hub: 2x2 Grid on Mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
        {/* Card 1: Leads Marketplace */}
        <Link
          href="/owner/leads"
          className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-blue-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-black text-xs sm:text-base text-slate-900 truncate">Leads Marketplace</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed line-clamp-2">
              Browse tenant inquiries across Greater Noida & acquire leads.
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform">
            <span>Browse</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </Link>

        {/* Card 2: Purchased Leads */}
        <Link
          href="/owner/purchased-leads"
          className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Contact className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-black text-xs sm:text-base text-slate-900 truncate">Purchased Leads</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed line-clamp-2">
              Unlocked tenant directory with spreadsheet filters & export.
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
            <span>Directory</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </Link>

        {/* Card 3: My Properties */}
        <Link
          href="/owner/properties"
          className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-indigo-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-black text-xs sm:text-base text-slate-900 truncate">My Properties</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed line-clamp-2">
              Manage room vacancies, PG hostels, rent rates, and photos.
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-black text-indigo-600 group-hover:translate-x-1 transition-transform">
            <span>Manage</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </Link>

        {/* Card 4: Wallet & Deposits */}
        <button
          onClick={() => setIsAddFundsModalOpen(true)}
          className="text-left bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-white p-3.5 sm:p-5 lg:p-6 rounded-2xl sm:rounded-3xl border border-purple-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all group flex flex-col justify-between cursor-pointer"
        >
          <div className="space-y-1.5 sm:space-y-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition-transform">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-black text-xs sm:text-base text-slate-900 truncate">Wallet & Top Up</h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-tight sm:leading-relaxed line-clamp-2">
              Balance: <strong className="text-purple-700 font-black">₹{stats.walletBalance.toLocaleString("en-IN")}</strong>. Instant deposit to buy leads.
            </p>
          </div>
          <div className="mt-2.5 sm:mt-4 flex items-center gap-1 text-[11px] sm:text-xs font-black text-purple-600 group-hover:translate-x-1 transition-transform">
            <span>Deposit</span>
            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </div>
        </button>
      </div>

      {/* 4. Recently Unlocked Leads: 2x2 Grid on Mobile */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-3 sm:space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3.5">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
              <Contact className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0" />
              <span className="truncate">Recently Unlocked Leads</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs px-2 py-0.2 rounded-full font-black shrink-0">
                {stats.purchasedLeads}
              </span>
            </h2>
          </div>

          <Link
            href="/owner/purchased-leads"
            className="text-[11px] sm:text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentPurchasedLeads.length === 0 ? (
          <div className="py-6 sm:py-10 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center">
              <Contact className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-base">No Leads Unlocked Yet</h4>
            <p className="text-slate-500 text-[11px] sm:text-sm max-w-md mx-auto">
              Explore the Marketplace to unlock high-intent tenant contacts.
            </p>
            <Link
              href="/owner/leads"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
            {recentPurchasedLeads.map((lead) => (
              <div
                key={lead._id}
                className="bg-slate-50/70 hover:bg-slate-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-2 sm:space-y-3"
              >
                {/* Header: Avatar + Name */}
                <div>
                  <div className="flex items-center gap-2 mb-1.5 min-w-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-sm shadow-emerald-600/20">
                      {lead.tenantName[0]?.toUpperCase() || "T"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm truncate">
                        {lead.tenantName}
                      </h4>
                      <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded inline-block">
                        Unlocked
                      </span>
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="space-y-1 text-[10px] sm:text-xs text-slate-600 pt-0.5">
                    <div className="flex items-center gap-1 font-semibold text-slate-800 truncate">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                      <span className="truncate">{lead.area || lead.city}</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 font-medium">Budget</span>
                      <span className="font-extrabold text-emerald-700">
                        ₹{lead.budget ? `${Math.round(lead.budget / 1000)}k` : "10k"}/mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click Call & WhatsApp Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200/60">
                  <a
                    href={`tel:${lead.tenantPhone}`}
                    className="flex items-center justify-center gap-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`https://wa.me/${lead.tenantPhone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1 py-1.5 bg-green-500 hover:bg-green-600 text-white font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl shadow-xs active:scale-95 transition-all"
                  >
                    <span className="font-black">WA</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 5. My Properties: 2-Column Grid on Mobile */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-3.5 sm:p-6 lg:p-8 shadow-sm space-y-3 sm:space-y-5">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 sm:pb-3.5">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-lg lg:text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5 truncate">
              <Building className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
              <span className="truncate">My Properties</span>
              <span className="bg-indigo-100 text-indigo-800 text-[10px] sm:text-xs px-2 py-0.2 rounded-full font-black shrink-0">
                {stats.totalProperties}
              </span>
            </h2>
          </div>

          <Link
            href="/owner/properties"
            className="text-[11px] sm:text-xs font-black text-indigo-600 hover:text-indigo-700 hover:underline flex items-center gap-0.5 shrink-0"
          >
            <span>Manage All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProperties.length === 0 ? (
          <div className="py-6 sm:py-10 text-center space-y-2 sm:space-y-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 text-slate-400 rounded-xl sm:rounded-2xl mx-auto flex items-center justify-center">
              <Building className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h4 className="font-extrabold text-slate-800 text-xs sm:text-base">No Properties Listed</h4>
            <p className="text-slate-500 text-[11px] sm:text-sm max-w-md mx-auto">
              Add rooms or PG hostels to receive tenant inquiries.
            </p>
            <Link
              href="/owner/properties"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Property</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
            {recentProperties.map((property) => (
              <Link
                key={property._id}
                href="/owner/properties"
                className="bg-slate-50/70 hover:bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="p-2.5 sm:p-4 space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded truncate">
                      {property.type || "Room"}
                    </span>
                    <span className="text-[9px] sm:text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                      {property.status || "Active"}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm group-hover:text-blue-600 transition-colors line-clamp-1">
                    {property.title}
                  </h4>

                  <p className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 truncate font-medium">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{property.location?.area || property.location?.city || "Greater Noida"}</span>
                  </p>
                </div>

                <div className="px-2.5 py-2 sm:px-4 sm:py-2.5 bg-white border-t border-slate-200/60 flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs sm:text-sm">
                      ₹{property.rent ? `${Math.round(property.rent / 1000)}k` : "8k"}/mo
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-blue-600 flex items-center gap-0.5">
                    <span>Edit</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}

            {/* Quick Add Another Property Card */}
            <Link
              href="/owner/properties"
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col items-center justify-center text-center space-y-1 sm:space-y-1.5 hover:bg-blue-50/20 transition-all group cursor-pointer"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle className="w-4 h-4" />
              </div>
              <span className="font-black text-xs sm:text-sm text-slate-800 group-hover:text-blue-600 transition-colors">
                List Property
              </span>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Add PG rooms or flats
              </p>
            </Link>
          </div>
        )}
      </div>

      {/* 6. Dynamic Callout Banner: Compact on Mobile */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-6 shadow-xl shadow-blue-600/15">
        <div className="space-y-1 max-w-2xl">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Check className="w-4 h-4 sm:w-5 sm:h-5 text-blue-900 shrink-0" />
            <h2 className="text-xs sm:text-lg lg:text-xl font-black text-green-600 truncate">
              {stats.hotLeads > 0
                ? `You have ${stats.hotLeads} High-Intent Tenant Leads waiting!`
                : "Active Marketplace Inquiries Ready"}
            </h2>
          </div>
          <p className="text-blue-500 text-[11px] sm:text-sm leading-tight sm:leading-relaxed">
            {stats.hotLeads > 0
              ? "Tenants have submitted room inquiries in your area. Unlock their direct contacts before they book with competing properties."
              : "Explore verified student and professional requirements across your city to find your next prospective tenants."}
          </p>
        </div>

        <Link
          href="/owner/leads"
          className="w-full sm:w-auto text-center bg-white hover:bg-blue-50 text-blue-700 px-4 py-2 sm:px-6 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
        >
          <span>Go to Marketplace</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Link>
      </div>
    </div>
  );
}
