"use client";

import { useState } from "react";
import { 
  User, 
  Lock, 
  IndianRupee, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Calendar, 
  Loader2,
  Phone,
  GraduationCap
} from "lucide-react";

export interface LeadCardData {
  _id?: string;
  id?: string;
  tenantName: string;
  tenantPhone?: string;
  rawPhone?: string;
  city?: string;
  college?: string;
  area?: string;
  budget?: number;
  maskedBudget?: string;
  gender?: "male" | "female" | "any";
  moveInTimeline?: string;
  leadType?: "shared" | "exclusive" | "verified" | "pay_per_booking";
  category?: "signup" | "opened_property" | "tried_to_contact" | "conversion_system";
  price: number;
  maxBuyers?: number;
  buyerCount?: number;
  isUnlocked: boolean;
  isSoldOut?: boolean;
  isVerified?: boolean;
  verificationNotes?: string;
  property?: any;
}

interface LeadCardProps {
  lead: LeadCardData;
  onUnlock?: (leadId: string) => Promise<void>;
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (leadId: string) => void;
}

export function LeadCard({ lead, onUnlock, selectable, isSelected, onToggleSelect }: LeadCardProps) {
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

  const isAvailable = !lead.isUnlocked && !lead.isSoldOut;

  return (
    <div className={`bg-white rounded-3xl border transition-all duration-300 shadow-sm overflow-hidden flex flex-col hover:shadow-xl ${
      isSelected
        ? "ring-2 ring-blue-500 border-blue-500 shadow-blue-100"
        : lead.category === "tried_to_contact"
        ? "border-orange-300 shadow-orange-100/60"
        : lead.category === "conversion_system"
        ? "border-purple-300 shadow-purple-100/60"
        : lead.category === "opened_property"
        ? "border-indigo-300 shadow-indigo-100/60"
        : "border-slate-200 shadow-slate-200/50"
    }`}>
      
      {/* Top Header Row: Selection Checkbox, Gender Badge & Target City */}
      <div className={`p-4 border-b flex items-center justify-between gap-2 transition-colors ${
        isSelected ? "bg-blue-50/70 border-blue-100" : "bg-slate-50/80 border-slate-100"
      }`}>
        {/* Checkbox & Gender Badge */}
        <div className="flex items-center gap-2">
          {selectable && isAvailable && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect && onToggleSelect(leadId)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
              title="Select lead for bulk buy"
            />
          )}
          {lead.gender === "female" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-pink-700 bg-pink-50 border border-pink-200 px-2.5 py-0.5 rounded-full">
              <User className="w-3 h-3 text-pink-500" /> Female
            </span>
          ) : lead.gender === "male" ? (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
              <User className="w-3 h-3 text-blue-500" /> Male
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              <User className="w-3 h-3 text-slate-500" /> Any Gender
            </span>
          )}
        </div>

        {/* Target City */}
        <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 shadow-xs">
          {lead.city || "Greater Noida"}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        
        {/* User Identity / Avatar & Phone */}
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
            lead.isUnlocked 
              ? 'bg-emerald-600 text-white font-extrabold text-lg shadow-md shadow-emerald-600/20' 
              : 'bg-slate-100 text-slate-400 border border-slate-200 shadow-inner'
          }`}>
            {lead.isUnlocked ? (
              <span>{lead.tenantName[0]?.toUpperCase() || "T"}</span>
            ) : (
              <Lock className="w-5 h-5 text-slate-400" />
            )}
          </div>

          <div className="overflow-hidden min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-extrabold text-slate-900 truncate">{lead.tenantName}</h3>
              {!lead.isUnlocked && (
                <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                  Masked
                </span>
              )}
            </div>

            {lead.isUnlocked ? (
              <a href={`tel:${lead.rawPhone || lead.tenantPhone}`} className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{lead.rawPhone || lead.tenantPhone}</span>
              </a>
            ) : (
              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5 font-medium">
                <Lock className="w-3 h-3 text-slate-400" /> {lead.tenantPhone || "+91 98*** ***00"}
              </span>
            )}
          </div>
        </div>

        {/* Detailed Tenant Attributes Grid */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-3.5 space-y-2.5 text-xs">
          {/* College / Company */}
          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
              <GraduationCap className="w-3.5 h-3.5 text-purple-600" /> College / Co.:
            </span>
            <span className="font-bold text-slate-800 capitalize truncate text-right">
              {lead.college || "General Tenant"}
            </span>
          </div>

          {/* Target Location */}
          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> Target Location:
            </span>
            <span className="font-bold text-slate-800 truncate text-right">
              {lead.area || "Area Matched"}
            </span>
          </div>

          {/* Property Revealed */}
          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-600" /> Property:
            </span>
            {lead.property?.title ? (
              <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 truncate max-w-[140px] text-right">
                {lead.property.title}
              </span>
            ) : (
              <span className="text-slate-400 italic text-right">
                None (City Lead)
              </span>
            )}
          </div>

          {/* Budget */}
          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> Budget:
            </span>
            {lead.isUnlocked ? (
              <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-right">
                ₹{lead.budget ? lead.budget.toLocaleString("en-IN") : "10,000"}/mo
              </span>
            ) : (
              <span className="font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-right flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" /> {lead.maskedBudget || "₹**,***/mo"}
              </span>
            )}
          </div>

          {/* Move-in */}
          <div className="flex items-center justify-between text-slate-600 gap-2">
            <span className="flex items-center gap-1.5 font-medium text-slate-500 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-amber-500" /> Move-in:
            </span>
            <span className={`font-bold text-right ${lead.isUnlocked ? "text-slate-800" : "text-slate-400 italic"}`}>
              {lead.isUnlocked ? (lead.moveInTimeline || "Immediate") : "Locked"}
            </span>
          </div>
        </div>

        {/* Verified Callout (if applicable) */}
        {lead.isVerified && (
          <div className="p-2.5 bg-emerald-50/60 border border-emerald-200/60 rounded-xl text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              <strong>Verified Intent:</strong> {lead.isUnlocked ? (lead.verificationNotes || "Budget & move-in verified.") : "Audited student intent. Revealed on purchase."}
            </span>
          </div>
        )}
      </div>

      {/* Footer Action Button */}
      <div className="p-4 pt-0 mt-auto">
        {lead.maxBuyers && lead.maxBuyers > 1 && !lead.isUnlocked && !lead.isSoldOut && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-2.5 px-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Shared Lead ({lead.buyerCount || 0}/4 Unlocked)</span>
            </span>
            <span className="text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-md">
              {Math.max(0, (lead.maxBuyers || 4) - (lead.buyerCount || 0))} slots left
            </span>
          </div>
        )}

        {lead.isUnlocked ? (
          <div className="flex items-center gap-2">
            <a
              href={`tel:${lead.rawPhone || lead.tenantPhone}`}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
            <a
              href={`https://wa.me/${(lead.rawPhone || lead.tenantPhone || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-green-500 hover:bg-green-600 active:scale-95 text-white font-extrabold text-xs rounded-2xl shadow-sm transition-all"
            >
              <span className="font-black text-[13px]">WA</span>
              <span>WhatsApp</span>
            </a>
          </div>
        ) : lead.isSoldOut ? (
          <button disabled className="w-full py-3.5 bg-slate-100 text-slate-400 font-bold text-sm rounded-2xl border border-slate-200 cursor-not-allowed">
            Sold Out
          </button>
        ) : (
          <button
            onClick={handleUnlockClick}
            disabled={isUnlocking}
            className="w-full flex justify-between items-center py-3 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-md transition-all duration-200 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {isUnlocking ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Lock className="w-4 h-4 text-blue-400" />}
              <span>{isUnlocking ? "Unlocking..." : "Buy Lead"}</span>
            </span>
            <span className="flex items-center bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded-lg font-black text-xs border border-slate-700">
              ₹{lead.price}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
