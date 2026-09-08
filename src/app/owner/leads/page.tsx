"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { LeadCard, LeadCardData } from "@/components/LeadCard";
import { WalletWidget } from "@/components/WalletWidget";
import { 
  Users, 
  Building2, 
  Phone, 
  Award, 
  Filter, 
  Loader2, 
  LayoutGrid, 
  List, 
  Lock, 
  Unlock, 
  MapPin, 
  Navigation,
  ChevronDown,
  Calendar, 
  Sparkles, 
  MessageSquare, 
  User, 
  GraduationCap,
  Wallet,
  UserCheck,
  CheckSquare,
  ShoppingCart,
  Check,
  PhoneCall,
  Headphones,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Send,
  X,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  IndianRupee
} from "lucide-react";

export default function LeadsMarketplace() {
  const [activeTab, setActiveTab] = useState<"city" | "opened_property" | "tried_to_contact" | "conversion_system" | "wallet">("city");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("table");
  const [allLeads, setAllLeads] = useState<LeadCardData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState<boolean>(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [isBulkBuying, setIsBulkBuying] = useState<boolean>(false);

  // Assisted Conversion System States
  const [conversions, setConversions] = useState<any[]>([]);
  const [conversionsLoading, setConversionsLoading] = useState<boolean>(false);
  const [conversionStats, setConversionStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    visitScheduled: 0,
    converted: 0
  });
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [ownerProperties, setOwnerProperties] = useState<any[]>([]);
  const [purchasedLeads, setPurchasedLeads] = useState<any[]>([]);
  const [isSubmittingConversion, setIsSubmittingConversion] = useState<boolean>(false);
  const [shareForm, setShareForm] = useState({
    sourceType: "manual" as "manual" | "purchased",
    selectedPurchasedLeadId: "",
    tenantName: "",
    tenantPhone: "",
    propertyId: "",
    city: "Greater Noida",
    area: "",
    budget: "",
    moveInTimeline: "Immediate",
    ownerNotes: ""
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isShareModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isShareModalOpen]);

  // Dynamically extract unique cities from the available leads list
  const availableCities = useMemo(() => {
    const cityMap: Record<string, number> = {};
    allLeads.forEach((lead) => {
      const city = lead.city?.trim();
      if (city) {
        cityMap[city] = (cityMap[city] || 0) + 1;
      }
    });

    return Object.keys(cityMap)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        count: cityMap[name]
      }));
  }, [allLeads]);

  // Dynamically extract unique locations from the available leads, filtered by selected city if any
  const availableLocations = useMemo(() => {
    const locationMap: Record<string, number> = {};
    allLeads.forEach((lead) => {
      const cityMatches =
        selectedCity === "all" ||
        (lead.city && lead.city.trim().toLowerCase() === selectedCity.toLowerCase());

      if (cityMatches && lead.area && lead.area.trim()) {
        const area = lead.area.trim();
        locationMap[area] = (locationMap[area] || 0) + 1;
      }
    });

    return Object.keys(locationMap)
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        count: locationMap[name]
      }));
  }, [allLeads, selectedCity]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedLocation("all");
  };

  const fetchLeads = async () => {
    if (activeTab === "wallet") return;
    try {
      setIsLoading(true);
      setError("");

      const params = new URLSearchParams();
      params.set("category", activeTab);

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load leads");
      const data = await res.json();
      setAllLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await fetch("/api/wallet");
      if (res.ok) {
        const data = await res.json();
        if (data.balance !== undefined) {
          setWalletBalance(data.balance);
        }
      }
    } catch (err) {
      console.error("Failed to load wallet balance:", err);
    }
  };

  const fetchConversions = async () => {
    try {
      setConversionsLoading(true);
      const res = await fetch("/api/conversions");
      if (res.ok) {
        const data = await res.json();
        setConversions(data.conversions || []);
        if (data.stats) setConversionStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load conversions:", err);
    } finally {
      setConversionsLoading(false);
    }
  };

  const openShareModal = async () => {
    setIsShareModalOpen(true);
    try {
      const [propsRes, leadsRes] = await Promise.all([
        fetch("/api/properties?ownerOnly=true"),
        fetch("/api/owner/purchased-leads?category=all")
      ]);
      if (propsRes.ok) {
        const pData = await propsRes.json();
        setOwnerProperties(pData.properties || []);
      }
      if (leadsRes.ok) {
        const lData = await leadsRes.json();
        setPurchasedLeads(lData.leads || []);
      }
    } catch (e) {
      console.error("Error loading share modal data:", e);
    }
  };

  const handlePickPurchasedLead = (leadId: string) => {
    const picked = purchasedLeads.find((l) => (l._id || l.id) === leadId);
    if (picked) {
      setShareForm((prev) => ({
        ...prev,
        selectedPurchasedLeadId: leadId,
        tenantName: picked.tenantName || "",
        tenantPhone: picked.tenantPhone || "",
        city: picked.city || prev.city,
        area: picked.area || prev.area,
        budget: picked.budget ? String(picked.budget) : prev.budget,
        moveInTimeline: picked.moveInTimeline || prev.moveInTimeline
      }));
    }
  };

  const handleShareLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareForm.tenantName || !shareForm.tenantPhone) {
      alert("Tenant name and contact number are required.");
      return;
    }
    try {
      setIsSubmittingConversion(true);
      const res = await fetch("/api/conversions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantName: shareForm.tenantName,
          tenantPhone: shareForm.tenantPhone,
          propertyId: shareForm.propertyId || undefined,
          leadId: shareForm.selectedPurchasedLeadId || undefined,
          city: shareForm.city,
          area: shareForm.area,
          budget: shareForm.budget ? Number(shareForm.budget) : undefined,
          moveInTimeline: shareForm.moveInTimeline,
          ownerNotes: shareForm.ownerNotes
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to submit conversion request");
        return;
      }
      alert("Success! Your lead has been shared with the Provider App sales team. Our executive will start follow-ups immediately.");
      setIsShareModalOpen(false);
      setShareForm({
        sourceType: "manual",
        selectedPurchasedLeadId: "",
        tenantName: "",
        tenantPhone: "",
        propertyId: "",
        city: "Greater Noida",
        area: "",
        budget: "",
        moveInTimeline: "Immediate",
        ownerNotes: ""
      });
      fetchConversions();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while submitting.");
    } finally {
      setIsSubmittingConversion(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  useEffect(() => {
    fetchWalletBalance();
    setSelectedLeadIds([]);
    if (activeTab === "conversion_system") {
      fetchConversions();
    } else if (activeTab !== "wallet") {
      setSelectedCity("all");
      setSelectedLocation("all");
      fetchLeads();
    }
  }, [activeTab]);

  // Filter leads based on selected dropdown values
  const filteredLeads = useMemo(() => {
    return allLeads.filter((lead) => {
      if (selectedCity !== "all") {
        if (!lead.city || lead.city.trim().toLowerCase() !== selectedCity.toLowerCase()) {
          return false;
        }
      }
      if (selectedLocation !== "all") {
        if (!lead.area || lead.area.trim().toLowerCase() !== selectedLocation.toLowerCase()) {
          return false;
        }
      }
      return true;
    });
  }, [allLeads, selectedCity, selectedLocation]);

  const newAvailableLeads = filteredLeads.filter((l) => !l.isUnlocked);

  // Buyable leads that can be selected for bulk purchase
  const buyableAvailableLeads = useMemo(() => {
    return newAvailableLeads.filter((l) => !l.isSoldOut && !l.isUnlocked);
  }, [newAvailableLeads]);

  const allBuyableIds = useMemo(() => {
    return buyableAvailableLeads.map((l) => l._id || l.id || "").filter(Boolean);
  }, [buyableAvailableLeads]);

  const isAllSelected = allBuyableIds.length > 0 && allBuyableIds.every((id) => selectedLeadIds.includes(id));

  const toggleSelectLead = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLeadIds((prev) => prev.filter((id) => !allBuyableIds.includes(id)));
    } else {
      setSelectedLeadIds(Array.from(new Set([...selectedLeadIds, ...allBuyableIds])));
    }
  };

  const selectedLeadsTotalCost = useMemo(() => {
    return buyableAvailableLeads
      .filter((l) => selectedLeadIds.includes(l._id || l.id || ""))
      .reduce((acc, curr) => acc + (curr.price || 49), 0);
  }, [buyableAvailableLeads, selectedLeadIds]);

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
        if (res.status === 401) {
          alert("Unauthorized: Please sign in as an owner/buyer to unlock leads.");
          window.location.href = "/login?callbackUrl=/owner/leads";
          return;
        }

        if (data.insufficientFunds || (data.error && data.error.toLowerCase().includes("insufficient"))) {
          const wantToAddFunds = confirm(
            `${data.error}\n\nWould you like to deposit funds into your wallet now?`
          );
          if (wantToAddFunds) {
            setIsAddFundsModalOpen(true);
          }
          return;
        }

        alert(data.error || "Failed to unlock lead");
        throw new Error(data.error);
      }

      // Optimistically update lead in allLeads state
      setAllLeads((prev) =>
        prev.map((l) => {
          const id = l._id || l.id;
          if (id === leadId) {
            return {
              ...l,
              isUnlocked: true,
              tenantPhone: data.tenantPhone || l.tenantPhone,
              rawPhone: data.tenantPhone || l.rawPhone,
              tenantName: data.tenantName || l.tenantName,
              budget: data.budget !== undefined ? data.budget : l.budget,
              maskedBudget: undefined,
            };
          }
          return l;
        })
      );

      // Deselect if it was selected
      setSelectedLeadIds((prev) => prev.filter((id) => id !== leadId));

      if (data.newBalance !== undefined) {
        setWalletBalance(data.newBalance);
      }

      alert(
        `Lead Unlocked Successfully!\n\nYou unlocked ${data.tenantName || "this lead"}. You can view and export all your unlocked contacts anytime in the 'Purchased Leads' directory.`
      );

      // Background refresh
      fetchLeads();
      fetchWalletBalance();
    } catch (err) {
      console.error(err);
    } finally {
      setUnlockingId(null);
    }
  };

  const handleBulkBuy = async () => {
    if (selectedLeadIds.length === 0) return;
    try {
      setIsBulkBuying(true);
      const res = await fetch("/api/leads/buy-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadIds: selectedLeadIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          alert("Unauthorized: Please sign in as an owner/buyer to unlock leads.");
          window.location.href = "/login?callbackUrl=/owner/leads";
          return;
        }

        if (data.insufficientFunds || (data.error && data.error.toLowerCase().includes("insufficient"))) {
          const wantToAddFunds = confirm(
            `${data.error}\n\nWould you like to deposit funds into your wallet now?`
          );
          if (wantToAddFunds) {
            setIsAddFundsModalOpen(true);
          }
          return;
        }

        alert(data.error || "Failed to complete bulk purchase");
        return;
      }

      const unlockedIds: string[] = data.unlockedLeadIds || selectedLeadIds;
      setAllLeads((prev) =>
        prev.map((l) => {
          const id = l._id || l.id;
          if (id && unlockedIds.includes(id)) {
            return {
              ...l,
              isUnlocked: true,
              maskedBudget: undefined,
            };
          }
          return l;
        })
      );

      if (data.newBalance !== undefined) {
        setWalletBalance(data.newBalance);
      }

      alert(
        `Bulk Purchase Successful!\n\nYou unlocked ${data.unlockedCount || unlockedIds.length} leads for ₹${data.totalCost || selectedLeadsTotalCost}. You can view and export all contacts anytime in the 'Purchased Leads' directory.`
      );

      setSelectedLeadIds([]);
      fetchLeads();
      fetchWalletBalance();
    } catch (err: any) {
      console.error("Bulk purchase error:", err);
      alert(err.message || "Failed to process bulk purchase");
    } finally {
      setIsBulkBuying(false);
    }
  };

  const renderLeadsTable = (leadList: LeadCardData[]) => {
    return (
      <div className="space-y-4">
        {/* Desktop Wide Table View (Visible on md and larger screens) */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto relative">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-extrabold uppercase tracking-wider">
                  <th className="py-4 px-3 whitespace-nowrap w-12 text-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      disabled={allBuyableIds.length === 0}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-40"
                      title="Select all buyable leads"
                    />
                  </th>
                  <th className="py-4 px-4 whitespace-nowrap">Tenant Name</th>
                  <th className="py-4 px-4 whitespace-nowrap">Phone</th>
                  <th className="py-4 px-4 whitespace-nowrap">Gender</th>
                  <th className="py-4 px-4 whitespace-nowrap">College / Company</th>
                  <th className="py-4 px-4 whitespace-nowrap">Target Location</th>
                  <th className="py-4 px-4 whitespace-nowrap">Target City</th>
                  <th className="py-4 px-4 whitespace-nowrap">Property Revealed</th>
                  <th className="py-4 px-4 whitespace-nowrap">Budget</th>
                  <th className="py-4 px-4 whitespace-nowrap">Move-in</th>
                  <th className="py-4 px-4 text-right whitespace-nowrap sticky right-0 z-20 bg-slate-50 shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] border-l border-slate-200/80">
                    Price / Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {leadList.map((lead) => {
                  const leadId = lead._id || lead.id || "";
                  const isUnlockingThis = unlockingId === leadId;
                  const isSelected = selectedLeadIds.includes(leadId);
                  const isAvailable = !lead.isUnlocked && !lead.isSoldOut;

                  return (
                    <tr key={leadId} className={`transition-colors group ${isSelected ? "bg-blue-50/70" : "hover:bg-slate-50/70"}`}>
                      {/* Selection Checkbox */}
                      <td className="py-4 px-3 whitespace-nowrap w-12 text-center">
                        {isAvailable ? (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectLead(leadId)}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        ) : (
                          <span className="text-slate-300 text-xs">-</span>
                        )}
                      </td>

                      {/* 1. Tenant Name */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              lead.isUnlocked
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                : "bg-slate-100 text-slate-400 border border-slate-200 shadow-inner"
                            }`}
                          >
                            {lead.isUnlocked ? (
                              lead.tenantName[0]?.toUpperCase() || "T"
                            ) : (
                              <Lock className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{lead.tenantName}</span>
                            {!lead.isUnlocked && (
                              <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Masked
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Phone */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.isUnlocked ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${lead.rawPhone || lead.tenantPhone}`}
                              className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{lead.rawPhone || lead.tenantPhone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${(lead.rawPhone || lead.tenantPhone || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-2 py-0.5 rounded-md"
                            >
                              WhatsApp
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                            <Lock className="w-3 h-3 text-slate-400" /> {lead.tenantPhone || "+91 98*** ***00"}
                          </span>
                        )}
                      </td>

                      {/* 3. Gender */}
                      <td className="py-4 px-4 whitespace-nowrap">
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
                            <User className="w-3 h-3 text-slate-500" /> Any
                          </span>
                        )}
                      </td>

                      {/* 4. College / Company */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold max-w-[170px] truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="capitalize truncate">
                            {lead.college || "General Tenant"}
                          </span>
                        </div>
                      </td>

                      {/* 5. Target Location */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1 text-xs whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{lead.area || "Area Matched"}</span>
                        </div>
                      </td>

                      {/* 6. Target City */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                          {lead.city || "Greater Noida"}
                        </span>
                      </td>

                      {/* 7. Property Revealed */}
                      <td className="py-4 px-4">
                        {lead.property?.title ? (
                          <div className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50/90 border border-indigo-200 px-2.5 py-1 rounded-md max-w-[180px] truncate">
                            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                            <span className="truncate">{lead.property.title}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None (City Lead)</span>
                        )}
                      </td>

                      {/* 8. Budget */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {lead.isUnlocked ? (
                          <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-xs font-extrabold">
                            ₹{lead.budget ? Number(lead.budget).toLocaleString("en-IN") : "10,000"}/mo
                          </span>
                        ) : (
                          <span className="bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold inline-flex items-center gap-1">
                            <Lock className="w-3 h-3 text-slate-400" /> {lead.maskedBudget || "₹**,***"}
                          </span>
                        )}
                      </td>

                      {/* 9. Move-in */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className={lead.isUnlocked ? "font-semibold text-slate-700" : "text-slate-400 italic"}>
                            {lead.isUnlocked ? lead.moveInTimeline || "Immediate" : "Locked"}
                          </span>
                        </div>
                      </td>

                      {/* 10. Price / Action (Frozen Column) */}
                      <td className={`py-4 px-4 text-right whitespace-nowrap sticky right-0 z-10 ${
                        isSelected ? "bg-blue-50" : "bg-white group-hover:bg-slate-50"
                      } shadow-[-6px_0_12px_-4px_rgba(0,0,0,0.06)] border-l border-slate-200/80 transition-colors`}>
                        {lead.isUnlocked ? (
                          <div className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200">
                            <Unlock className="w-3.5 h-3.5 text-emerald-600" /> Unlocked
                          </div>
                        ) : lead.isSoldOut ? (
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
                            Sold Out
                          </span>
                        ) : (
                          <div className="flex flex-col items-end gap-1">
                            <button
                              onClick={() => handleUnlockLead(leadId)}
                              disabled={isUnlockingThis || isBulkBuying}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50"
                            >
                              {isUnlockingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                              ) : (
                                <Lock className="w-3.5 h-3.5 text-blue-400" />
                              )}
                              <span>Buy Lead (₹{lead.price})</span>
                            </button>
                            {lead.maxBuyers && lead.maxBuyers > 1 && (
                              <span className="text-[10px] font-semibold text-slate-500">
                                {lead.buyerCount || 0}/{lead.maxBuyers} Unlocked • {lead.maxBuyers - (lead.buyerCount || 0)} left
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Responsive Card List (Visible on screens < md) */}
        <div className="md:hidden space-y-3.5">
          {leadList.map((lead) => {
            const leadId = lead._id || lead.id || "";
            const isUnlockingThis = unlockingId === leadId;
            const isSelected = selectedLeadIds.includes(leadId);
            const isAvailable = !lead.isUnlocked && !lead.isSoldOut;

            return (
              <div
                key={leadId}
                className={`bg-white rounded-2xl p-4 border transition-all space-y-3.5 ${
                  isSelected
                    ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/20 shadow-md"
                    : "border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* 1. Top Header: Avatar + Tenant Name + Gender + City */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isAvailable && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectLead(leadId)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0 mr-0.5"
                      />
                    )}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        lead.isUnlocked
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {lead.isUnlocked ? (
                        lead.tenantName[0]?.toUpperCase() || "T"
                      ) : (
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-slate-900 text-sm truncate">
                          {lead.tenantName}
                        </span>
                        {!lead.isUnlocked && (
                          <span className="text-[9px] font-extrabold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Masked
                          </span>
                        )}
                      </div>

                      {/* Phone Display */}
                      <div className="mt-0.5">
                        {lead.isUnlocked ? (
                          <a
                            href={`tel:${lead.rawPhone || lead.tenantPhone}`}
                            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{lead.rawPhone || lead.tenantPhone}</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
                            <Lock className="w-2.5 h-2.5 text-slate-400" /> {lead.tenantPhone || "+91 98*** ***00"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badges: Gender & City */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                      {lead.city || "Greater Noida"}
                    </span>
                    {lead.gender === "female" ? (
                      <span className="text-[9px] font-extrabold text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-full">
                        Female
                      </span>
                    ) : lead.gender === "male" ? (
                      <span className="text-[9px] font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded-full">
                        Male
                      </span>
                    ) : (
                      <span className="text-[9px] font-extrabold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded-full">
                        Any
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Attributes Grid */}
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs">
                  {/* College / Company */}
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-purple-600 shrink-0" /> College / Co.
                    </p>
                    <p className="font-bold text-slate-800 text-xs truncate mt-0.5">
                      {lead.college || "General Tenant"}
                    </p>
                  </div>

                  {/* Target Location */}
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500 shrink-0" /> Location
                    </p>
                    <p className="font-bold text-slate-800 text-xs truncate mt-0.5">
                      {lead.area || "Area Matched"}
                    </p>
                  </div>

                  {/* Budget */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Budget</p>
                    {lead.isUnlocked ? (
                      <p className="font-black text-emerald-700 text-xs mt-0.5">
                        ₹{lead.budget ? Number(lead.budget).toLocaleString("en-IN") : "10,000"}/mo
                      </p>
                    ) : (
                      <p className="font-bold text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" /> {lead.maskedBudget || "₹**,***"}
                      </p>
                    )}
                  </div>

                  {/* Move-in */}
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500 shrink-0" /> Move-in
                    </p>
                    <p className={`text-xs mt-0.5 ${lead.isUnlocked ? "font-bold text-slate-800" : "text-slate-400 italic"}`}>
                      {lead.isUnlocked ? lead.moveInTimeline || "Immediate" : "Locked"}
                    </p>
                  </div>

                  {/* Property Revealed (if any) */}
                  {lead.property?.title && (
                    <div className="col-span-2 pt-1 border-t border-slate-200/60">
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-indigo-600 shrink-0" /> Property Viewed
                      </p>
                      <p className="font-semibold text-indigo-700 text-xs truncate mt-0.5">
                        {lead.property.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* 3. Action Buttons Row */}
                <div>
                  {lead.isUnlocked ? (
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`tel:${lead.rawPhone || lead.tenantPhone}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </a>
                      <a
                        href={`https://wa.me/${(lead.rawPhone || lead.tenantPhone || "").replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all"
                      >
                        <span className="font-black text-[11px]">WA</span>
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  ) : lead.isSoldOut ? (
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl cursor-not-allowed border border-slate-200"
                    >
                      Sold Out
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      {lead.maxBuyers && lead.maxBuyers > 1 && (
                        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 px-0.5">
                          <span>Shared Lead</span>
                          <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-bold">
                            {lead.buyerCount || 0}/{lead.maxBuyers} Unlocked • {lead.maxBuyers - (lead.buyerCount || 0)} slots left
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => handleUnlockLead(leadId)}
                        disabled={isUnlockingThis}
                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-extrabold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                      >
                        {isUnlockingThis ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-blue-400" />
                        )}
                        <span>Buy Lead for ₹{lead.price}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getConversionStatusBadge = (status: string, agentName?: string) => {
    switch (status) {
      case "assigned":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Agent: {agentName || "Assigned"}</span>
          </span>
        );
      case "in_progress":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-full">
            <PhoneCall className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
            <span>Follow-up in Progress</span>
          </span>
        );
      case "visit_scheduled":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <Calendar className="w-3.5 h-3.5 text-amber-600" />
            <span>Site Visit Scheduled 📅</span>
          </span>
        );
      case "converted":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Deal Converted & Placed 🎉</span>
          </span>
        );
      case "dropped":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Closed / Inactive</span>
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  const renderConversionDesk = () => {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
        {/* 1. Value Proposition Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 text-white p-6 sm:p-8 lg:p-9 shadow-xl border border-purple-800/40">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-purple-300" />
                <span>Provider App Assisted Lead Conversion Desk</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Let Our Field Sales Team Close Tenants For You
              </h2>
              <p className="text-purple-200/80 text-xs sm:text-sm font-medium leading-relaxed">
                Share your inquiries or purchased leads with our on-ground sales executives. We handle the phone calls, tenant qualification, price negotiations, and physical property site visits to get your vacant units filled.
              </p>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-1 text-[11px] sm:text-xs text-purple-200/90 font-bold">
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Physical Site Visits
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tenant Qualification
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time Progress Tracking
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                type="button"
                onClick={openShareModal}
                className="px-6 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                <span>Share Lead with Sales Team</span>
              </button>
              <a
                href="https://wa.me/919999999999?text=Hello%20Provider%20App%20Sales%20Team%2C%20I%20am%20a%20property%20owner%20and%20need%20assisted%20lead%20conversion%20support"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/30 font-bold text-xs rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Chat with Sales Desk on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* 2. Pipeline Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Total Shared</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{conversionStats.total}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">In Discussion</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{conversionStats.inProgress}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Visits Scheduled</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{conversionStats.visitScheduled}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase">Converted 🎉</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-600">{conversionStats.converted}</p>
            </div>
          </div>
        </div>

        {/* 3. Conversion Pipeline Tracker */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Shared Leads & Conversion Pipeline</span>
                <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-extrabold">
                  {conversions.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Live real-time progress updates from the Provider App field sales team on your shared leads.
              </p>
            </div>

            <button
              type="button"
              onClick={openShareModal}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Share Another Lead</span>
            </button>
          </div>

          {conversionsLoading ? (
            <div className="py-16 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-500">Loading your assisted conversions pipeline...</p>
            </div>
          ) : conversions.length === 0 ? (
            <div className="py-12 sm:py-16 px-4 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto shadow-inner">
                <Award className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-900">No leads shared for conversion yet</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Have a prospect or unlocked lead that needs professional follow-ups? Share them with our field sales team and let us coordinate visits, negotiate, and close the tenant for you.
                </p>
              </div>
              <button
                type="button"
                onClick={openShareModal}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-xs rounded-2xl shadow-md shadow-purple-600/20 inline-flex items-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Share Your First Lead</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {conversions.map((conv: any) => (
                <div key={conv._id} className="p-4 sm:p-6 hover:bg-slate-50/60 transition-colors space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 font-black text-sm flex items-center justify-center shrink-0 border border-indigo-100">
                        {conv.tenantName?.charAt(0)?.toUpperCase() || "T"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm sm:text-base font-extrabold text-slate-900">{conv.tenantName}</h4>
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {conv.tenantPhone}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                          {conv.city && <span>📍 {conv.area ? `${conv.area}, ${conv.city}` : conv.city}</span>}
                          {conv.budget ? <span>• Budget: ₹{conv.budget.toLocaleString("en-IN")}/mo</span> : null}
                          {conv.moveInTimeline && <span>• Moving in: {conv.moveInTimeline}</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {getConversionStatusBadge(conv.status, conv.salesAgentName)}
                      <a
                        href={`tel:${conv.tenantPhone}`}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                        title="Call Tenant"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://wa.me/91${conv.tenantPhone?.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                        title="WhatsApp Tenant"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Target Property & Instructions Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {/* Target Property */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 text-xs">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" /> Target Property
                      </p>
                      {conv.propertyId ? (
                        <div>
                          <p className="font-extrabold text-slate-900">{conv.propertyId.title}</p>
                          <p className="text-slate-500 text-[11px] mt-0.5">
                            ₹{conv.propertyId.price?.toLocaleString("en-IN")}/mo • {conv.propertyId.city || conv.propertyId.location?.city || "Area"}
                          </p>
                        </div>
                      ) : (
                        <p className="text-slate-500 font-medium">Any suitable vacancy / Open discussion</p>
                      )}
                    </div>

                    {/* Owner Instructions */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200/70 text-xs">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                        <Send className="w-3 h-3 text-purple-500" /> Your Instructions to Sales Team
                      </p>
                      <p className="text-slate-700 font-medium italic">
                        {conv.ownerNotes ? `"${conv.ownerNotes}"` : "No specific notes provided."}
                      </p>
                    </div>
                  </div>

                  {/* Live Sales Team Feedback & Notes Box */}
                  <div className="bg-purple-50/70 border border-purple-200/80 rounded-2xl p-3 sm:p-3.5 flex items-start gap-2.5">
                    <Headphones className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold text-purple-950 flex items-center gap-2">
                        <span>Provider App Sales Team Live Update</span>
                        {conv.salesAgentName && (
                          <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md">
                            Agent: {conv.salesAgentName}
                          </span>
                        )}
                      </p>
                      <p className="text-purple-900/90 font-medium mt-1 leading-relaxed">
                        {conv.adminNotes ? conv.adminNotes : "Our sales executive has received the lead and is currently initiating initial call outreach."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1">
                    <span>Submitted on {new Date(conv.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    {conv.lastContactedAt && (
                      <span>Last executive activity: {new Date(conv.lastContactedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-8 lg:p-8 max-w-7xl mx-auto space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Buyer Leads Marketplace
            </h1>
            <span className="bg-blue-100 text-blue-700 text-[10px] sm:text-xs px-2.5 py-0.5 sm:py-1 rounded-full font-black">
              Active Marketplace
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
            Acquire high-intent student and tenant leads across your city, property viewers, and conversion inquiries.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          {/* Link to Purchased Leads Directory */}
          <Link
            href="/owner/purchased-leads"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs transition-all"
            title="View Unlocked Leads Directory"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">Purchased Leads</span>
          </Link>

          {/* Quick Wallet Balance Pill */}
          <button
            onClick={() => setActiveTab("wallet")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold border transition-all ${
              activeTab === "wallet"
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 shadow-xs"
            }`}
          >
            <Wallet className={`w-3.5 h-3.5 ${activeTab === "wallet" ? "text-emerald-400" : "text-blue-600"}`} />
            <span className="text-slate-400 font-medium hidden sm:inline">Wallet:</span>
            <span className={activeTab === "wallet" ? "text-emerald-400 font-black" : "text-slate-900 font-black"}>
              {walletBalance !== null ? `₹${walletBalance.toLocaleString("en-IN")}` : "..."}
            </span>
          </button>

          {/* View Mode Toggle: Cards vs Table (hidden on wallet and conversion desk) */}
          {activeTab !== "wallet" && activeTab !== "conversion_system" && (
            <div className="bg-slate-100 p-1 rounded-xl sm:rounded-2xl flex items-center border border-slate-200">
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                  viewMode === "card"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Cards</span>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Table</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 5 Main Segments Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-3">
        {/* Horizontal scrollable tabs with touch momentum */}
        <div className="-mx-3 px-3 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "city" as const, label: "City Leads", shortLabel: "City Leads", icon: Users },
            { id: "opened_property" as const, label: "Opened Property", shortLabel: "Opened Property", icon: Building2 },
            { id: "tried_to_contact" as const, label: "Tried to Contact", shortLabel: "Contacted", icon: Phone },
            { id: "conversion_system" as const, label: "Contact Provider for Conversion", shortLabel: "Conversion Leads", icon: Award },
            { id: "wallet" as const, label: "Wallet & Ledger", shortLabel: "Wallet", icon: Wallet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                {tab.id === "wallet" && (
                  <span className={`text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-slate-800 text-emerald-400" : "bg-emerald-50 text-emerald-700"
                  }`}>
                    {walletBalance !== null ? `₹${walletBalance.toLocaleString("en-IN")}` : "..."}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* City & Location Dropdowns (Visible when City Leads tab is active) */}
        {activeTab === "city" && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap shrink-0">
            {/* 1. Dynamic City Dropdown */}
            <div className="relative inline-flex items-center">
              <MapPin className="w-3.5 h-3.5 text-blue-600 absolute left-3 pointer-events-none" />
              <select
                id="city-dropdown"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl pl-8 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all min-w-[130px] sm:min-w-[155px]"
              >
                <option value="all">All Cities ({allLeads.length})</option>
                {availableCities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* 2. Dynamic Location Dropdown */}
            <div className="relative inline-flex items-center">
              <Navigation className="w-3.5 h-3.5 text-emerald-600 absolute left-3 pointer-events-none" />
              <select
                id="location-dropdown"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none bg-white hover:bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl pl-8 pr-8 py-2 sm:py-2.5 text-xs sm:text-sm font-extrabold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-all min-w-[145px] sm:min-w-[175px]"
              >
                <option value="all">
                  All Locations ({availableLocations.reduce((acc, curr) => acc + curr.count, 0)})
                </option>
                {availableLocations.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>

            {/* Reset Filter Button */}
            {(selectedCity !== "all" || selectedLocation !== "all") && (
              <button
                onClick={() => {
                  setSelectedCity("all");
                  setSelectedLocation("all");
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-red-600 underline py-1 px-1 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Content (Wallet Tab vs Assisted Conversion Desk vs Leads Marketplace) */}
      {activeTab === "wallet" ? (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-3 sm:pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <span>Owner Wallet & Transactions</span>
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm mt-1 font-medium">
              Manage your balance, deposit funds to buy leads, and review all debit and credit transaction history.
            </p>
          </div>

          <WalletWidget 
            externalBalance={walletBalance !== null ? walletBalance : undefined}
            onBalanceUpdate={(b) => setWalletBalance(b)} 
            isModalOpenExternal={isAddFundsModalOpen}
            setIsModalOpenExternal={setIsAddFundsModalOpen}
          />
        </div>
      ) : activeTab === "conversion_system" ? (
        renderConversionDesk()
      ) : (
        <>
          {/* Mount WalletWidget modal overlay if triggered from a lead card */}
          <WalletWidget 
            externalBalance={walletBalance !== null ? walletBalance : undefined}
            onBalanceUpdate={(b) => setWalletBalance(b)} 
            isModalOpenExternal={isAddFundsModalOpen}
            setIsModalOpenExternal={setIsAddFundsModalOpen}
            modalOnly={true}
          />

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
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Available Leads for Purchase</span>
                      <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-black">
                        {newAvailableLeads.length}
                      </span>
                    </h2>
                    {buyableAvailableLeads.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{isAllSelected ? "Deselect All" : `Select All (${buyableAvailableLeads.length})`}</span>
                      </button>
                    )}
                  </div>

                  {selectedLeadIds.length > 0 && (
                    <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      <span>
                        <strong className="text-blue-600 font-extrabold">{selectedLeadIds.length}</strong> lead{selectedLeadIds.length > 1 ? "s" : ""} selected (₹{selectedLeadsTotalCost.toLocaleString("en-IN")})
                      </span>
                    </div>
                  )}
                </div>

                {newAvailableLeads.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
                      <Filter className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No New Leads in This Category</h3>
                    <p className="text-slate-500 text-sm">
                      {activeTab === "city"
                        ? "Signed-up tenants in your target city will automatically appear here with contact masking until unlocked."
                        : activeTab === "opened_property"
                        ? "Tenants who view and explore your property listings will appear here."
                        : activeTab === "tried_to_contact"
                        ? "High-intent tenants who click to contact your property will be queued here."
                        : "Tenants who request assisted booking and conversion through Provider App support will appear here."}
                    </p>
                  </div>
                ) : viewMode === "card" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {newAvailableLeads.map((lead) => {
                      const leadId = lead._id || lead.id || "";
                      return (
                        <LeadCard 
                          key={leadId} 
                          lead={lead} 
                          onUnlock={handleUnlockLead} 
                          selectable={true}
                          isSelected={selectedLeadIds.includes(leadId)}
                          onToggleSelect={toggleSelectLead}
                        />
                      );
                    })}
                  </div>
                ) : (
                  renderLeadsTable(newAvailableLeads)
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Floating Sticky Bulk Purchase Bar */}
      {selectedLeadIds.length > 0 && activeTab !== "wallet" && activeTab !== "conversion_system" && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-slate-900/95 backdrop-blur-md text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-6 duration-300">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base text-white">
                  {selectedLeadIds.length} Lead{selectedLeadIds.length > 1 ? "s" : ""} Selected
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/30">
                  Total: ₹{selectedLeadsTotalCost.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Wallet: {walletBalance !== null ? `₹${walletBalance.toLocaleString("en-IN")}` : "..."}
                {walletBalance !== null && walletBalance < selectedLeadsTotalCost && (
                  <span className="text-red-400 font-bold ml-1.5">
                    (Short by ₹{(selectedLeadsTotalCost - walletBalance).toLocaleString("en-IN")})
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              disabled={isBulkBuying}
              className="px-3 py-2 text-xs font-extrabold text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={handleBulkBuy}
              disabled={isBulkBuying}
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl sm:rounded-2xl shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isBulkBuying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Purchasing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Buy {selectedLeadIds.length} Leads (₹{selectedLeadsTotalCost.toLocaleString("en-IN")})</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Share Lead with Provider Sales Team Modal */}
      {mounted && isShareModalOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
          style={{ zoom: 1 }}
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 relative">
              <button
                type="button"
                onClick={() => setIsShareModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 text-[10px] font-black uppercase tracking-wider mb-2 border border-purple-400/30">
                <Award className="w-3 h-3 text-purple-300" />
                <span>Assisted Conversion Request</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Share Lead with Sales Team
              </h3>
              <p className="text-xs text-purple-200/80 mt-1">
                Hand off tenant details to Provider App on-ground executives to follow up, schedule visits, and close the booking.
              </p>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleShareLeadSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
              {/* Optional: Pre-fill from Unlocked Leads */}
              {purchasedLeads.length > 0 && (
                <div className="bg-purple-50/60 border border-purple-200/70 rounded-2xl p-3 space-y-1.5">
                  <label className="font-extrabold text-purple-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Quick Pre-fill from Your Unlocked Leads (Optional):</span>
                  </label>
                  <select
                    value={shareForm.selectedPurchasedLeadId}
                    onChange={(e) => handlePickPurchasedLead(e.target.value)}
                    className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="">-- Select an unlocked lead to auto-fill --</option>
                    {purchasedLeads.map((pl: any) => (
                      <option key={pl._id || pl.id} value={pl._id || pl.id}>
                        {pl.tenantName} ({pl.tenantPhone}) - {pl.area || pl.city || "Location"} (₹{pl.budget || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tenant Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Tenant Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shareForm.tenantName}
                    onChange={(e) => setShareForm({ ...shareForm, tenantName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Tenant Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">+91</span>
                    <input
                      type="tel"
                      required
                      value={shareForm.tenantPhone}
                      onChange={(e) => setShareForm({ ...shareForm, tenantPhone: e.target.value })}
                      placeholder="9876543210"
                      maxLength={14}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Target Property */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 flex items-center justify-between">
                  <span>Target Property (Which listing should we pitch?)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Optional</span>
                </label>
                <select
                  value={shareForm.propertyId}
                  onChange={(e) => setShareForm({ ...shareForm, propertyId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                >
                  <option value="">Any Vacant Room / General In-Person Pitch</option>
                  {ownerProperties.map((p: any) => (
                    <option key={p._id || p.id} value={p._id || p.id}>
                      {p.title} (₹{p.price?.toLocaleString("en-IN")}/mo - {p.city || p.location?.city || "Area"})
                    </option>
                  ))}
                </select>
              </div>

              {/* City & Preferred Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">City</label>
                  <input
                    type="text"
                    value={shareForm.city}
                    onChange={(e) => setShareForm({ ...shareForm, city: e.target.value })}
                    placeholder="e.g. Greater Noida"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Specific Sector / Area</label>
                  <input
                    type="text"
                    value={shareForm.area}
                    onChange={(e) => setShareForm({ ...shareForm, area: e.target.value })}
                    placeholder="e.g. Alpha 1, Knowledge Park"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Budget & Move-In Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Expected Monthly Rent Budget (₹)</label>
                  <input
                    type="number"
                    value={shareForm.budget}
                    onChange={(e) => setShareForm({ ...shareForm, budget: e.target.value })}
                    placeholder="e.g. 10000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Move-in Timeline</label>
                  <select
                    value={shareForm.moveInTimeline}
                    onChange={(e) => setShareForm({ ...shareForm, moveInTimeline: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                  >
                    <option value="Immediate">Immediate (Within 48 hrs)</option>
                    <option value="Within 7 Days">Within 7 Days</option>
                    <option value="Within 15 Days">Within 15 Days</option>
                    <option value="Next Month">Next Month</option>
                    <option value="Flexible">Flexible / Just Inquiring</option>
                  </select>
                </div>
              </div>

              {/* Owner Notes / Context for Sales Executives */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Special Instructions / Preferences for Sales Team
                </label>
                <textarea
                  rows={2}
                  value={shareForm.ownerNotes}
                  onChange={(e) => setShareForm({ ...shareForm, ownerNotes: e.target.value })}
                  placeholder="e.g. Tenant requested a double sharing room with food included. Prefers site visit on weekend afternoon."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingConversion}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingConversion ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit to Sales Team</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
