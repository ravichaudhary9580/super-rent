"use client";

import { useState, useEffect } from "react";
import { Save, Users, Building2, ShieldCheck, Award, Loader2, CheckCircle2 } from "lucide-react";

export default function PricingControl() {
  const [sharedLeadPrice, setSharedLeadPrice] = useState<number>(49);
  const [exclusiveLeadPrice, setExclusiveLeadPrice] = useState<number>(249);
  const [verifiedLeadPrice, setVerifiedLeadPrice] = useState<number>(499);
  const [payPerBookingCommission, setPayPerBookingCommission] = useState<number>(20000);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/pricing");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSharedLeadPrice(data.settings.sharedLeadPrice || 49);
          setExclusiveLeadPrice(data.settings.exclusiveLeadPrice || 249);
          setVerifiedLeadPrice(data.settings.verifiedLeadPrice || 499);
          setPayPerBookingCommission(data.settings.payPerBookingCommission || 20000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMessage("");

      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sharedLeadPrice,
          exclusiveLeadPrice,
          verifiedLeadPrice,
          payPerBookingCommission
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save pricing");

      setMessage("Lead pricing configuration updated successfully!");
      setTimeout(() => setMessage(""), 4000);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto md:mx-0 space-y-8">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Lead Pricing Control</h1>
        <p className="text-slate-500 mt-1 font-medium">Configure base prices and commission rates for all 4 revenue model lead categories.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 ${message.startsWith("Error") ? "bg-red-50 text-red-600 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Loading pricing parameters...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 sm:p-8 space-y-8">
            
            {/* Shared Lead Pricing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 text-blue-600 p-3.5 rounded-2xl shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Shared Lead</h3>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">Suggested: ₹30 - ₹80</span>
                  </div>
                  <p className="text-slate-500 text-sm max-w-lg mt-1">Lead is sold to up to 3–4 hostels in matching area/budget. Maximum distribution reach.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  value={sharedLeadPrice}
                  onChange={(e) => setSharedLeadPrice(Number(e.target.value))}
                  className="w-28 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Exclusive Lead Pricing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <div className="flex items-start gap-4">
                <div className="bg-indigo-100 text-indigo-600 p-3.5 rounded-2xl shrink-0">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Exclusive Lead</h3>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">Suggested: ₹150 - ₹400</span>
                  </div>
                  <p className="text-slate-500 text-sm max-w-lg mt-1">Sold to one hostel only. Immediately locks after first purchase so no competitor receives it.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  value={exclusiveLeadPrice}
                  onChange={(e) => setExclusiveLeadPrice(Number(e.target.value))}
                  className="w-28 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Verified / Qualified Lead Pricing */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-slate-100 pb-8">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 text-emerald-600 p-3.5 rounded-2xl shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">Verified / Qualified Lead</h3>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">Suggested: ₹300 - ₹800</span>
                  </div>
                  <p className="text-slate-500 text-sm max-w-lg mt-1">Budget, college, & move-in timeline pre-verified by calling team. Highest conversion rate.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-slate-500 font-bold">₹</span>
                <input
                  type="number"
                  value={verifiedLeadPrice}
                  onChange={(e) => setVerifiedLeadPrice(Number(e.target.value))}
                  className="w-28 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {/* Pay-Per-Booking Commission */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-amber-50/50 p-6 rounded-2xl border border-amber-200/60">
              <div className="flex items-start gap-4">
                <div className="bg-amber-100 text-amber-800 p-3.5 rounded-2xl shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-amber-950">Pay-Per-Booking (existing)</h3>
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">Suggested: ₹20,000</span>
                  </div>
                  <p className="text-amber-800/80 text-sm max-w-lg mt-1">Commission model charged only upon confirmed tenant booking success.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-amber-800 font-bold">₹</span>
                <input
                  type="number"
                  value={payPerBookingCommission}
                  onChange={(e) => setPayPerBookingCommission(Number(e.target.value))}
                  className="w-32 px-4 py-2.5 bg-white border border-amber-300 rounded-xl text-lg font-black text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
                />
              </div>
            </div>

          </div>
          
          {/* Footer Save Button */}
          <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{isSaving ? "Saving Configuration..." : "Save Pricing Configuration"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
