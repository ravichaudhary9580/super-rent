"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Building, Loader2 } from "lucide-react";

export default function PropertyModeration() {
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Property Moderation</h1>
        <p className="text-slate-500 text-sm mt-1">Review, approve, or reject new property listings.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Loading properties for review...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <Building className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No properties to review</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              All submitted listings have been processed or no new listings have been uploaded yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-6">Property Title</th>
                  <th className="py-4 px-6">Type & Location</th>
                  <th className="py-4 px-6">Rent</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {properties.map((prop) => {
                  const propId = prop._id || prop.id;
                  const loc = typeof prop.location === "object"
                    ? `${prop.location.area}, ${prop.location.city}`
                    : prop.location || "N/A";

                  return (
                    <tr key={propId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{prop.title}</td>
                      <td className="py-4 px-6 text-slate-600 text-sm">
                        <span className="font-semibold text-slate-800">{prop.type}</span> • {loc}
                      </td>
                      <td className="py-4 px-6 text-slate-900 font-bold">₹{prop.price.toLocaleString()}/mo</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
                          prop.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {prop.status || "Pending"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-colors">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
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
