"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { 
  Building2, 
  Search, 
  PlusCircle, 
  MinusCircle,
  Wallet, 
  DollarSign, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Loader2, 
  CheckCircle2, 
  X,
  Building,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  FileSpreadsheet,
  Copy,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  Calendar,
  Check,
  ShoppingCart
} from "lucide-react";

export default function AdminOwnersManagement() {
  const [owners, setOwners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Status Tabs
  // all | active_buyers | low_balance | healthy_balance | with_properties | no_properties
  const [activeTab, setActiveTab] = useState<string>("all");

  // Dynamic Multi-Selection Column Filters State
  // { [colKey]: ["val1", "val2"] }
  const [selectedMultiFilters, setSelectedMultiFilters] = useState<Record<string, string[]>>({});
  const [activeFilterDropdown, setActiveFilterDropdown] = useState<string | null>(null);
  const [popoverSearchTerm, setPopoverSearchTerm] = useState<string>("");

  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    name: true,
    contact: true,
    location: true,
    walletBalance: true,
    propertiesCount: true,
    purchasesCount: true,
    createdAt: true,
  });
  const [isColumnSelectorOpen, setIsColumnSelectorOpen] = useState<boolean>(false);

  // Sorting State
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });

  // Detailed Owner Profile Modal State
  const [detailedOwnerId, setDetailedOwnerId] = useState<string | null>(null);
  const [detailedOwnerData, setDetailedOwnerData] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [profileModalTab, setProfileModalTab] = useState<"overview" | "properties" | "leads" | "transactions">("overview");

  // Modal State for Adding/Deducting Wallet Balance
  const [adjustingOwner, setAdjustingOwner] = useState<any | null>(null);
  const [adjustAction, setAdjustAction] = useState<"credit" | "debit">("credit");
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustNote, setAdjustNote] = useState<string>("Admin Promotional Bonus Credit");
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState<boolean>(false);

  // Client mounted state for Portal
  const [mounted, setMounted] = useState<boolean>(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (detailedOwnerId || adjustingOwner) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          if (adjustingOwner) setAdjustingOwner(null);
          else if (detailedOwnerId) setDetailedOwnerId(null);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [detailedOwnerId, adjustingOwner]);

  const fetchOwners = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/owners");
      if (res.ok) {
        const data = await res.json();
        setOwners(data.owners || []);
      }
    } catch (e) {
      console.error("Failed to fetch owners:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  // Fetch detailed owner profile data
  const handleOpenProfileModal = async (ownerId: string) => {
    setDetailedOwnerId(ownerId);
    setProfileModalTab("overview");
    setIsLoadingDetails(true);
    setDetailedOwnerData(null);
    try {
      const res = await fetch(`/api/admin/owners?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        setDetailedOwnerData(data);
      } else {
        alert("Failed to load owner profile details.");
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching owner profile.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleOpenAdjustModal = (owner: any, defaultAction: "credit" | "debit" = "credit") => {
    setAdjustingOwner(owner);
    setAdjustAction(defaultAction);
    setAdjustAmount(defaultAction === "credit" ? 500 : 200);
    setAdjustNote(defaultAction === "credit" ? "Admin Promotional Bonus Credit" : "Manual balance correction");
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingOwner) return;

    try {
      setIsSubmittingAdjust(true);
      setMessage("");
      setErrorMessage("");

      const res = await fetch("/api/admin/owners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ownerId: adjustingOwner._id || adjustingOwner.id,
          amount: adjustAmount,
          action: adjustAction,
          note: adjustNote
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to adjust balance");

      setMessage(
        adjustAction === "credit"
          ? `Successfully added ₹${adjustAmount} credit to ${adjustingOwner.name}'s wallet!`
          : `Successfully deducted ₹${adjustAmount} from ${adjustingOwner.name}'s wallet!`
      );

      // Refresh data
      await fetchOwners();

      // If detailed modal is currently open for this owner, refresh its data too
      if (detailedOwnerId === (adjustingOwner._id || adjustingOwner.id)) {
        const detailRes = await fetch(`/api/admin/owners?ownerId=${detailedOwnerId}`);
        if (detailRes.ok) {
          const updatedDetail = await detailRes.json();
          setDetailedOwnerData(updatedDetail);
        }
      }
      
      setAdjustingOwner(null);
      setTimeout(() => setMessage(""), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update balance");
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Balance tier calculation for filtering
  const getBalanceTier = (bal: number) => {
    if (bal <= 100) return "Low (≤ ₹100)";
    if (bal <= 500) return "Moderate (₹101 - ₹500)";
    if (bal <= 1000) return "Healthy (₹501 - ₹1,000)";
    return "High (> ₹1,000)";
  };

  // Property count tier calculation
  const getPropertyCountTier = (count: number) => {
    if (count === 0) return "0 Properties";
    if (count === 1) return "1 Property";
    return "2+ Properties";
  };

  // Leads count tier calculation
  const getLeadsCountTier = (count: number) => {
    if (count === 0) return "0 Leads";
    if (count <= 3) return "1 - 3 Leads";
    return "4+ Leads";
  };

  // Sorting Handler
  const handleSort = (key: string) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Dynamic Filter Toggle
  const toggleMultiFilterValue = (colKey: string, val: string) => {
    setSelectedMultiFilters((prev) => {
      const current = prev[colKey] || [];
      const updated = current.includes(val)
        ? current.filter((v) => v !== val)
        : [...current, val];

      if (updated.length === 0) {
        const next = { ...prev };
        delete next[colKey];
        return next;
      }
      return { ...prev, [colKey]: updated };
    });
  };

  const selectAllValuesForColumn = (colKey: string) => {
    const distinct = getDistinctColumnValues(colKey).map((d) => d.value);
    setSelectedMultiFilters((prev) => ({
      ...prev,
      [colKey]: distinct,
    }));
  };

  const clearValuesForColumn = (colKey: string) => {
    setSelectedMultiFilters((prev) => {
      const next = { ...prev };
      delete next[colKey];
      return next;
    });
  };

  // Compute Distinct Values & Counts for a Given Column
  const getDistinctColumnValues = (colKey: string): { label: string; value: string; count: number }[] => {
    const counts: Record<string, number> = {};

    owners.forEach((owner) => {
      let val = "";
      if (colKey === "name") val = owner.name || "Unnamed";
      else if (colKey === "city") val = owner.city || "New Delhi";
      else if (colKey === "location") val = owner.location || "North Campus";
      else if (colKey === "walletBalance") val = getBalanceTier(owner.walletBalance || 0);
      else if (colKey === "propertiesCount") val = getPropertyCountTier(owner.propertiesCount || 0);
      else if (colKey === "purchasesCount") val = getLeadsCountTier(owner.purchasesCount || 0);
      else if (colKey === "createdAt") {
        val = owner.createdAt ? new Date(owner.createdAt).getFullYear().toString() : "Recent";
      }

      if (val) {
        counts[val] = (counts[val] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .map(([value, count]) => ({ label: value, value, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Filter & Sort Pipeline
  const processedOwners = useMemo(() => {
    let result = [...owners];

    // 1. Status Tabs Filter
    if (activeTab === "active_buyers") {
      result = result.filter((o) => (o.purchasesCount || 0) > 0 || (o.totalSpent || 0) > 0);
    } else if (activeTab === "low_balance") {
      result = result.filter((o) => (o.walletBalance || 0) <= 100);
    } else if (activeTab === "healthy_balance") {
      result = result.filter((o) => (o.walletBalance || 0) > 500);
    } else if (activeTab === "with_properties") {
      result = result.filter((o) => (o.propertiesCount || 0) > 0);
    } else if (activeTab === "no_properties") {
      result = result.filter((o) => (o.propertiesCount || 0) === 0);
    }

    // 2. Global Text Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.name?.toLowerCase().includes(q) ||
          o.email?.toLowerCase().includes(q) ||
          o.phone?.toLowerCase().includes(q) ||
          o.city?.toLowerCase().includes(q) ||
          o.location?.toLowerCase().includes(q)
      );
    }

    // 3. Dynamic Column Multi-Select Filters
    for (const [colKey, selectedValues] of Object.entries(selectedMultiFilters)) {
      if (!selectedValues || selectedValues.length === 0) continue;

      result = result.filter((owner) => {
        let ownerVal = "";
        if (colKey === "name") ownerVal = owner.name || "Unnamed";
        else if (colKey === "city") ownerVal = owner.city || "New Delhi";
        else if (colKey === "location") ownerVal = owner.location || "North Campus";
        else if (colKey === "walletBalance") ownerVal = getBalanceTier(owner.walletBalance || 0);
        else if (colKey === "propertiesCount") ownerVal = getPropertyCountTier(owner.propertiesCount || 0);
        else if (colKey === "purchasesCount") ownerVal = getLeadsCountTier(owner.purchasesCount || 0);
        else if (colKey === "createdAt") {
          ownerVal = owner.createdAt ? new Date(owner.createdAt).getFullYear().toString() : "Recent";
        }

        return selectedValues.includes(ownerVal);
      });
    }

    // 4. Sorting
    result.sort((a, b) => {
      const { key, direction } = sortConfig;
      let valA: any = a[key];
      let valB: any = b[key];

      if (key === "walletBalance") {
        valA = a.walletBalance || 0;
        valB = b.walletBalance || 0;
      } else if (key === "propertiesCount") {
        valA = a.propertiesCount || 0;
        valB = b.propertiesCount || 0;
      } else if (key === "purchasesCount") {
        valA = a.purchasesCount || 0;
        valB = b.purchasesCount || 0;
      } else if (key === "createdAt") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      } else if (key === "name") {
        valA = a.name || "";
        valB = b.name || "";
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
  }, [owners, activeTab, searchTerm, selectedMultiFilters, sortConfig]);

  // Overall Totals
  const totalBalance = owners.reduce((acc, curr) => acc + (curr.walletBalance || 0), 0);
  const totalSpent = owners.reduce((acc, curr) => acc + (curr.totalSpent || 0), 0);
  const totalPurchases = owners.reduce((acc, curr) => acc + (curr.purchasesCount || 0), 0);
  const lowBalanceCount = owners.filter((o) => (o.walletBalance || 0) <= 100).length;
  const activeBuyersCount = owners.filter((o) => (o.purchasesCount || 0) > 0 || (o.totalSpent || 0) > 0).length;

  const handleResetFilters = () => {
    setActiveTab("all");
    setSearchTerm("");
    setSelectedMultiFilters({});
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    activeTab !== "all" ||
    Object.keys(selectedMultiFilters).length > 0;

  // CSV Export Utility
  const handleExportCSV = () => {
    try {
      setIsExporting(true);
      const headers = [
        "Owner Name",
        "Phone Number",
        "Email Address",
        "City",
        "Area / Campus",
        "Wallet Balance (INR)",
        "Total Spent on Leads (INR)",
        "Properties Listed",
        "Leads Purchased",
        "Registration Date",
      ];

      const rows = processedOwners.map((owner) => [
        `"${(owner.name || "").replace(/"/g, '""')}"`,
        `"${(owner.phone || "").replace(/"/g, '""')}"`,
        `"${(owner.email || "").replace(/"/g, '""')}"`,
        `"${(owner.city || "").replace(/"/g, '""')}"`,
        `"${(owner.location || "").replace(/"/g, '""')}"`,
        owner.walletBalance || 0,
        owner.totalSpent || 0,
        owner.propertiesCount || 0,
        owner.purchasesCount || 0,
        owner.createdAt ? new Date(owner.createdAt).toLocaleString("en-IN") : "",
      ]);

      const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `super-rent-owners-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Failed to export CSV file.");
    } finally {
      setIsExporting(false);
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
      <th key={colKey} className="py-4 px-4 relative group select-none whitespace-nowrap">
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
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setActiveFilterDropdown(null);
                setPopoverSearchTerm("");
              }}
            />

            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 normal-case font-normal text-slate-800 animate-in fade-in zoom-in-95 duration-150"
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

  const COLUMN_LIST = [
    { id: "name", label: "Owner Profile" },
    { id: "contact", label: "Contact Info" },
    { id: "location", label: "Location" },
    { id: "walletBalance", label: "Wallet Balance" },
    { id: "propertiesCount", label: "Hostels Listed" },
    { id: "purchasesCount", label: "Leads Bought" },
    { id: "createdAt", label: "Registration Date" },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              Admin Platform Control
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Property Owner Management
          </h1>
          <p className="text-slate-500 mt-1 text-xs sm:text-sm font-medium">
            Monitor owner wallets, inspect listed properties, track purchased leads ledger, and grant credits.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          {/* Column Visibility Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnSelectorOpen(!isColumnSelectorOpen)}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Columns ({Object.values(visibleColumns).filter(Boolean).length}/7)</span>
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
                  <div className="space-y-1.5">
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

          {/* Export to CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={isExporting || processedOwners.length === 0}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-40 cursor-pointer"
            title="Export filtered owners to CSV for Excel"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Export to CSV ({processedOwners.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Registered Owners</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{owners.length}</p>
            <p className="text-[11px] text-blue-600 font-semibold mt-0.5">{activeBuyersCount} active buyers</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Wallet Balances</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{totalBalance.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{lowBalanceCount} owners low balance</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Lead Sales</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">₹{totalSpent.toLocaleString("en-IN")}</p>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Direct wallet deductions</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Leads Unlocked</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{totalPurchases}</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Purchased by owners</p>
          </div>
        </div>
      </div>

      {/* Category / Status Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", label: "All Owners", count: owners.length },
          { id: "active_buyers", label: "Active Buyers", count: activeBuyersCount },
          { id: "low_balance", label: "Low Balance (≤ ₹100)", count: lowBalanceCount },
          { id: "healthy_balance", label: "Healthy Balance (> ₹500)", count: owners.filter((o) => (o.walletBalance || 0) > 500).length },
          { id: "with_properties", label: "With Properties", count: owners.filter((o) => (o.propertiesCount || 0) > 0).length },
          { id: "no_properties", label: "No Properties", count: owners.filter((o) => (o.propertiesCount || 0) === 0).length },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-xs transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-slate-900 text-white shadow-md shadow-slate-900/10 scale-[1.02]"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Controls Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search owners by name, phone, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm font-medium shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs font-extrabold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}

            <div className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-900 font-extrabold">{processedOwners.length}</span> of {owners.length} Owners
            </div>
          </div>
        </div>

        {/* Data Table */}
        {isLoading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Loading owner accounts & wallet balances...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 text-xs font-extrabold uppercase tracking-wider">
                  {visibleColumns.name && renderColumnHeader("name", "Owner Profile")}
                  {visibleColumns.contact && <th className="py-4 px-4 whitespace-nowrap">Contact Details</th>}
                  {visibleColumns.location && renderColumnHeader("location", "Location")}
                  {visibleColumns.walletBalance && renderColumnHeader("walletBalance", "Wallet Balance")}
                  {visibleColumns.propertiesCount && renderColumnHeader("propertiesCount", "Hostels Listed")}
                  {visibleColumns.purchasesCount && renderColumnHeader("purchasesCount", "Leads Bought")}
                  {visibleColumns.createdAt && renderColumnHeader("createdAt", "Joined Date")}
                  <th className="py-4 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm font-medium">
                {processedOwners.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-slate-400">
                      <div className="max-w-sm mx-auto space-y-2">
                        <Users className="w-10 h-10 text-slate-300 mx-auto" />
                        <p className="font-extrabold text-slate-700 text-base">No property owners found</p>
                        <p className="text-xs text-slate-400 font-medium">
                          Try clearing search criteria or resetting filters to view all registered owners.
                        </p>
                        {hasActiveFilters && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-3 px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                          >
                            Reset Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  processedOwners.map((owner) => {
                    const isLowBalance = (owner.walletBalance || 0) <= 100;
                    return (
                      <tr key={owner.id || owner._id} className="hover:bg-slate-50/70 transition-colors group">
                        
                        {/* Owner Identity */}
                        {visibleColumns.name && (
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0">
                                {owner.name?.[0]?.toUpperCase() || "O"}
                              </div>
                              <div className="min-w-0">
                                <button
                                  type="button"
                                  onClick={() => handleOpenProfileModal(owner.id || owner._id)}
                                  className="font-extrabold text-slate-900 hover:text-blue-600 transition-colors text-left truncate block cursor-pointer"
                                  title="View detailed owner profile"
                                >
                                  {owner.name}
                                </button>
                                {(owner.businessName || owner.hostelName) && (
                                  <p className="text-[11px] font-bold text-indigo-600 truncate max-w-[180px]" title={owner.businessName || owner.hostelName}>
                                    {owner.businessName || owner.hostelName}
                                  </p>
                                )}
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-md font-extrabold border border-emerald-200/60 mt-0.5">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Owner
                                </span>
                              </div>
                            </div>
                          </td>
                        )}

                        {/* Contact Info */}
                        {visibleColumns.contact && (
                          <td className="py-4 px-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{owner.phone || "N/A"}</span>
                              {owner.phone && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(owner.phone, `phone-${owner.id}`)}
                                  className="text-slate-400 hover:text-blue-600 p-0.5 rounded cursor-pointer"
                                  title="Copy phone"
                                >
                                  {copiedId === `phone-${owner.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-[200px]" title={owner.email}>
                              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{owner.email}</span>
                            </div>
                          </td>
                        )}

                        {/* Location */}
                        {visibleColumns.location && (
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 font-extrabold text-slate-800 text-xs">
                              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                              <span>{owner.location || "North Campus"}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-semibold pl-4.5">{owner.city || "New Delhi"}</p>
                          </td>
                        )}

                        {/* Wallet Balance */}
                        {visibleColumns.walletBalance && (
                          <td className="py-4 px-4">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border font-black text-sm ${
                                isLowBalance
                                  ? "bg-amber-50 text-amber-800 border-amber-300"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              <Wallet className={`w-4 h-4 ${isLowBalance ? "text-amber-600" : "text-emerald-600"}`} />
                              <span>₹{(owner.walletBalance || 0).toLocaleString("en-IN")}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                              Spent: ₹{(owner.totalSpent || 0).toLocaleString("en-IN")}
                            </p>
                          </td>
                        )}

                        {/* Hostels Listed */}
                        {visibleColumns.propertiesCount && (
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 text-xs font-bold">
                              <Building className="w-3.5 h-3.5 text-slate-500" />
                              <span>{owner.propertiesCount || 0} Listed</span>
                            </span>
                          </td>
                        )}

                        {/* Leads Bought */}
                        {visibleColumns.purchasesCount && (
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold ${
                                (owner.purchasesCount || 0) > 0
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-slate-50 text-slate-500 border-slate-200"
                              }`}
                            >
                              <ShoppingCart className="w-3.5 h-3.5 text-blue-600" />
                              <span>{owner.purchasesCount || 0} Unlocked</span>
                            </span>
                          </td>
                        )}

                        {/* Joined Date */}
                        {visibleColumns.createdAt && (
                          <td className="py-4 px-4 text-xs text-slate-500 whitespace-nowrap">
                            <div className="flex items-center gap-1 font-semibold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>
                                {owner.createdAt
                                  ? new Date(owner.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric"
                                    })
                                  : "N/A"}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View Full Profile */}
                            <button
                              type="button"
                              onClick={() => handleOpenProfileModal(owner.id || owner._id)}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                              title="Inspect properties, unlocked leads, and transactions"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                              <span className="hidden sm:inline">Profile</span>
                            </button>

                            {/* Add / Deduct Wallet Balance */}
                            <button
                              type="button"
                              onClick={() => handleOpenAdjustModal(owner, "credit")}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold transition-all inline-flex items-center gap-1 shadow-xs shadow-blue-600/20 active:scale-95 cursor-pointer"
                              title="Adjust owner wallet balance"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Wallet</span>
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED OWNER PROFILE MODAL (Rendered via createPortal to body) */}
      {mounted && detailedOwnerId && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 relative overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
                  {detailedOwnerData?.owner?.name?.[0]?.toUpperCase() || "O"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                      {detailedOwnerData?.owner?.name || "Owner Profile"}
                    </h2>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Owner
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap font-medium">
                    {(detailedOwnerData?.owner?.businessName || detailedOwnerData?.owner?.hostelName) && (
                      <span className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                        <Building className="w-3 h-3 text-indigo-600" />
                        <span>{detailedOwnerData?.owner?.businessName || detailedOwnerData?.owner?.hostelName}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {detailedOwnerData?.owner?.phone || "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {detailedOwnerData?.owner?.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> {detailedOwnerData?.owner?.location}, {detailedOwnerData?.owner?.city}
                    </span>
                  </div>
                </div>
              </div>

              {/* Header Right: Balance Pill & Adjust CTA */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Current Balance</p>
                  <p className="text-xl font-black text-emerald-600">
                    ₹{(detailedOwnerData?.owner?.walletBalance || 0).toLocaleString("en-IN")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (detailedOwnerData?.owner) {
                      handleOpenAdjustModal(detailedOwnerData.owner, "credit");
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Adjust Balance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailedOwnerId(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-100 bg-white shrink-0 overflow-x-auto">
              {[
                { id: "overview", label: "Overview & Analytics", count: null },
                { id: "properties", label: "Listed Hostels", count: detailedOwnerData?.properties?.length || 0 },
                { id: "leads", label: "Purchased Leads", count: detailedOwnerData?.purchasedLeads?.length || 0 },
                { id: "transactions", label: "Wallet Ledger", count: detailedOwnerData?.transactions?.length || 0 },
              ].map((tab) => {
                const isActive = profileModalTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileModalTab(tab.id as any)}
                    className={`flex items-center gap-2 pb-3 pt-1 px-3 text-xs font-black border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== null && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Modal Body with dynamic tabs */}
            <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
              {isLoadingDetails ? (
                <div className="py-20 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                  <p className="text-slate-500 font-bold text-sm">Fetching owner properties and ledger records...</p>
                </div>
              ) : !detailedOwnerData ? (
                <p className="text-center py-12 text-slate-400 font-semibold">Failed to load owner data.</p>
              ) : (
                <>
                  {/* TAB 1: OVERVIEW */}
                  {profileModalTab === "overview" && (
                    <div className="space-y-6">
                      {/* Metric Stat Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80">
                          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-extrabold mb-1">
                            <Wallet className="w-4 h-4 text-emerald-600" />
                            <span>Wallet Balance</span>
                          </div>
                          <p className="text-2xl font-black text-emerald-950">
                            ₹{(detailedOwnerData.owner?.walletBalance || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Available for purchases</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200/80">
                          <div className="flex items-center gap-1.5 text-indigo-800 text-xs font-extrabold mb-1">
                            <DollarSign className="w-4 h-4 text-indigo-600" />
                            <span>Total Spent</span>
                          </div>
                          <p className="text-2xl font-black text-indigo-950">
                            ₹{(detailedOwnerData.owner?.totalSpent || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-indigo-700 font-semibold mt-0.5">Lifetime lead investment</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80">
                          <div className="flex items-center gap-1.5 text-blue-800 text-xs font-extrabold mb-1">
                            <Building className="w-4 h-4 text-blue-600" />
                            <span>Hostels Listed</span>
                          </div>
                          <p className="text-2xl font-black text-blue-950">
                            {detailedOwnerData.properties?.length || 0}
                          </p>
                          <p className="text-[10px] text-blue-700 font-semibold mt-0.5">Active properties</p>
                        </div>

                        <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200/80">
                          <div className="flex items-center gap-1.5 text-purple-800 text-xs font-extrabold mb-1">
                            <ShoppingCart className="w-4 h-4 text-purple-600" />
                            <span>Leads Bought</span>
                          </div>
                          <p className="text-2xl font-black text-purple-950">
                            {detailedOwnerData.purchasedLeads?.length || 0}
                          </p>
                          <p className="text-[10px] text-purple-700 font-semibold mt-0.5">Unlocked prospective tenants</p>
                        </div>
                      </div>

                      {/* Contact & Account Deep Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-700" /> Account Identity
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Owner Full Name:</span>
                              <span className="font-bold text-slate-900">{detailedOwnerData.owner?.name}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Email Address:</span>
                              <span className="font-bold text-slate-900">{detailedOwnerData.owner?.email}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Phone Number:</span>
                              <span className="font-bold text-slate-900">{detailedOwnerData.owner?.phone}</span>
                            </div>
                            {(detailedOwnerData.owner?.businessName || detailedOwnerData.owner?.hostelName) && (
                              <div className="flex justify-between py-1 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium">Hostel / PG Brand:</span>
                                <span className="font-black text-indigo-700">{detailedOwnerData.owner?.businessName || detailedOwnerData.owner?.hostelName}</span>
                              </div>
                            )}
                            {detailedOwnerData.owner?.propertyType && (
                              <div className="flex justify-between py-1 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium">Accommodation:</span>
                                <span className="font-bold text-slate-900">{detailedOwnerData.owner?.propertyType}</span>
                              </div>
                            )}
                            {detailedOwnerData.owner?.capacity && (
                              <div className="flex justify-between py-1 border-b border-slate-200/60">
                                <span className="text-slate-500 font-medium">Capacity / Scale:</span>
                                <span className="font-bold text-slate-900">{detailedOwnerData.owner?.capacity}</span>
                              </div>
                            )}
                            <div className="flex justify-between py-1">
                              <span className="text-slate-500 font-medium">Account Created:</span>
                              <span className="font-bold text-slate-900">
                                {detailedOwnerData.owner?.createdAt
                                  ? new Date(detailedOwnerData.owner.createdAt).toLocaleString("en-IN")
                                  : "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3">
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" /> Geographic Footprint
                          </h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Primary City:</span>
                              <span className="font-bold text-slate-900">{detailedOwnerData.owner?.city}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Target Area / Campus:</span>
                              <span className="font-bold text-slate-900">{detailedOwnerData.owner?.location}</span>
                            </div>
                            <div className="flex justify-between py-1 border-b border-slate-200/60">
                              <span className="text-slate-500 font-medium">Total Transactions:</span>
                              <span className="font-bold text-slate-900">{detailedOwnerData.transactions?.length || 0}</span>
                            </div>
                            <div className="flex justify-between py-1">
                              <span className="text-slate-500 font-medium">Buyer Engagement:</span>
                              <span className="font-bold text-emerald-600">
                                {(detailedOwnerData.purchasedLeads?.length || 0) > 0 ? "Active Spender" : "New / Exploring"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Quick CTA to Switch to other tabs */}
                      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
                          <p className="text-xs font-bold text-blue-900">
                            Check {detailedOwnerData.properties?.length || 0} hostels listed and {detailedOwnerData.purchasedLeads?.length || 0} unlocked buyer leads.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setProfileModalTab("properties")}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer"
                        >
                          View Hostels
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PROPERTIES */}
                  {profileModalTab === "properties" && (
                    <div className="space-y-4">
                      {detailedOwnerData.properties?.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                          <Building className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="font-extrabold text-slate-700">No properties listed yet</p>
                          <p className="text-xs text-slate-400 mt-1">This owner has not created any hostel or PG listings on the portal yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {detailedOwnerData.properties.map((property: any) => (
                            <div
                              key={property._id}
                              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-200 hover:shadow-md transition-all flex gap-4"
                            >
                              <div className="w-20 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {property.images?.[0] ? (
                                  <img
                                    src={property.images[0]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Building2 className="w-8 h-8 text-slate-400" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                                    {property.type || "Hostel"}
                                  </span>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                                    property.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                  }`}>
                                    {property.status || "Active"}
                                  </span>
                                </div>
                                <h4 className="font-black text-slate-900 text-sm truncate" title={property.title}>
                                  {property.title}
                                </h4>
                                <p className="text-xs font-extrabold text-emerald-600 mt-0.5">
                                  ₹{(property.price || 0).toLocaleString("en-IN")}/month
                                </p>
                                <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
                                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                  <span>{property.location?.area || property.location?.city || "New Delhi"}</span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: PURCHASED LEADS */}
                  {profileModalTab === "leads" && (
                    <div className="space-y-4">
                      {detailedOwnerData.purchasedLeads?.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                          <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="font-extrabold text-slate-700">No leads unlocked yet</p>
                          <p className="text-xs text-slate-400 mt-1">This owner has not purchased or unlocked any prospective tenant leads.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                <th className="py-3 px-4">Tenant Name</th>
                                <th className="py-3 px-4">Phone / WhatsApp</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Budget</th>
                                <th className="py-3 px-4">Category</th>
                                <th className="py-3 px-4">Unlock Price</th>
                                <th className="py-3 px-4">Unlocked Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {detailedOwnerData.purchasedLeads.map((lead: any) => (
                                <tr key={lead._id} className="hover:bg-slate-50/80">
                                  <td className="py-3 px-4 font-bold text-slate-900">{lead.tenantName}</td>
                                  <td className="py-3 px-4">
                                    <div className="flex items-center gap-1 font-bold text-slate-800">
                                      <Phone className="w-3 h-3 text-slate-400" />
                                      <span>{lead.tenantPhone || "Hidden"}</span>
                                    </div>
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="font-semibold">{lead.area || lead.city}</span>
                                  </td>
                                  <td className="py-3 px-4 font-extrabold text-slate-900">
                                    ₹{(lead.budget || 0).toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                      {lead.category || "signup"}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 font-black text-emerald-600">
                                    ₹{lead.price || 49}
                                  </td>
                                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                                    {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-IN") : "N/A"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: TRANSACTIONS LEDGER */}
                  {profileModalTab === "transactions" && (
                    <div className="space-y-4">
                      {detailedOwnerData.transactions?.length === 0 ? (
                        <div className="py-16 text-center text-slate-400">
                          <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                          <p className="font-extrabold text-slate-700">No transactions recorded yet</p>
                          <p className="text-xs text-slate-400 mt-1">This owner has no wallet credits or debit transactions in history.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-slate-200">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                                <th className="py-3 px-4">Date & Time</th>
                                <th className="py-3 px-4">Type</th>
                                <th className="py-3 px-4">Amount</th>
                                <th className="py-3 px-4">Description / Reference</th>
                                <th className="py-3 px-4">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                              {detailedOwnerData.transactions.map((tx: any) => {
                                const isCredit = tx.type === "credit";
                                return (
                                  <tr key={tx._id} className="hover:bg-slate-50/80">
                                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                                      {tx.createdAt ? new Date(tx.createdAt).toLocaleString("en-IN") : "N/A"}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span
                                        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                          isCredit
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : "bg-rose-50 text-rose-700 border-rose-200"
                                        }`}
                                      >
                                        {isCredit ? (
                                          <>
                                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> Credit (+)
                                          </>
                                        ) : (
                                          <>
                                            <ArrowUpRight className="w-3 h-3 text-rose-600" /> Debit (-)
                                          </>
                                        )}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 font-black whitespace-nowrap">
                                      <span className={isCredit ? "text-emerald-600" : "text-rose-600"}>
                                        {isCredit ? "+" : "-"}₹{(tx.amount || 0).toLocaleString("en-IN")}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4">
                                      <p className="font-bold text-slate-900 text-xs">{tx.description}</p>
                                      {tx.razorpayPaymentId && (
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                          Ref: {tx.razorpayPaymentId}
                                        </p>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                      <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
                                        {tx.status || "success"}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400 font-medium">
                User ID: <span className="font-mono text-slate-600">{detailedOwnerId}</span>
              </span>
              <button
                type="button"
                onClick={() => setDetailedOwnerId(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ADJUST WALLET BALANCE MODAL (CREDIT & DEBIT) (Rendered via createPortal to body) */}
      {mounted && adjustingOwner && createPortal(
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200">
            
            <button
              type="button"
              onClick={() => setAdjustingOwner(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className={`w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-md ${
                adjustAction === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              }`}>
                {adjustAction === "credit" ? <PlusCircle className="w-7 h-7" /> : <MinusCircle className="w-7 h-7" />}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                Adjust Owner Wallet
              </h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                For <strong>{adjustingOwner.name}</strong> • Current Balance:{" "}
                <span className="text-emerald-700 font-black">
                  ₹{(adjustingOwner.walletBalance || 0).toLocaleString("en-IN")}
                </span>
              </p>
            </div>

            {/* Credit vs Debit Action Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl mb-4">
              <button
                type="button"
                onClick={() => {
                  setAdjustAction("credit");
                  setAdjustAmount(500);
                  setAdjustNote("Admin Promotional Bonus Credit");
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  adjustAction === "credit"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Grant Credit (+)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdjustAction("debit");
                  setAdjustAmount(200);
                  setAdjustNote("Manual balance correction");
                }}
                className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  adjustAction === "debit"
                    ? "bg-white text-rose-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <MinusCircle className="w-3.5 h-3.5" />
                <span>Deduct Balance (-)</span>
              </button>
            </div>

            <form onSubmit={handleSubmitAdjustment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  Select Preset Amount
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2.5">
                  {(adjustAction === "credit" ? [200, 500, 1000, 2000] : [100, 200, 500, 1000]).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAdjustAmount(amt)}
                      className={`py-2.5 rounded-xl font-black text-xs border transition-all cursor-pointer ${
                        adjustAmount === amt
                          ? adjustAction === "credit"
                            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                            : "bg-rose-600 text-white border-rose-600 shadow-sm"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {adjustAction === "credit" ? `+₹${amt}` : `-₹${amt}`}
                    </button>
                  ))}
                </div>
                
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-extrabold text-base">₹</span>
                  <input
                    type="number"
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    placeholder="Enter custom amount..."
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-900 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1.5">
                  Audit Reason / Description
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder="e.g. Promotional Bonus Credit or Billing correction"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {adjustAction === "debit" && adjustAmount > (adjustingOwner.walletBalance || 0) && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Deduction exceeds current balance of ₹{adjustingOwner.walletBalance || 0}!</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmittingAdjust || (adjustAction === "debit" && adjustAmount > (adjustingOwner.walletBalance || 0))}
                className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-black text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 cursor-pointer ${
                  adjustAction === "credit"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30"
                }`}
              >
                {isSubmittingAdjust ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>
                  {isSubmittingAdjust
                    ? "Updating Wallet..."
                    : adjustAction === "credit"
                    ? `Grant +₹${adjustAmount} Credit`
                    : `Deduct -₹${adjustAmount} from Wallet`}
                </span>
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
