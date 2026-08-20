"use client";

import { useState, useEffect } from "react";
import { Users, Building, DollarSign, Activity, Loader2, Sparkles, ArrowRight, ShieldCheck, List } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTenants: 0,
    totalOwners: 0,
    activeListings: 0,
    totalLeads: 0,
    totalRevenue: 0,
    platformHealth: "100% Operational"
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/admin/overview");
        if (res.ok) {
          const data = await res.json();
          if (data.stats) {
            setStats(data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { 
      title: "Total Registered Users", 
      value: stats.totalUsers.toLocaleString("en-IN"), 
      sub: `${stats.totalOwners} Owners • ${stats.totalTenants} Tenants`,
      icon: <Users className="h-6 w-6" />, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      href: "/admin/users"
    },
    { 
      title: "Active Properties", 
      value: stats.activeListings.toLocaleString("en-IN"), 
      sub: "Verified live listings",
      icon: <Building className="h-6 w-6" />, 
      color: "text-indigo-600", 
      bg: "bg-indigo-50",
      href: "/admin/properties"
    },
    { 
      title: "Total Marketplace Leads", 
      value: stats.totalLeads.toLocaleString("en-IN"), 
      sub: "Active student & tenant inquiries",
      icon: <List className="h-6 w-6" />, 
      color: "text-purple-600", 
      bg: "bg-purple-50",
      href: "/admin/leads"
    },
    { 
      title: "Lead Sales Revenue", 
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`, 
      sub: "Total unlocked lead volume",
      icon: <DollarSign className="h-6 w-6" />, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      href: "/admin/owners"
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Admin Overview</h1>
          <p className="text-slate-500 text-sm mt-1">Live platform health, user analytics, and system metrics.</p>
        </div>
        
        <Link 
          href="/admin/leads"
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-sm transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Review Leads</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Calculating platform metrics...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {cards.map((metric) => (
            <Link 
              key={metric.title} 
              href={metric.href}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${metric.bg} ${metric.color} rounded-2xl flex items-center justify-center shrink-0`}>
                  {metric.icon}
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-0.5">{metric.value}</h3>
                  <p className="text-slate-800 font-bold text-xs">{metric.title}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">{metric.sub}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Link 
          href="/admin/leads"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs">Leads Distribution</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-base">Global Leads Oversight</h4>
          <p className="text-slate-500 text-xs mt-1">Verify tenant requirements, edit lead pricing, and adjust exclusivity.</p>
        </Link>

        <Link 
          href="/admin/owners"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs">Wallet & Revenue</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-base">Hostel & PG Owners</h4>
          <p className="text-slate-500 text-xs mt-1">Grant manual wallet credits, monitor lead transactions, and view accounts.</p>
        </Link>

        <Link 
          href="/admin/theme"
          className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="p-2.5 bg-purple-50 text-purple-600 rounded-xl font-bold text-xs">Portal Customization</span>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
          </div>
          <h4 className="font-extrabold text-slate-900 text-base">Brand Theme Studio</h4>
          <p className="text-slate-500 text-xs mt-1">Configure brand color presets, light/dark appearance, and UI display scale.</p>
        </Link>
      </div>

      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
          <h2 className="text-lg sm:text-xl font-bold">System Status: {stats.platformHealth}</h2>
        </div>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          MongoDB cluster connected, NextAuth session management active, and lead distribution engine running smoothly.
        </p>
      </div>
    </div>
  );
}
