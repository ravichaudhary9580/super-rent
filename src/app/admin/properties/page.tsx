"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Building, Loader2, Search, ExternalLink, Clock, Check, AlertCircle, Eye, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function PropertyModeration() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("Pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/properties?status=all");
      if (res.ok) {
        const data = await res.json();
        setProperties(data.properties || []);
      }
    } catch (err) {
      console.error("Failed to load moderation properties:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/properties/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setProperties(prev => prev.map(p => {
          if ((p._id || p.id) === id) return { ...p, status: newStatus };
          return p;
        }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const pendingCount = properties.filter(p => !p.status || p.status === "Pending").length;
  const activeCount = properties.filter(p => p.status === "Active").length;
  const rejectedCount = properties.filter(p => p.status === "Rejected").length;

  const filteredProperties = properties.filter(prop => {
    const currentStatus = prop.status || "Pending";
    const matchesFilter = filterStatus === "All" || currentStatus === filterStatus;
    const matchesSearch = !searchTerm || 
      prop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location?.area?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 uppercase tracking-wide">
            Admin Moderation
          </span>
          <span className="text-xs font-semibold text-slate-400">• Approval Queue</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Property Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review newly submitted listings. Listings default to <strong>Pending</strong> and only become live to tenants once approved here.
        </p>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div 
          onClick={() => setFilterStatus("Pending")}
          className={`p-5 rounded-3xl border cursor-pointer transition-all shadow-sm ${
            filterStatus === "Pending" ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Pending Review</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900 mt-2">{pendingCount}</p>
          <span className="text-[11px] text-amber-700 font-medium">Awaiting admin approval</span>
        </div>

        <div 
          onClick={() => setFilterStatus("Active")}
          className={`p-5 rounded-3xl border cursor-pointer transition-all shadow-sm ${
            filterStatus === "Active" ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase">Live Listings</span>
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-900 mt-2">{activeCount}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Approved & visible to tenants</span>
        </div>

        <div 
          onClick={() => setFilterStatus("Rejected")}
          className={`p-5 rounded-3xl border cursor-pointer transition-all shadow-sm ${
            filterStatus === "Rejected" ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase">Rejected</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-900 mt-2">{rejectedCount}</p>
          <span className="text-[11px] text-rose-700 font-medium">Needs owner corrections</span>
        </div>

        <div 
          onClick={() => setFilterStatus("All")}
          className={`p-5 rounded-3xl border cursor-pointer transition-all shadow-sm ${
            filterStatus === "All" ? "bg-slate-100 border-slate-300 ring-2 ring-slate-400" : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">Total Listings</span>
            <Building className="w-5 h-5 text-slate-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{properties.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">All database listings</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, city, or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: "Pending", label: `Pending (${pendingCount})` },
            { id: "Active", label: `Live (${activeCount})` },
            { id: "Rejected", label: `Rejected (${rejectedCount})` },
            { id: "All", label: `All (${properties.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterStatus === tab.id
                  ? "bg-white text-purple-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Loading properties for review...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="p-16 text-center space-y-3 max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Queue is Clear</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              No properties found matching status <span className="font-bold text-slate-800">&quot;{filterStatus}&quot;</span>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Property</th>
                  <th className="py-4 px-6">Type & Location</th>
                  <th className="py-4 px-6">Price / Terms</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {filteredProperties.map((prop) => {
                  const propId = prop._id || prop.id;
                  const loc = typeof prop.location === "object"
                    ? `${prop.location.area}, ${prop.location.city}`
                    : prop.location || "N/A";
                  const firstImg = prop.images && prop.images.length > 0 ? prop.images[0] : null;
                  const status = prop.status || "Pending";
                  const isUpdating = updatingId === propId;

                  return (
                    <tr key={propId} className="hover:bg-slate-50/60 transition-colors">
                      {/* Property Thumbnail & Title */}
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            {firstImg ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={firstImg} alt={prop.title} className="w-full h-full object-cover" />
                            ) : (
                              <Building className="w-6 h-6 text-slate-400 m-auto mt-3" />
                            )}
                          </div>
                          <div>
                            <span className="block text-slate-900 font-bold text-sm line-clamp-1">{prop.title}</span>
                            <span className="text-[11px] text-slate-400 font-normal">
                              {prop.images?.length || 0} photos • {prop.genderPreference || "Anyone"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Type & Location */}
                      <td className="py-4 px-6 text-slate-600 text-xs">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                            {prop.type}
                          </span>
                          {prop.sharingOptions && prop.sharingOptions.length > 0 ? (
                            prop.sharingOptions.map((opt: string, i: number) => (
                              <span key={i} className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                                {opt}
                              </span>
                            ))
                          ) : prop.occupancy ? (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                              {prop.occupancy}
                            </span>
                          ) : null}
                        </div>
                        <span className="text-slate-500 block mt-1">{loc}</span>
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-6">
                        <div className="font-black text-slate-900 text-sm flex items-center">
                          <IndianRupee className="w-3.5 h-3.5 text-blue-600 mr-0.5" />
                          {Number(prop.price).toLocaleString()}
                          <span className="text-xs font-normal text-slate-400 ml-1">
                            {prop.pricingCycle === "Annually" ? "/yr" : "/mo"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {prop.pricingCycle === "Annually" && (
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                              Annual
                            </span>
                          )}
                          {prop.roomPricings && prop.roomPricings.length > 0 && (
                            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              {prop.roomPricings.length} Seater Rates
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-6">
                        {status === "Active" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Live
                          </span>
                        ) : status === "Rejected" ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending Review
                          </span>
                        )}
                      </td>

                      {/* Moderation Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Link
                            href={`/properties/${propId}`}
                            target="_blank"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Preview Property"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>

                          {status !== "Active" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(propId, "Active")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Approve (Make Live)</span>
                            </button>
                          )}

                          {status !== "Rejected" && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusUpdate(propId, "Rejected")}
                              className="bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
