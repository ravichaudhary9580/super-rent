"use client";

import { useState } from "react";
import { 
  User, 
  Flame, 
  Sun, 
  Lock, 
  Unlock, 
  IndianRupee, 
  CheckCircle2, 
  Users, 
  Building2, 
  MapPin, 
  Calendar, 
  Loader2,
  ShieldCheck,
  Award
} from "lucide-react";

export interface LeadCardData {
  _id?: string;
  id?: string;
  tenantName: string;
  tenantPhone?: string;
  college?: string;
  area?: string;
  budget?: number;
  gender?: "male" | "female" | "any";
  moveInTimeline?: string;
  leadType: "shared" | "exclusive" | "verified" | "pay_per_booking";
  temperature?: "hot" | "warm" | "cold";
  price: number;
  maxBuyers?: number;
  buyerCount?: number;
  isUnlocked: boolean;
  isSoldOut?: boolean;
  isVerified?: boolean;
  verificationNotes?: string;
}

interface LeadCardProps {
  lead: LeadCardData;
  onUnlock?: (leadId: string) => Promise<void>;
}

export function LeadCard({ lead, onUnlock }: LeadCardProps) {
  const [isUnlocking, setIsUnlocking] = useState(false);
  const leadId = lead._id || lead.id || "";

  const handleUnlockClick = async () => {
    if (!onUnlock || !leadId || lead.isUnlocked || lead.isSoldOut) return;
    try {
      setIsUnlocking(true);
      await onUnlock(leadId);
    } catch (err) {
      console.error("Unlock error:", err);
    } finally {
      setIsUnlocking(false);
    }
  };

  const getTypeBadge = () => {
    switch (lead.leadType) {
      case "exclusive":
        return (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-indigo-700 bg-indigo-100/90 border border-indigo-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-indigo-600" /> Exclusive (1 Buyer Only)
          </span>
        );
      case "verified":
        return (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Lead
          </span>
        );
      case "pay_per_booking":
        return (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Award className="w-3.5 h-3.5 text-amber-600" /> Pay-Per-Booking
          </span>
        );
      case "shared":
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-100/90 border border-blue-200 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Users className="w-3 h-3 text-blue-600" /> Shared ({lead.buyerCount || 0}/{lead.maxBuyers || 4} Sold)
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-3xl border ${
      lead.isVerified 
        ? "border-emerald-300 shadow-emerald-100/60" 
        : lead.leadType === "exclusive"
        ? "border-indigo-300 shadow-indigo-100/60"
        : "border-slate-200 shadow-slate-200/50"
    } shadow-sm overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300`}>
      
      {/* Top Header Badge Row */}
      <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
        {getTypeBadge()}
        {lead.temperature === "hot" && (
          <span className="flex items-center text-[10px] font-black text-orange-600 bg-orange-100/80 border border-orange-200 px-2 py-0.5 rounded-md">
            <Flame className="w-3 h-3 mr-0.5" /> HOT
          </span>
        )}
      </div>

      {/* Main Body */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        
        {/* User Identity / Avatar */}
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
            lead.isUnlocked 
              ? 'bg-emerald-600 text-white font-extrabold text-xl shadow-md shadow-emerald-600/20' 
              : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-inner'
          }`}>
            {lead.isUnlocked ? (
              <span>{lead.tenantName[0]?.toUpperCase() || "T"}</span>
            ) : (
              <Lock className="w-6 h-6 text-slate-400" />
            )}
          </div>

          <div className="overflow-hidden">
            {lead.isUnlocked ? (
              <>
                <h3 className="text-lg font-extrabold text-slate-900 truncate">{lead.tenantName}</h3>
                <a href={`tel:${lead.tenantPhone}`} className="text-sm font-extrabold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5">
                  {lead.tenantPhone || "+91 98765 43210"}
                </a>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Tenant Profile</span>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Locked</span>
                </div>
                <p className="text-slate-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                  <Lock className="w-3 h-3 text-slate-400" /> Unlock to reveal full contact
                </p>
              </>
            )}
          </div>
        </div>

        {/* Lead Preferences Grid */}
        <div className="bg-slate-50/70 border border-slate-100 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> Target Area:
            </span>
            <span className="font-bold text-slate-800">{lead.area || "Area Matched"}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <Building2 className="w-3.5 h-3.5 text-indigo-500" /> College:
            </span>
            <span className={`font-bold ${lead.isUnlocked ? "text-slate-800 truncate max-w-[140px]" : "text-slate-400 italic"}`}>
              {lead.isUnlocked ? (lead.college || "Nearby Campus") : "Locked until purchased"}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Budget Range:
            </span>
            <span className="font-bold text-slate-900 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-100">
              ₹{lead.budget ? lead.budget.toLocaleString("en-IN") : "12,000"}/mo
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5 font-medium text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Move-in:
            </span>
            <span className={`font-bold ${lead.isUnlocked ? "text-slate-800" : "text-slate-400 italic"}`}>
              {lead.isUnlocked ? (lead.moveInTimeline || "Immediate") : "Locked"}
            </span>
          </div>
        </div>

        {/* Verified Notes Callout (if verified lead) */}
        {lead.isVerified && (
          <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Verified by Calling Team:</strong> {lead.isUnlocked ? (lead.verificationNotes || "Budget, college, & move-in timeline verified.") : "Pre-screened student intent. Full phone and audit report unlocked upon purchase."}
            </span>
          </div>
        )}
      </div>

      {/* Footer Action Button */}
      <div className="p-5 pt-0 mt-auto">
        {lead.isUnlocked ? (
          <div className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-50 text-emerald-700 font-extrabold text-sm rounded-2xl border border-emerald-200">
            <Unlock className="w-4 h-4 text-emerald-600" /> Contact Unlocked
          </div>
        ) : lead.isSoldOut ? (
          <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl border border-slate-200 cursor-not-allowed">
            Sold Out (Max Capacity)
          </button>
        ) : (
          <button
            onClick={handleUnlockClick}
            disabled={isUnlocking}
            className="w-full flex justify-between items-center py-3.5 px-5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-slate-900/10 transition-all duration-200 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {isUnlocking ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Lock className="w-4 h-4 text-blue-400" />}
              <span>{isUnlocking ? "Unlocking..." : "Buy Lead"}</span>
            </span>
            <span className="flex items-center bg-slate-800 text-emerald-400 px-3 py-1 rounded-xl font-black text-sm border border-slate-700">
              ₹{lead.price}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
