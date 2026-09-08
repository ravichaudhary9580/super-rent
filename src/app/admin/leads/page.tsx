"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Search, 
  Loader2, 
  Users, 
  Building2, 
  Award, 
  Phone, 
  MapPin, 
  Filter,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck,
  PhoneCall,
  Save,
  Check,
  Headphones,
  Download,
  FileSpreadsheet,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Copy,
  X,
  CheckSquare,
  Square,
  User,
  Mail,
  ExternalLink,
  Sparkles,
  IndianRupee,
  Wallet
} from "lucide-react";

export default function GlobalLeads() {
  const [activeTab, setActiveTab] = useState<
    "all" | "signup" | "opened_property" | "tried_to_contact" | "purchased" | "conversion_system"
  >("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedLeadType, setSelectedLeadType] = useState<string>("all");
  const [selectedVerification, setSelectedVerification] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("all");
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stats, setStats] = useState({ total: 0, unlocked: 0, filtered: 0 });
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    tenantName: true,
    phone: true,
    gender: true,
    college: true,
    city: true,
    area: true,
    property: true,
    category: true,
    leadType: true,
    budget: true,
    moveIn: true,
    priceUnlocks: true,
    owner: true,
    createdAt: true,
  });
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState<boolean>(false);

  // Dynamic Multi-Selection Column Filters State
  // Format: { [colKey]: ["val1", "val2"] }
  const [selectedMultiFilters, setSelectedMultiFilters] = useState<Record<string, string[]>>({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [popoverSearchTerm, setPopoverSearchTerm] = useState<string>("");

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });

  // Assisted Conversion System States
  const [conversions, setConversions] = useState<any[]>([]);
  const [conversionsLoading, setConversionsLoading] = useState<boolean>(false);
  const [conversionStatusFilter, setConversionStatusFilter] = useState<string>("all");
  const [rowDrafts, setRowDrafts] = useState<Record<string, { status: string; salesAgentName: string; adminNotes: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  // Shared Owners Profile Modal State
  const [selectedSharedLead, setSelectedSharedLead] = useState<any | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedSharedLead) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setSelectedSharedLead(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [selectedSharedLead]);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "all" && activeTab !== "conversion_system") {
        params.set("category", activeTab);
      }
      if (selectedCity && selectedCity !== "all") {
        params.set("city", selectedCity);
      }
      if (selectedLeadType && selectedLeadType !== "all") {
        params.set("leadType", selectedLeadType);
      }
      if (selectedVerification !== "all") {
        params.set("isVerified", selectedVerification);
      }
      if (selectedTimeframe !== "all") {
        params.set("timeframe", selectedTimeframe);
      }

      const res = await fetch(`/api/admin/leads?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
        if (data.cities && data.cities.length > 0) {
          setAvailableCities(data.cities);
        }
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchConversions = async () => {
    try {
      setConversionsLoading(true);
      const params = new URLSearchParams();
      if (conversionStatusFilter !== "all") {
        params.set("status", conversionStatusFilter);
      }
      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim());
      }
      const res = await fetch(`/api/admin/conversions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const convList = data.conversions || [];
        setConversions(convList);

        // Initialize row draft states
        const drafts: Record<string, { status: string; salesAgentName: string; adminNotes: string }> = {};
        convList.forEach((c: any) => {
          drafts[c._id] = {
            status: c.status || "pending",
            salesAgentName: c.salesAgentName || "",
            adminNotes: c.adminNotes || "",
          };
        });
        setRowDrafts(drafts);
      }
    } catch (e) {
      console.error("Failed to load conversions:", e);
    } finally {
      setConversionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "conversion_system") {
      fetchConversions();
    } else {
      fetchLeads();
    }
  }, [activeTab, selectedCity, selectedLeadType, selectedVerification, selectedTimeframe, conversionStatusFilter]);

  // Handle Header Click for Sorting
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  // Helper to extract dynamic distinct values and counts for any column
  const getDistinctColumnValues = (colKey: string): { value: string; label: string; count: number }[] => {
    const map: Record<string, { label: string; count: number }> = {};
    leads.forEach((l) => {
      let rawVal = "";
      let displayLabel = "";

      if (colKey === "tenantName") {
        rawVal = l.tenantName || "";
        displayLabel = l.tenantName || "(No Name)";
      } else if (colKey === "phone") {
        rawVal = l.tenantPhone || "";
        displayLabel = l.tenantPhone || "(No Phone)";
      } else if (colKey === "gender") {
        rawVal = l.gender || "any";
        displayLabel = l.gender ? l.gender.toUpperCase() : "ANY";
      } else if (colKey === "college") {
        rawVal = l.college || "";
        displayLabel = l.college || "(Not specified)";
      } else if (colKey === "city") {
        rawVal = l.city || "Greater Noida";
        displayLabel = l.city || "Greater Noida";
      } else if (colKey === "area") {
        rawVal = l.area || "";
        displayLabel = l.area || "(Not specified)";
      } else if (colKey === "property") {
        rawVal = l.propertyId?.title || "";
        displayLabel = l.propertyId?.title || "(General / No Property)";
      } else if (colKey === "category") {
        rawVal = l.category || "signup";
        if (rawVal === "opened_property") displayLabel = "Opened Property";
        else if (rawVal === "tried_to_contact") displayLabel = "Tried to Contact";
        else if (rawVal === "conversion_system") displayLabel = "Assisted Conversion";
        else displayLabel = "City Signup";
      } else if (colKey === "leadType") {
        rawVal = l.leadType || "shared";
        if (rawVal === "exclusive") displayLabel = "Exclusive (1 Buyer)";
        else if (rawVal === "verified") displayLabel = "Verified Lead";
        else if (rawVal === "pay_per_booking") displayLabel = "Pay Per Booking";
        else displayLabel = "Shared Lead (Up to 4 Owners)";
      } else if (colKey === "budget") {
        rawVal = l.budget ? String(l.budget) : "";
        displayLabel = l.budget ? `₹${l.budget.toLocaleString("en-IN")}` : "(No budget)";
      } else if (colKey === "moveIn") {
        rawVal = l.moveInTimeline || "";
        displayLabel = l.moveInTimeline || "(Not specified)";
      } else if (colKey === "priceUnlocks") {
        rawVal = `₹${l.price || 49}`;
        displayLabel = `₹${l.price || 49} (${l.unlockedBy?.length || 0}/${l.maxBuyers || 4} Unlocks)`;
      } else if (colKey === "owner") {
        rawVal = l.ownerId?.name || "";
        displayLabel = l.ownerId?.name || "(Platform Pool)";
      }

      if (rawVal) {
        if (!map[rawVal]) {
          map[rawVal] = { label: displayLabel, count: 0 };
        }
        map[rawVal].count += 1;
      }
    });

    return Object.keys(map)
      .sort((a, b) => map[a].label.localeCompare(map[b].label))
      .map((val) => ({
        value: val,
        label: map[val].label,
        count: map[val].count,
      }));
  };

  // Multi-select toggle helper
  const toggleMultiFilterValue = (colKey: string, val: string) => {
    setSelectedMultiFilters((prev) => {
      const current = prev[colKey] || [];
      const exists = current.includes(val);
      const updated = exists ? current.filter((x) => x !== val) : [...current, val];

      if (updated.length === 0) {
        const next = { ...prev };
        delete next[colKey];
        return next;
      }
      return { ...prev, [colKey]: updated };
    });
  };

  const selectAllValuesForColumn = (colKey: string) => {
    const allVals = getDistinctColumnValues(colKey).map((d) => d.value);
    setSelectedMultiFilters((prev) => ({
      ...prev,
      [colKey]: allVals,
    }));
  };

  const clearValuesForColumn = (colKey: string) => {
    setSelectedMultiFilters((prev) => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
  };

  // Filter & Sort Leads
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // 1. Global Search Term Filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter((l) => {
        return (
          l.tenantName?.toLowerCase().includes(q) ||
          l.tenantPhone?.toLowerCase().includes(q) ||
          l.college?.toLowerCase().includes(q) ||
          l.area?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.propertyId?.title?.toLowerCase().includes(q) ||
          l.ownerId?.name?.toLowerCase().includes(q) ||
          l.ownerId?.phone?.toLowerCase().includes(q)
        );
      });
    }

    // 2. Dynamic Values Multi-Selection Filters
    for (const [colKey, selectedValues] of Object.entries(selectedMultiFilters)) {
      if (!selectedValues || selectedValues.length === 0) continue;

      result = result.filter((lead) => {
        let leadVal = "";
        if (colKey === "tenantName") leadVal = lead.tenantName || "";
        else if (colKey === "phone") leadVal = lead.tenantPhone || "";
        else if (colKey === "gender") leadVal = lead.gender || "any";
        else if (colKey === "college") leadVal = lead.college || "";
        else if (colKey === "city") leadVal = lead.city || "Greater Noida";
        else if (colKey === "area") leadVal = lead.area || "";
        else if (colKey === "property") leadVal = lead.propertyId?.title || "";
        else if (colKey === "category") leadVal = lead.category || "signup";
        else if (colKey === "leadType") leadVal = lead.leadType || "shared";
        else if (colKey === "budget") leadVal = lead.budget ? String(lead.budget) : "";
        else if (colKey === "moveIn") leadVal = lead.moveInTimeline || "";
        else if (colKey === "priceUnlocks") leadVal = `₹${lead.price || 49}`;
        else if (colKey === "owner") leadVal = lead.ownerId?.name || "";

        return selectedValues.includes(leadVal);
      });
    }

    // 3. Sorting
    result.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key];
      let valB: any = b[key];

      if (key === "property") {
        valA = a.propertyId?.title || "";
        valB = b.propertyId?.title || "";
      } else if (key === "owner") {
        valA = a.ownerId?.name || "";
        valB = b.ownerId?.name || "";
      } else if (key === "priceUnlocks") {
        valA = a.price || 0;
        valB = b.price || 0;
      } else if (key === "createdAt") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }

      if (typeof valA === "string") {
        const cmp = valA.localeCompare(valB || "");
        return direction === "asc" ? cmp : -cmp;
      }

      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [leads, searchTerm, selectedMultiFilters, sortConfig]);

  const filteredConversions = useMemo(() => {
    if (!searchTerm.trim()) return conversions;
    const q = searchTerm.toLowerCase().trim();
    return conversions.filter((c) => {
      return (
        c.tenantName?.toLowerCase().includes(q) ||
        c.tenantPhone?.toLowerCase().includes(q) ||
        c.ownerId?.name?.toLowerCase().includes(q) ||
        c.ownerId?.phone?.toLowerCase().includes(q) ||
        c.city?.toLowerCase().includes(q) ||
        c.area?.toLowerCase().includes(q) ||
        c.propertyId?.title?.toLowerCase().includes(q) ||
        c.salesAgentName?.toLowerCase().includes(q) ||
        c.adminNotes?.toLowerCase().includes(q) ||
        c.ownerNotes?.toLowerCase().includes(q)
      );
    });
  }, [conversions, searchTerm]);

  const handleResetFilters = () => {
    setSelectedCity("all");
    setSelectedLeadType("all");
    setSelectedVerification("all");
    setSelectedTimeframe("all");
    setSearchTerm("");
    setConversionStatusFilter("all");
    setSelectedMultiFilters({});
  };

  const handleCopyPhone = (phone: string, id: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedPhoneId(id);
    setTimeout(() => setCopiedPhoneId(null), 2000);
  };

  const handleUpdateConversion = async (id: string) => {
    const draft = rowDrafts[id];
    if (!draft) return;
    try {
      setSavingId(id);
      const res = await fetch("/api/admin/conversions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: draft.status,
          salesAgentName: draft.salesAgentName,
          adminNotes: draft.adminNotes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update conversion request");
        return;
      }
      setConversions((prev) =>
        prev.map((c) => (c._id === id ? { ...c, ...data.conversion } : c))
      );
      setSuccessId(id);
      setTimeout(() => setSuccessId(null), 2500);
    } catch (err) {
      console.error("Error updating conversion:", err);
      alert("Failed to save updates.");
    } finally {
      setSavingId(null);
    }
  };

  // CSV Export Utility for all 14 individual columns
  const handleExportCSV = () => {
    try {
      setIsExporting(true);

      if (activeTab === "conversion_system") {
        const headers = [
          "Tenant Name",
          "Tenant Phone",
          "City",
          "Area",
          "Rent Budget (INR)",
          "Move-in Timeline",
          "Conversion Stage",
          "Assigned Agent",
          "Live Sales Update to Owner",
          "Owner Name",
          "Owner Phone",
          "Owner Email",
          "Target Property",
          "Owner Instructions",
          "Created Date",
          "Last Outreach"
        ];

        const rows = filteredConversions.map((c) => [
          `"${(c.tenantName || "").replace(/"/g, '""')}"`,
          `"${(c.tenantPhone || "").replace(/"/g, '""')}"`,
          `"${(c.city || "").replace(/"/g, '""')}"`,
          `"${(c.area || "").replace(/"/g, '""')}"`,
          c.budget || "",
          `"${(c.moveInTimeline || "").replace(/"/g, '""')}"`,
          `"${(c.status || "").replace(/"/g, '""')}"`,
          `"${(c.salesAgentName || "").replace(/"/g, '""')}"`,
          `"${(c.adminNotes || "").replace(/"/g, '""')}"`,
          `"${(c.ownerId?.name || "").replace(/"/g, '""')}"`,
          `"${(c.ownerId?.phone || "").replace(/"/g, '""')}"`,
          `"${(c.ownerId?.email || "").replace(/"/g, '""')}"`,
          `"${(c.propertyId?.title || "").replace(/"/g, '""')}"`,
          `"${(c.ownerNotes || "").replace(/"/g, '""')}"`,
          c.createdAt ? new Date(c.createdAt).toLocaleString("en-IN") : "",
          c.lastContactedAt ? new Date(c.lastContactedAt).toLocaleString("en-IN") : ""
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
        downloadFile(csvContent, `super-rent-conversion-requests-${new Date().toISOString().slice(0, 10)}.csv`);
      } else {
        const headers = [
          "Tenant Name",
          "Phone Number",
          "Gender",
          "College or Company",
          "Target City",
          "Target Area",
          "Target Property Title",
          "Property Rent (INR)",
          "Lead Category",
          "Lead Tier",
          "Verified Status",
          "Stage",
          "Budget (INR)",
          "Move-in Timeline",
          "Lead Price (INR)",
          "Unlocked Buyers Count",
          "Max Buyers Allowed",
          "Linked Owner Name",
          "Linked Owner Phone",
          "Created Date & Time"
        ];

        const rows = processedLeads.map((lead) => [
          `"${(lead.tenantName || "").replace(/"/g, '""')}"`,
          `"${(lead.tenantPhone || "").replace(/"/g, '""')}"`,
          `"${(lead.gender || "any").replace(/"/g, '""')}"`,
          `"${(lead.college || "").replace(/"/g, '""')}"`,
          `"${(lead.city || "").replace(/"/g, '""')}"`,
          `"${(lead.area || "").replace(/"/g, '""')}"`,
          `"${(lead.propertyId?.title || "").replace(/"/g, '""')}"`,
          lead.propertyId?.price || "",
          `"${(lead.category || "signup").replace(/"/g, '""')}"`,
          `"${(lead.leadType || "shared").replace(/"/g, '""')}"`,
          lead.isVerified ? "Verified" : "Unverified",
          `"${(lead.stage || "new").replace(/"/g, '""')}"`,
          lead.budget || "",
          `"${(lead.moveInTimeline || "").replace(/"/g, '""')}"`,
          lead.price || 49,
          lead.unlockedBy?.length || 0,
          lead.maxBuyers || 4,
          `"${(lead.ownerId?.name || "").replace(/"/g, '""')}"`,
          `"${(lead.ownerId?.phone || "").replace(/"/g, '""')}"`,
          lead.createdAt ? new Date(lead.createdAt).toLocaleString("en-IN") : ""
        ]);

        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
        downloadFile(csvContent, `super-rent-leads-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
      }
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Failed to export CSV file.");
    } finally {
      setIsExporting(false);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "opened_property":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 whitespace-nowrap">
            <Building2 className="w-3 h-3 text-indigo-600" /> Opened Property
          </span>
        );
      case "tried_to_contact":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 whitespace-nowrap">
            <Phone className="w-3 h-3 text-orange-600" /> Tried to Contact
          </span>
        );
      case "conversion_system":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 whitespace-nowrap">
            <Award className="w-3 h-3 text-purple-600" /> Assisted Conversion
          </span>
        );
      case "signup":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
            <Users className="w-3 h-3 text-blue-600" /> City Signup
          </span>
        );
    }
  };

  const getLeadTypeBadge = (lead: any) => {
    const type = lead.leadType || "shared";
    const unlockedCount = lead.unlockedOwners?.length ?? lead.unlockedBy?.length ?? 0;
    const maxCapacity = lead.maxBuyers || (type === "exclusive" || type === "verified" ? 1 : 4);
    const hasUnlocks = unlockedCount > 0;

    switch (type) {
      case "exclusive":
        return (
          <button
            type="button"
            onClick={() => setSelectedSharedLead(lead)}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md border border-amber-300 whitespace-nowrap transition-all active:scale-95 cursor-pointer"
            title="Click to view owner profile"
          >
            <User className="w-3 h-3 text-amber-700" />
            <span>Exclusive ({unlockedCount}/{maxCapacity})</span>
          </button>
        );
      case "verified":
        return (
          <button
            type="button"
            onClick={() => setSelectedSharedLead(lead)}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md border border-emerald-300 whitespace-nowrap transition-all active:scale-95 cursor-pointer"
            title="Click to view owner profile"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-700" />
            <span>Verified ({unlockedCount}/{maxCapacity})</span>
          </button>
        );
      case "pay_per_booking":
        return (
          <span className="text-[10px] font-black uppercase tracking-wider text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-300 whitespace-nowrap">
            Pay Booking
          </span>
        );
      case "shared":
      default:
        return (
          <button
            type="button"
            onClick={() => setSelectedSharedLead(lead)}
            className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border transition-all shadow-2xs active:scale-95 cursor-pointer group ${
              unlockedCount >= maxCapacity
                ? "text-rose-700 bg-rose-50 hover:bg-rose-100 border-rose-200"
                : hasUnlocks
                ? "text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200 ring-1 ring-blue-400/30"
                : "text-slate-600 bg-slate-100 hover:bg-slate-200 border-slate-200"
            }`}
            title="Click to view shared owners profiles list"
          >
            <Users className={`w-3 h-3 group-hover:scale-110 transition-transform ${
              unlockedCount >= maxCapacity ? "text-rose-600" : hasUnlocks ? "text-blue-600" : "text-slate-500"
            }`} />
            <span>Shared ({unlockedCount}/{maxCapacity})</span>
          </button>
        );
    }
  };

  const getConversionStatusBadge = (status: string) => {
    switch (status) {
      case "assigned":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "in_progress":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "visit_scheduled":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "converted":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "dropped":
        return "bg-slate-100 text-slate-600 border-slate-200";
      case "pending":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const renderSortIndicator = (key: string) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 shrink-0" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
    );
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedCity !== "all" ||
    selectedLeadType !== "all" ||
    selectedVerification !== "all" ||
    selectedTimeframe !== "all" ||
    Object.keys(selectedMultiFilters).length > 0;

  const conversionStats = {
    total: conversions.length,
    pending: conversions.filter((c) => c.status === "pending").length,
    inProgress: conversions.filter((c) => c.status === "in_progress" || c.status === "assigned").length,
    visitScheduled: conversions.filter((c) => c.status === "visit_scheduled").length,
    converted: conversions.filter((c) => c.status === "converted").length,
  };

  const COLUMN_LIST = [
    { id: "tenantName", label: "Tenant Name" },
    { id: "phone", label: "Phone & WhatsApp" },
    { id: "gender", label: "Gender" },
    { id: "college", label: "College / Company" },
    { id: "city", label: "Target City" },
    { id: "area", label: "Target Area" },
    { id: "property", label: "Target Property" },
    { id: "category", label: "Category" },
    { id: "leadType", label: "Lead Tier" },
    { id: "budget", label: "Budget (₹)" },
    { id: "moveIn", label: "Move-in Timeline" },
    { id: "priceUnlocks", label: "Price & Unlocks" },
    { id: "owner", label: "Linked Owner" },
    { id: "createdAt", label: "Created Date" },
  ];

  // Render Multi-Select Column Header with Popover Trigger
  const renderColumnHeader = (colKey: string, label: string) => {
    const isFiltered = (selectedMultiFilters[colKey] || []).length > 0;
    const selectedCount = (selectedMultiFilters[colKey] || []).length;
    const isOpen = activeFilterDropdown === colKey;

    const distinctValues = getDistinctColumnValues(colKey);
    const filteredDistinct = distinctValues.filter((d) =>
      d.label.toLowerCase().includes(popoverSearchTerm.toLowerCase())
    );

    return (
      <th key={colKey} className="py-3 px-3 relative group select-none whitespace-nowrap">
        <div className="flex items-center justify-between gap-1.5">
          {/* Click to Sort */}
          <div
            onClick={() => handleSort(colKey)}
            className="flex items-center gap-1 cursor-pointer hover:text-slate-900 transition-colors"
          >
            <span>{label}</span>
            {renderSortIndicator(colKey)}
          </div>

          {/* Dynamic Values Multi-Select Filter Trigger */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isOpen) {
                setActiveFilterDropdown(null);
                setPopoverSearchTerm("");
              } else {
                setActiveFilterDropdown(colKey);
                setPopoverSearchTerm("");
              }
            }}
            className={`p-1 rounded-md transition-all cursor-pointer flex items-center gap-1 ${
              isFiltered
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/80"
            }`}
            title={`Filter ${label} with dynamic values`}
          >
            <Filter className="w-3 h-3" />
            {isFiltered && <span className="text-[10px] font-black">{selectedCount}</span>}
          </button>
        </div>

        {/* Dynamic Multi-Selection Popover Dropdown */}
        {isOpen && (
          <>
            {/* Transparent backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setActiveFilterDropdown(null);
                setPopoverSearchTerm("");
              }}
            />

            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 normal-case font-normal text-slate-800 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                  <Filter className="w-3 h-3 text-blue-600" />
                  <span>Filter {label}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilterDropdown(null);
                    setPopoverSearchTerm("");
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Popover Quick Search */}
              <div className="relative mb-2">
                <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search values..."
                  value={popoverSearchTerm}
                  onChange={(e) => setPopoverSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-7 pr-2 py-1.5 text-[11px] font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Quick Select All / Clear Row */}
              <div className="flex items-center justify-between px-1 mb-2 text-[10px] font-bold text-slate-500">
                <button
                  type="button"
                  onClick={() => selectAllValuesForColumn(colKey)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => clearValuesForColumn(colKey)}
                  className="text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>

              {/* Scrollable Checkbox List with Dynamic Values and Counts */}
              <div className="max-h-48 overflow-y-auto space-y-1 scrollbar-thin">
                {filteredDistinct.length === 0 ? (
                  <p className="text-[11px] text-slate-400 py-3 text-center">No matching values</p>
                ) : (
                  filteredDistinct.map((item) => {
                    const isChecked = (selectedMultiFilters[colKey] || []).includes(item.value);
                    return (
                      <label
                        key={item.value}
                        className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          isChecked ? "bg-blue-50/80 font-bold text-blue-900" : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleMultiFilterValue(colKey, item.value)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span className="truncate" title={item.label}>
                            {item.label}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full shrink-0">
                          {item.count}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>

              {/* Popover Footer */}
              <div className="pt-2.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium">
                  {selectedCount > 0 ? `${selectedCount} selected` : "No filter applied"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveFilterDropdown(null);
                    setPopoverSearchTerm("");
                  }}
                  className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </>
        )}
      </th>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              Admin Lead Engine & Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Global Leads Distribution Hub
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
            Dynamic values multi-selection filters, interactive column sorting, and full granularity across all buyer inquiries.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Column Visibility Selector */}
          {activeTab !== "conversion_system" && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Columns ({Object.values(visibleColumns).filter(Boolean).length}/14)</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isColumnSelectorOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsColumnSelectorOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                      <span className="text-xs font-black text-slate-800">Visible Columns</span>
                      <button
                        type="button"
                        onClick={() => {
                          const allTrue: Record<string, boolean> = {};
                          COLUMN_LIST.forEach((col) => (allTrue[col.id] = true));
                          setVisibleColumns(allTrue);
                        }}
                        className="text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer"
                      >
                        Show All
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {COLUMN_LIST.map((col) => (
                        <label
                          key={col.id}
                          className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 px-2 py-1 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.id] !== false}
                            onChange={(e) =>
                              setVisibleColumns({ ...visibleColumns, [col.id]: e.target.checked })
                            }
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <span>{col.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || (activeTab === "conversion_system" ? filteredConversions.length === 0 : processedLeads.length === 0)}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 cursor-pointer"
            title="Export all visible records to CSV for Excel"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to CSV ({activeTab === "conversion_system" ? filteredConversions.length : processedLeads.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Leads</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.total || leads.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Purchased Leads</p>
            <p className="text-xl sm:text-2xl font-black text-emerald-600">{stats.unlocked}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Inquiries</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900">{processedLeads.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Conversion Hub</p>
            <p className="text-xl sm:text-2xl font-black text-purple-700">{conversions.length}</p>
          </div>
        </div>
      </div>

      {/* 6 Category Tabs */}
      <div className="border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all" as const, label: "All Leads", icon: Users },
            { id: "signup" as const, label: "City Leads", icon: MapPin },
            { id: "opened_property" as const, label: "Opened Property", icon: Building2 },
            { id: "tried_to_contact" as const, label: "Tried to Contact", icon: Phone },
            { id: "purchased" as const, label: "Purchased Leads", icon: ShoppingCart },
            { id: "conversion_system" as const, label: "Contact Provider for Conversion", icon: Award },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border shrink-0 cursor-pointer ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                <span>{tab.label}</span>
                {tab.id === "conversion_system" && conversions.length > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                    {conversions.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Search & Filter Toolbar */}
      {activeTab !== "conversion_system" && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Global search: tenant name, phone, college, area, city, property title, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium"
              />
            </div>

            {/* Quick Filter Selectors */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
              {/* City Dropdown */}
              <div className="relative inline-flex items-center">
                <MapPin className="w-3.5 h-3.5 text-blue-600 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                >
                  <option value="all">All Cities</option>
                  {Array.from(new Set(["Greater Noida", "Delhi", "Noida", "Gurgaon", "Bangalore", ...availableCities])).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Lead Tier Dropdown */}
              <div className="relative inline-flex items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedLeadType}
                  onChange={(e) => setSelectedLeadType(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                >
                  <option value="all">All Tiers</option>
                  <option value="shared">Shared Pool</option>
                  <option value="verified">Verified Lead</option>
                  <option value="exclusive">Exclusive (1 Buyer)</option>
                  <option value="pay_per_booking">Pay Per Booking</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Timeframe Dropdown */}
              <div className="relative inline-flex items-center">
                <Calendar className="w-3.5 h-3.5 text-purple-600 absolute left-2.5 pointer-events-none" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl pl-7 pr-7 py-2 text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-all"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">Past 7 Days</option>
                  <option value="month">Past 30 Days</option>
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 pointer-events-none" />
              </div>

              {/* Reset All Filters */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-red-600 px-2 py-2 transition-colors cursor-pointer"
                  title="Reset all search and column filters"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Active Multi-Filters Chips Bar */}
          {Object.keys(selectedMultiFilters).length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider mr-1">
                Active Column Filters:
              </span>
              {Object.entries(selectedMultiFilters).map(([colKey, vals]) => {
                const colLabel = COLUMN_LIST.find((c) => c.id === colKey)?.label || colKey;
                return (
                  <span
                    key={colKey}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-lg text-xs font-bold"
                  >
                    <span>{colLabel}:</span>
                    <span className="text-blue-950 font-black">{vals.join(", ")}</span>
                    <button
                      type="button"
                      onClick={() => clearValuesForColumn(colKey)}
                      className="hover:text-red-600 transition-colors ml-0.5 cursor-pointer"
                      title={`Remove filter on ${colLabel}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedMultiFilters({})}
                className="text-[11px] font-extrabold text-red-600 hover:underline px-1 py-0.5 cursor-pointer"
              >
                Clear All Column Filters
              </button>
            </div>
          )}

          <div className="flex items-center justify-between text-xs font-bold text-slate-500 pt-1 border-t border-slate-100">
            <span>Showing {processedLeads.length} of {leads.length} records</span>
            <span className="text-slate-400 text-[11px]">
              Tip: Click the <Filter className="w-3 h-3 inline text-blue-600 mx-0.5" /> icon on any column header to select multiple values with search
            </span>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSISTED CONVERSION DESK (ADMIN VIEW) */}
      {activeTab === "conversion_system" ? (
        <div className="space-y-6">
          {/* Conversion Pipeline Metrics Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Total Requests</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{conversionStats.total}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Pending Review</p>
                <p className="text-xl sm:text-2xl font-black text-amber-600">{conversionStats.pending}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">In Discussion</p>
                <p className="text-xl sm:text-2xl font-black text-blue-600">{conversionStats.inProgress}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Visits Scheduled</p>
                <p className="text-xl sm:text-2xl font-black text-orange-600">{conversionStats.visitScheduled}</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm flex items-center gap-3 col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase">Converted 🎉</p>
                <p className="text-xl sm:text-2xl font-black text-emerald-600">{conversionStats.converted}</p>
              </div>
            </div>
          </div>

          {/* Main Oversight Card */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Search & Pipeline Filters */}
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search tenant, owner, property, phone, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-xs sm:text-sm font-medium"
                />
              </div>

              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { id: "all", label: "All Statuses" },
                  { id: "pending", label: "Pending" },
                  { id: "assigned", label: "Assigned" },
                  { id: "in_progress", label: "In Progress" },
                  { id: "visit_scheduled", label: "Visit Scheduled" },
                  { id: "converted", label: "Converted" },
                  { id: "dropped", label: "Dropped" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setConversionStatusFilter(st.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      conversionStatusFilter === st.id
                        ? "bg-purple-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {conversionsLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto mb-3" />
                <p className="text-slate-500 font-bold text-sm">Loading assisted conversion requests...</p>
              </div>
            ) : filteredConversions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 font-medium px-4">
                <Award className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-base font-bold text-slate-700">No assisted conversion requests found</p>
                <p className="text-xs text-slate-400 mt-1">
                  When owners share leads for provider team conversion, they will be listed here.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredConversions.map((conv: any) => {
                  const draft = rowDrafts[conv._id] || {
                    status: conv.status || "pending",
                    salesAgentName: conv.salesAgentName || "",
                    adminNotes: conv.adminNotes || "",
                  };
                  const isSavingThis = savingId === conv._id;
                  const isSuccessThis = successId === conv._id;

                  return (
                    <div key={conv._id} className="p-5 sm:p-6 hover:bg-slate-50/70 transition-colors space-y-4">
                      {/* Top Bar: Tenant details, Owner info, Timestamps */}
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        {/* Tenant Column */}
                        <div className="space-y-1.5 flex-1 min-w-[260px]">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm sm:text-base font-black text-slate-900">
                              {conv.tenantName}
                            </span>
                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {conv.tenantPhone}
                            </span>
                            <a
                              href={`tel:${conv.tenantPhone}`}
                              className="p-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                              title="Call Tenant"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`https://wa.me/91${(conv.tenantPhone || "").replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-black text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                              title="WhatsApp Tenant"
                            >
                              WA
                            </a>
                          </div>

                          <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap font-medium">
                            {conv.city && <span>📍 {conv.area ? `${conv.area}, ${conv.city}` : conv.city}</span>}
                            {conv.budget && <span>• Budget: ₹{conv.budget.toLocaleString("en-IN")}/mo</span>}
                            {conv.moveInTimeline && <span>• Timeline: {conv.moveInTimeline}</span>}
                          </p>

                          {conv.ownerNotes && (
                            <div className="bg-purple-50/60 border border-purple-200/80 rounded-xl p-2.5 text-xs text-purple-900 mt-1">
                              <span className="font-extrabold text-purple-950 block text-[10px] uppercase tracking-wider mb-0.5">
                                Owner Note:
                              </span>
                              "{conv.ownerNotes}"
                            </div>
                          )}
                        </div>

                        {/* Owner & Target Property Column */}
                        <div className="space-y-1 text-xs lg:w-72 shrink-0 bg-slate-50 p-3 rounded-2xl border border-slate-200/70">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Linked Property Owner
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="font-extrabold text-slate-900">{conv.ownerId?.name || "Property Owner"}</p>
                            {conv.ownerId?.phone && (
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${conv.ownerId.phone}`}
                                  className="text-slate-500 hover:text-blue-600"
                                  title="Call Owner"
                                >
                                  <Phone className="w-3 h-3" />
                                </a>
                                <a
                                  href={`https://wa.me/91${conv.ownerId.phone.replace(/\D/g, "")}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded"
                                  title="WhatsApp Owner"
                                >
                                  WA
                                </a>
                              </div>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500">{conv.ownerId?.email || conv.ownerId?.phone || ""}</p>
                          
                          <div className="pt-1.5 border-t border-slate-200/60 mt-1">
                            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              Target Property
                            </p>
                            {conv.propertyId ? (
                              <p className="font-bold text-slate-800 truncate" title={conv.propertyId.title}>
                                {conv.propertyId.title} (₹{conv.propertyId.price?.toLocaleString("en-IN")}/mo)
                              </p>
                            ) : (
                              <p className="text-slate-400 font-medium italic">General / Open placement</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Bar: Status Controls & Live Feedback Update to Owner */}
                      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                        {/* Status Select */}
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                            Conversion Stage
                          </label>
                          <select
                            value={draft.status}
                            onChange={(e) =>
                              setRowDrafts((prev) => ({
                                ...prev,
                                [conv._id]: { ...draft, status: e.target.value },
                              }))
                            }
                            className={`w-full text-xs font-black border rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${getConversionStatusBadge(
                              draft.status
                            )}`}
                          >
                            <option value="pending">⏳ Pending Review</option>
                            <option value="assigned">👤 Agent Assigned</option>
                            <option value="in_progress">📞 Follow-up in Progress</option>
                            <option value="visit_scheduled">📅 Site Visit Scheduled</option>
                            <option value="converted">🎉 Converted & Placed</option>
                            <option value="dropped">❌ Closed / Dropped</option>
                          </select>
                        </div>

                        {/* Assigned Sales Agent */}
                        <div className="sm:col-span-3 space-y-1">
                          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                            Assigned Sales Agent
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Vikas Sharma (Field Lead)"
                            value={draft.salesAgentName}
                            onChange={(e) =>
                              setRowDrafts((prev) => ({
                                ...prev,
                                [conv._id]: { ...draft, salesAgentName: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        {/* Live Sales Team Update / Feedback to Owner */}
                        <div className="sm:col-span-4 space-y-1">
                          <label className="text-[10px] font-extrabold text-purple-900 uppercase tracking-wider flex items-center gap-1">
                            <Headphones className="w-3 h-3 text-purple-600" />
                            <span>Live Update to Owner</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Call connected, tenant agreed to visit this Sat at 4 PM"
                            value={draft.adminNotes}
                            onChange={(e) =>
                              setRowDrafts((prev) => ({
                                ...prev,
                                [conv._id]: { ...draft, adminNotes: e.target.value },
                              }))
                            }
                            className="w-full bg-white border border-purple-200 text-xs font-medium text-slate-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>

                        {/* Save Button */}
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => handleUpdateConversion(conv._id)}
                            disabled={isSavingThis}
                            className={`w-full py-2 px-3 text-xs font-extrabold rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSuccessThis
                                ? "bg-emerald-600 text-white"
                                : "bg-purple-600 hover:bg-purple-700 text-white"
                            }`}
                          >
                            {isSavingThis ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Saving...</span>
                              </>
                            ) : isSuccessThis ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-3.5 h-3.5" />
                                <span>Save Update</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Timestamps */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Submitted on {new Date(conv.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        {conv.lastContactedAt && (
                          <span>Last outreach: {new Date(conv.lastContactedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* GRANULAR DISTINCT COLUMNS TABLE WITH COLUMN SORT & DYNAMIC VALUE MULTI-SELECT FILTERS */
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {isLoading ? (
            <div className="py-24 text-center">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
              <p className="text-slate-500 font-bold text-sm">Loading lead records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto relative">
              <table className="w-full text-left border-collapse min-w-[1550px]">
                {/* Table Header with Sorting & Dynamic Multi-Select Filter Popover */}
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 text-xs font-extrabold uppercase tracking-wider select-none">
                    {visibleColumns.tenantName && renderColumnHeader("tenantName", "Tenant Name")}
                    {visibleColumns.phone && renderColumnHeader("phone", "Phone / WA")}
                    {visibleColumns.gender && renderColumnHeader("gender", "Gender")}
                    {visibleColumns.college && renderColumnHeader("college", "College / Org")}
                    {visibleColumns.city && renderColumnHeader("city", "Target City")}
                    {visibleColumns.area && renderColumnHeader("area", "Area / Sector")}
                    {visibleColumns.property && renderColumnHeader("property", "Target Property")}
                    {visibleColumns.category && renderColumnHeader("category", "Category")}
                    {visibleColumns.leadType && renderColumnHeader("leadType", "Lead Tier")}
                    {visibleColumns.budget && renderColumnHeader("budget", "Budget (₹)")}
                    {visibleColumns.moveIn && renderColumnHeader("moveIn", "Move-in")}
                    {visibleColumns.priceUnlocks && renderColumnHeader("priceUnlocks", "Price & Unlocks")}
                    {visibleColumns.owner && renderColumnHeader("owner", "Linked Owner")}
                    {visibleColumns.createdAt && (
                      <th
                        onClick={() => handleSort("createdAt")}
                        className="py-3 px-3 cursor-pointer hover:bg-slate-100 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Created At</span>
                          {renderSortIndicator("createdAt")}
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
                  {processedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-20 text-center text-slate-400 font-medium">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-bold text-slate-700">No leads match your selected multi-filters</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try adjusting or clearing the active filters above.
                        </p>
                        <button
                          type="button"
                          onClick={handleResetFilters}
                          className="mt-3 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          Clear All Filters
                        </button>
                      </td>
                    </tr>
                  ) : (
                    processedLeads.map((lead) => {
                      const isCopied = copiedPhoneId === lead._id;
                      return (
                        <tr key={lead._id} className="hover:bg-slate-50/70 transition-colors">
                          {/* 1. Tenant Name */}
                          {visibleColumns.tenantName && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-extrabold text-slate-900 text-xs">{lead.tenantName}</span>
                            </td>
                          )}

                          {/* 2. Phone & WhatsApp */}
                          {visibleColumns.phone && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${lead.tenantPhone}`}
                                  className="font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1 text-xs"
                                  title="Call tenant"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{lead.tenantPhone || "No Phone"}</span>
                                </a>

                                {lead.tenantPhone && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPhone(lead.tenantPhone, lead._id)}
                                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                                      title={isCopied ? "Copied!" : "Copy Phone"}
                                    >
                                      {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                    </button>

                                    <a
                                      href={`https://wa.me/91${lead.tenantPhone.replace(/\D/g, "")}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[9px] font-black text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 transition-colors"
                                      title="Open WhatsApp chat"
                                    >
                                      WA
                                    </a>
                                  </>
                                )}
                              </div>
                            </td>
                          )}

                          {/* 3. Gender */}
                          {visibleColumns.gender && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                  lead.gender === "male"
                                    ? "bg-blue-50 text-blue-700"
                                    : lead.gender === "female"
                                    ? "bg-pink-50 text-pink-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {lead.gender || "Any"}
                              </span>
                            </td>
                          )}

                          {/* 4. College / Company */}
                          {visibleColumns.college && (
                            <td className="py-3.5 px-3 max-w-[180px] truncate" title={lead.college || ""}>
                              {lead.college ? (
                                <span className="font-semibold text-slate-800 text-xs">🎓 {lead.college}</span>
                              ) : (
                                <span className="text-slate-300 text-xs">-</span>
                              )}
                            </td>
                          )}

                          {/* 5. Target City */}
                          {visibleColumns.city && (
                            <td className="py-3.5 px-3 whitespace-nowrap font-bold text-slate-900 text-xs">
                              📍 {lead.city || "Greater Noida"}
                            </td>
                          )}

                          {/* 6. Target Area */}
                          {visibleColumns.area && (
                            <td className="py-3.5 px-3 whitespace-nowrap text-slate-700 font-medium text-xs">
                              {lead.area || "Campus / Sector Area"}
                            </td>
                          )}

                          {/* 7. Target Property */}
                          {visibleColumns.property && (
                            <td className="py-3.5 px-3 max-w-[200px]" title={lead.propertyId?.title || ""}>
                              {lead.propertyId?.title ? (
                                <div>
                                  <p className="font-bold text-indigo-700 truncate text-xs">🏠 {lead.propertyId.title}</p>
                                  {lead.propertyId.price && (
                                    <p className="text-[10px] text-slate-400 font-semibold">
                                      ₹{lead.propertyId.price.toLocaleString("en-IN")}/mo
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-slate-300 text-xs">General Prospect</span>
                              )}
                            </td>
                          )}

                          {/* 8. Lead Category */}
                          {visibleColumns.category && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {getCategoryBadge(lead.category)}
                            </td>
                          )}

                          {/* 9. Lead Tier */}
                          {visibleColumns.leadType && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                {getLeadTypeBadge(lead)}
                                {lead.isVerified && (
                                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                            </td>
                          )}

                          {/* 10. Budget */}
                          {visibleColumns.budget && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="font-black text-slate-900 text-xs">
                                ₹{lead.budget ? lead.budget.toLocaleString("en-IN") : "10,000"}
                              </span>
                              <span className="text-[10px] text-slate-400 block">per month</span>
                            </td>
                          )}

                          {/* 11. Move-in */}
                          {visibleColumns.moveIn && (
                            <td className="py-3.5 px-3 whitespace-nowrap text-slate-600 font-medium text-xs">
                              {lead.moveInTimeline || "Immediate"}
                            </td>
                          )}

                          {/* 12. Price & Unlocks */}
                          {visibleColumns.priceUnlocks && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  ₹{lead.price || 49}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setSelectedSharedLead(lead)}
                                  className="text-[10px] text-slate-500 hover:text-blue-600 font-extrabold flex items-center gap-1 cursor-pointer transition-colors group"
                                  title="Click to view unlocked owners profiles"
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    (lead.unlockedOwners?.length ?? lead.unlockedBy?.length ?? 0) > 0 ? "bg-emerald-500" : "bg-slate-300"
                                  }`}></span>
                                  <span className="group-hover:underline">
                                    {lead.unlockedOwners?.length ?? lead.unlockedBy?.length ?? 0} / {lead.maxBuyers || 4} Unlocks
                                  </span>
                                </button>
                              </div>
                            </td>
                          )}

                          {/* 13. Linked Owner */}
                          {visibleColumns.owner && (
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {lead.ownerId ? (
                                <div className="text-xs space-y-0.5">
                                  <p className="font-bold text-slate-900">{lead.ownerId.name || "Owner"}</p>
                                  {lead.ownerId.phone && (
                                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                                      <a href={`tel:${lead.ownerId.phone}`} className="hover:text-blue-600">
                                        {lead.ownerId.phone}
                                      </a>
                                      <a
                                        href={`https://wa.me/91${lead.ownerId.phone.replace(/\D/g, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-[9px] font-black text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded"
                                      >
                                        WA
                                      </a>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 font-normal">Platform Pool</span>
                              )}
                            </td>
                          )}

                          {/* 14. Created At */}
                          {visibleColumns.createdAt && (
                            <td className="py-3.5 px-3 whitespace-nowrap text-slate-500 text-[11px]">
                              {lead.createdAt
                                ? new Date(lead.createdAt).toLocaleDateString("en-IN", {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "-"}
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Shared Lead Unlocked Owners Profile Modal */}
      {mounted && selectedSharedLead && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          {/* Backdrop Click */}
          <div
            className="absolute inset-0"
            onClick={() => setSelectedSharedLead(null)}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-200">
            {(() => {
              const isExclusive = selectedSharedLead.leadType === "exclusive" || selectedSharedLead.leadType === "verified";
              const count = selectedSharedLead.unlockedOwners?.length ?? selectedSharedLead.unlockedBy?.length ?? 0;
              const maxCap = isExclusive ? 1 : (selectedSharedLead.maxBuyers || 4);
              const remaining = Math.max(0, maxCap - count);
              const percentage = Math.min(100, Math.round((count / maxCap) * 100));

              return (
                <>
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white p-5 sm:p-6 relative">
                    <button
                      type="button"
                      onClick={() => setSelectedSharedLead(null)}
                      className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                      title="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                      {isExclusive ? (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-amber-400" /> Exclusive Lead Intelligence
                        </span>
                      ) : (
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider inline-flex items-center gap-1">
                          <Users className="w-3 h-3" /> Shared Lead Intelligence
                        </span>
                      )}
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        ₹{selectedSharedLead.price || (isExclusive ? 99 : 49)} / Unlock
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                      <span>{isExclusive ? "Exclusive Owner Profile" : "Shared Owners Profile List"}</span>
                      <span className="text-xs font-bold text-slate-300 bg-white/10 px-2.5 py-0.5 rounded-full">
                        {count} of {maxCap} {maxCap === 1 ? "Slot" : "Slots"} Unlocked
                      </span>
                    </h2>

                    {/* Lead Summary Subtitle */}
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white/5 border border-white/10 rounded-2xl p-3">
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Tenant Prospect</p>
                        <p className="font-extrabold text-white truncate">{selectedSharedLead.tenantName || "Tenant"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Location / City</p>
                        <p className="font-bold text-slate-200 truncate">{selectedSharedLead.area || selectedSharedLead.city || "Greater Noida"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Target Budget</p>
                        <p className="font-bold text-emerald-400">₹{selectedSharedLead.budget ? selectedSharedLead.budget.toLocaleString("en-IN") : "10,000"}/mo</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-semibold">Move-in Timeline</p>
                        <p className="font-bold text-slate-200 truncate">{selectedSharedLead.moveInTimeline || "Immediate"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Capacity Progress Bar */}
                  <div className="bg-slate-50 border-b border-slate-200/80 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Unlock Capacity</span>
                        <span>{count} / {maxCap} {maxCap === 1 ? "Slot" : "Slots"} ({percentage}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            count >= maxCap ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg border inline-flex items-center gap-1 ${
                        remaining === 0
                          ? "bg-rose-50 text-rose-700 border-rose-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}>
                        {remaining === 0
                          ? (isExclusive ? "Sold Out (Exclusive Lead)" : `All ${maxCap} Slots Sold Out`)
                          : `${remaining} Slot${remaining > 1 ? "s" : ""} Available to Owners`}
                      </span>
                    </div>
                  </div>

                  {/* Modal Body: Owners List */}
                  <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                    {(!selectedSharedLead.unlockedOwners || selectedSharedLead.unlockedOwners.length === 0) &&
                     (!selectedSharedLead.unlockedBy || selectedSharedLead.unlockedBy.length === 0) ? (
                      <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
                          {isExclusive ? <ShieldCheck className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-base">No Owners Have Unlocked Yet</h3>
                        <p className="text-xs text-slate-500 max-w-md mx-auto">
                          {isExclusive
                            ? `This exclusive lead is available in the marketplace for 1 owner at ₹${selectedSharedLead.price || 99}. As soon as an owner purchases it, their profile will appear here.`
                            : `This shared lead is live in the marketplace at ₹${selectedSharedLead.price || 49}. Up to 4 owners can unlock this lead. As soon as an owner purchases it, their full profile and contact details will appear here.`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-wider">
                          {isExclusive ? "Purchased Owner Profile (1)" : `Purchased Owners Profiles (${count})`}
                        </p>

                        {/* Render Each Owner Profile Card */}
                        {(selectedSharedLead.unlockedOwners && selectedSharedLead.unlockedOwners.length > 0
                          ? selectedSharedLead.unlockedOwners
                          : selectedSharedLead.unlockedBy
                        ).map((owner: any, idx: number) => {
                          const ownerName = typeof owner === "object" ? owner.name || "Owner" : "Owner";
                          const ownerPhone = typeof owner === "object" ? owner.phone : "";
                          const ownerEmail = typeof owner === "object" ? owner.email : "";
                          const ownerRole = typeof owner === "object" ? owner.role || "owner" : "owner";
                          const ownerCity = typeof owner === "object" ? owner.city || "Greater Noida" : "Greater Noida";
                          const unlockedDate = typeof owner === "object" && owner.unlockedAt ? new Date(owner.unlockedAt) : null;
                          const amountPaid = typeof owner === "object" ? owner.amountPaid || selectedSharedLead.price || 49 : selectedSharedLead.price || 49;
                          const cleanPhone = ownerPhone ? ownerPhone.replace(/\D/g, "") : "";

                          return (
                            <div
                              key={owner._id || owner.id || idx}
                              className="bg-white border border-slate-200/90 hover:border-blue-400 rounded-2xl p-4 transition-all hover:shadow-md space-y-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
                                    {ownerName.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-extrabold text-slate-900 text-sm">{ownerName}</h4>
                                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 capitalize">
                                        {ownerRole}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3 text-slate-400" />
                                      <span>{ownerCity}</span>
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                    <Wallet className="w-3 h-3 text-emerald-600" /> ₹{amountPaid} Debited
                                  </span>
                                  {unlockedDate && (
                                    <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center justify-end gap-1">
                                      <Clock className="w-3 h-3" />
                                      {unlockedDate.toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Contact & Action Row */}
                              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  {ownerPhone ? (
                                    <>
                                      <a
                                        href={`tel:${ownerPhone}`}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                      >
                                        <Phone className="w-3 h-3 text-blue-400" />
                                        <span>{ownerPhone}</span>
                                      </a>

                                      <a
                                        href={`https://wa.me/91${cleanPhone.replace(/^91/, "")}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                                      >
                                        <span className="font-black text-[11px]">WA</span>
                                        <span>WhatsApp</span>
                                      </a>
                                    </>
                                  ) : (
                                    <span className="text-xs text-slate-400 italic">No phone recorded</span>
                                  )}

                                  {ownerEmail && (
                                    <a
                                      href={`mailto:${ownerEmail}`}
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all"
                                    >
                                      <Mail className="w-3 h-3 text-slate-500" />
                                      <span className="truncate max-w-[160px]">{ownerEmail}</span>
                                    </a>
                                  )}
                                </div>

                                <Link
                                  href={`/admin/owners`}
                                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors ml-auto"
                                >
                                  <span>Manage Owner</span>
                                  <ExternalLink className="w-3 h-3" />
                                </Link>
                              </div>
                            </div>
                          );
                        })}

                        {/* Remaining Open Slots Placeholders (Only for shared leads) */}
                        {!isExclusive && remaining > 0 && Array.from({ length: remaining }).map((_, i) => (
                          <div
                            key={`empty-slot-${i}`}
                            className="bg-slate-50/70 border border-dashed border-slate-300 rounded-2xl p-3.5 flex items-center justify-between text-xs text-slate-500"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-slate-200/80 text-slate-400 font-black text-xs flex items-center justify-center">
                                #{count + i + 1}
                              </div>
                              <div>
                                <p className="font-bold text-slate-700">Slot #{count + i + 1} Available</p>
                                <p className="text-[11px] text-slate-400">Open in owner marketplace for unlock</p>
                              </div>
                            </div>
                            <span className="font-extrabold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg">
                              ₹{selectedSharedLead.price || 49}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-4 flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      <span className="font-bold text-slate-700">Lead ID:</span> {selectedSharedLead._id || selectedSharedLead.id}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedSharedLead(null)}
                      className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
