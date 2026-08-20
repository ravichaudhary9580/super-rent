"use client";

import { useState, useEffect } from "react";
import { Search, ShieldCheck, CheckCircle2, Loader2, Users, Building2, Award } from "lucide-react";

export default function GlobalLeads() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/leads");
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleToggleVerified = async (leadId: string, currentVerified: boolean) => {
    try {
      setUpdatingId(leadId);
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          isVerified: !currentVerified,
          leadType: !currentVerified ? "verified" : "shared",
          verificationNotes: !currentVerified ? "Budget, college, & move-in timeline verified by call team." : ""
        }),
      });

      if (res.ok) {
        await fetchLeads();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.tenantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.college?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Lead Distribution Oversight</h1>
        <p className="text-slate-500 mt-1 font-medium">Monitor, verify, and manage leads generated across the platform.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search leads by tenant name, area, or college..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span>Total Leads: {leads.length}</span>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Loading lead records...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Tenant</th>
                  <th className="py-4 px-6">Location / College</th>
                  <th className="py-4 px-6">Lead Category</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Distribution Status</th>
                  <th className="py-4 px-6 text-right">Verification Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                      No leads match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLeads.map((lead) => (
                    <tr key={lead._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-extrabold text-slate-900">{lead.tenantName}</p>
                        <p className="text-xs text-slate-400">{lead.tenantPhone || "Phone hidden"}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-800">{lead.area || "North Campus"}</p>
                        <p className="text-xs text-slate-500">{lead.college || "Nearby College"}</p>
                      </td>
                      <td className="py-4 px-6">
                        {lead.leadType === "exclusive" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            <Building2 className="w-3.5 h-3.5" /> Exclusive
                          </span>
                        ) : lead.leadType === "verified" || lead.isVerified ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                            <ShieldCheck className="w-3.5 h-3.5" /> Verified
                          </span>
                        ) : lead.leadType === "pay_per_booking" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                            <Award className="w-3.5 h-3.5" /> Pay-Per-Booking
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                            <Users className="w-3.5 h-3.5" /> Shared
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 font-extrabold text-slate-900">
                        ₹{lead.price}
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {lead.unlockedBy?.length || 0} / {lead.maxBuyers || 4} Buyers
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleVerified(lead._id, lead.isVerified)}
                          disabled={updatingId === lead._id}
                          className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all inline-flex items-center gap-1.5 ${
                            lead.isVerified
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {updatingId === lead._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>{lead.isVerified ? "Verified (Click to Reset)" : "Verify Lead (Call Team)"}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
