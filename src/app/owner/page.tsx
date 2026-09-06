"use client";

import { useState, useEffect } from "react";
import { Building, DollarSign, TrendingUp, Users, Loader2, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({
    activeListings: 0,
    totalProperties: 0,
    totalLeads: 0,
    hotLeads: 0,
    purchasedLeads: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/owner/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch owner overview:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const metrics = [
    {
      title: "Active Listings",
      value: stats.activeListings,
      sub: `${stats.totalProperties} total properties`,
      icon: <Building className="h-6 w-6" />,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/owner/properties"
    },
    {
      title: "Total Leads Available",
      value: stats.totalLeads,
      sub: "Active tenant inquiries",
      icon: <Users className="h-6 w-6" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/owner/leads"
    },
    {
      title: "Hot Leads",
      value: stats.hotLeads,
      sub: "High intent buyers",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-orange-600",
      bg: "bg-orange-50",
      href: "/owner/leads"
    },
    {
      title: "Purchased Leads",
      value: stats.purchasedLeads,
      sub: "Unlocked contacts",
      icon: <DollarSign className="h-6 w-6" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/owner/leads"
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Owner Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Live overview of your listings, lead volume, and tenant contacts.</p>
        </div>
        <Link
          href="/owner/properties"
          className="dashboard-btn w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2"
        >
          <Building className="h-4 w-4" />
          <span>Add Property</span>
        </Link>
      </div>

      {/* Metrics */}
      {isLoading ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 dashboard-card-rise">
          <Loader2 className="w-9 h-9 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Loading your properties and leads...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((metric, idx) => (
            <Link
              key={metric.title}
              href={metric.href}
              className={`dashboard-card dashboard-card-rise stagger-${idx + 1} bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4 sm:block group hover:border-slate-300 transition-all`}
            >
              <div
                className={`w-12 h-12 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center sm:mb-4 shrink-0 group-hover:scale-110 transition-transform duration-300`}
              >
                {metric.icon}
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">
                  {metric.value.toLocaleString("en-IN")}
                </h3>
                <p className="text-slate-800 font-bold text-xs sm:text-sm">{metric.title}</p>
                <p className="text-slate-400 text-[11px] mt-0.5">{metric.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Dynamic Callout Banner */}
      <div className="dashboard-card-rise stagger-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 border border-blue-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-black text-blue-950">
              {stats.hotLeads > 0
                ? `You have ${stats.hotLeads} Hot ${stats.hotLeads === 1 ? "Lead" : "Leads"} waiting!`
                : "Marketplace Inquiries Active"}
            </h2>
          </div>
          <p className="text-blue-800 text-xs sm:text-sm max-w-2xl leading-relaxed">
            {stats.hotLeads > 0
              ? "Tenants are actively looking for rooms in your area right now. Unlock their contact info to reach out and close deals before they book elsewhere."
              : "Explore verified student and professional requirements across your city to find your next prospective tenants."}
          </p>
        </div>
        <Link
          href="/owner/leads"
          className="dashboard-btn w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-2"
        >
          <span>Go to Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

