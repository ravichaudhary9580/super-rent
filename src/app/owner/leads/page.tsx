"use client";

import { useState, useEffect } from "react";
import { LeadCard, LeadCardData } from "@/components/LeadCard";
import { WalletWidget } from "@/components/WalletWidget";
import { 
  Users, 
  Building2, 
  ShieldCheck, 
  Award, 
  Filter, 
  Loader2,
  LayoutGrid,
  List,
  Lock,
  Unlock,
  Phone,
  MapPin,
  Calendar,
  Flame,
  User,
  CheckCircle2
} from "lucide-react";

export default function LeadsMarketplace() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [leads, setLeads] = useState<LeadCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number>(500);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);

  const fetchLeads = async (typeFilter?: string) => {
    try {
      setIsLoading(true);
      setError("");
      const param = typeFilter && typeFilter !== "all" ? `?leadType=${typeFilter}` : "";
      const res = await fetch(`/api/leads${param}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads(activeTab);
  }, [activeTab]);

  const handleUnlockLead = async (leadId: string) => {
    try {
      setUnlockingId(leadId);
      const res = await fetch("/api/leads/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to unlock lead");
        throw new Error(data.error);
      }

      // Refresh leads and balance
      await fetchLeads(activeTab);
      if (data.newBalance !== undefined) {
        setWalletBalance(data.newBalance);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUnlockingId(null);
    }
  };

  const filteredLeads = activeTab === "all" 
    ? leads 
    : leads.filter(l => l.leadType === activeTab);

  const newAvailableLeads = filteredLeads.filter(l => !l.isUnlocked);
  const unlockedLeads = filteredLeads.filter(l => l.isUnlocked);

  const getLeadTypeBadge = (lead: LeadCardData) => {
    switch (lead.leadType) {
      case "exclusive":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-indigo-600" /> Exclusive
          </span>
        );
      case "verified":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
          </span>
        );
      case "pay_per_booking":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Booking
          </span>
        );
      case "shared":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Users className="w-3 h-3 text-blue-600" /> Shared ({lead.buyerCount || 0}/{lead.maxBuyers || 4})
          </span>
        );
    }
  };

  const renderLeadsTable = (leadList: LeadCardData[], isUnlockedSection: boolean = false) => {
    return (
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                <th className="py-4 px-6">Tenant Name</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Location & College</th>
                <th className="py-4 px-6">Budget</th>
                <th className="py-4 px-6">Move-in</th>
                <th className="py-4 px-6 text-right">Price / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
              {leadList.map((lead) => {
                const leadId = lead._id || lead.id || "";
                const isUnlockingThis = unlockingId === leadId;

                return (
                  <tr key={leadId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Tenant Info / Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          lead.isUnlocked 
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' 
                            : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-inner'
                        }`}>
                          {lead.isUnlocked ? (
                            lead.tenantName[0]?.toUpperCase() || "T"
                          ) : (
                            <Lock className="w-5 h-5 text-slate-400" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            {lead.isUnlocked ? (
                              <span className="font-extrabold text-slate-900">{lead.tenantName}</span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-slate-700 text-xs">Locked Tenant</span>
                                <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">Locked</span>
                              </div>
                            )}

                            {lead.temperature === "hot" && (
                              <span className="inline-flex items-center text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-200 px-1.5 py-0.5 rounded">
                                <Flame className="w-3 h-3 mr-0.5" /> HOT
                              </span>
                            )}
                          </div>

                          {lead.isUnlocked ? (
                            <a href={`tel:${lead.tenantPhone}`} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" />
                              <span>{lead.tenantPhone || "+91 98765 43210"}</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                              <Lock className="w-3 h-3 text-slate-400" /> Unlock to view contact
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category Type */}
                    <td className="py-4 px-6">
                      {getLeadTypeBadge(lead)}
                    </td>

                    {/* Location & College */}
                    <td className="py-4 px-6">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{lead.area || "Area Matched"}</span>
                        </div>
                        <div className={`text-xs truncate max-w-[180px] ${lead.isUnlocked ? "text-slate-500 font-medium" : "text-slate-400 italic"}`}>
                          {lead.isUnlocked ? (lead.college || "Nearby Campus") : "Locked until purchased"}
                        </div>
                      </div>
                    </td>

                    {/* Budget */}
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-xs">
                        ₹{lead.budget ? lead.budget.toLocaleString("en-IN") : "12,000"}/mo
                      </span>
                    </td>

                    {/* Move-in timeline */}
                    <td className="py-4 px-6 text-slate-600 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className={lead.isUnlocked ? "font-semibold text-slate-700" : "text-slate-400 italic"}>
                          {lead.isUnlocked ? (lead.moveInTimeline || "Immediate") : "Locked"}
                        </span>
                      </div>
                    </td>

                    {/* Price / Action Button */}
                    <td className="py-4 px-6 text-right">
                      {lead.isUnlocked ? (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200">
                          <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Unlocked
                        </div>
                      ) : lead.isSoldOut ? (
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                          Sold Out
                        </span>
                      ) : (
                        <button
                          onClick={() => handleUnlockLead(leadId)}
                          disabled={isUnlockingThis}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                        >
                          {isUnlockingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>Buy Lead (₹{lead.price})</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Buyer Leads Marketplace</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Acquire high-intent tenant leads matching your hostel's area, budget, and target college.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle: Cards vs Table */}
          <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "card"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === "table"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Dense Table View"
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Wallet Widget */}
      <WalletWidget onBalanceUpdate={(b) => setWalletBalance(b)} />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: "all", label: "All Leads", icon: Filter },
          { id: "shared", label: "Shared Leads (₹49)", icon: Users },
          { id: "exclusive", label: "Exclusive Leads (₹249)", icon: Building2 },
          { id: "verified", label: "Verified / Qualified (₹499)", icon: ShieldCheck },
          { id: "pay_per_booking", label: "Pay-Per-Booking (₹20k)", icon: Award },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content (Card vs Table View) */}
      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Matching leads to your buyer filters...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl font-bold text-sm text-center">
          {error}
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* New Available Leads Section */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>Available Leads for Purchase</span>
                <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                  {newAvailableLeads.length}
                </span>
              </h2>
            </div>

            {newAvailableLeads.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No New Leads Available</h3>
                <p className="text-slate-500 text-sm">New tenant and student inquiries matching your location and budget will appear here automatically.</p>
              </div>
            ) : viewMode === "card" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {newAvailableLeads.map((lead) => (
                  <LeadCard key={lead._id || lead.id} lead={lead} onUnlock={handleUnlockLead} />
                ))}
              </div>
            ) : (
              renderLeadsTable(newAvailableLeads, false)
            )}
          </div>

          {/* Purchased / Unlocked Leads Section */}
          {unlockedLeads.length > 0 && (
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Purchased Leads</span>
                  <span className="bg-emerald-100 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                    {unlockedLeads.length}
                  </span>
                </h2>
              </div>

              {viewMode === "card" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {unlockedLeads.map((lead) => (
                    <LeadCard key={lead._id || lead.id} lead={lead} />
                  ))}
                </div>
              ) : (
                renderLeadsTable(unlockedLeads, true)
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
