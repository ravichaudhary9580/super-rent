"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  UserCheck, 
  Users, 
  Building2, 
  Phone, 
  Award, 
  FileSpreadsheet, 
  FileText, 
  Search, 
  LayoutGrid, 
  List, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  IndianRupee, 
  MessageSquare, 
  Copy, 
  Check, 
  Loader2, 
  ArrowRight,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  RotateCcw,
  User,
  Unlock,
  SlidersHorizontal
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PurchasedLead {
  _id: string;
  tenantName: string;
  tenantPhone: string;
  city: string;
  area: string;
  college: string;
  budget: number;
  gender: "male" | "female" | "any";
  moveInTimeline: string;
  category: "signup" | "opened_property" | "tried_to_contact" | "conversion_system";
  leadType: string;
  price: number;
  stage: string;
  property?: {
    _id?: string;
    title?: string;
    location?: { address?: string; city?: string; area?: string };
    price?: number;
    type?: string;
  } | null;
  unlockedAt?: string;
  createdAt?: string;
}

interface CategoryCounts {
  all: number;
  city: number;
  opened_property: number;
  tried_to_contact: number;
  conversion_system: number;
}

type SortField = "tenantName" | "tenantPhone" | "gender" | "college" | "area" | "city" | "property" | "budget" | "moveInTimeline" | "price";

export default function PurchasedLeadsPage() {
  const [activeTab, setActiveTab] = useState<"all" | "city" | "opened_property" | "tried_to_contact" | "conversion_system">("all");
  const [leads, setLeads] = useState<PurchasedLead[]>([]);
  const [counts, setCounts] = useState<CategoryCounts>({
    all: 0,
    city: 0,
    opened_property: 0,
    tried_to_contact: 0,
    conversion_system: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<"csv" | "pdf" | null>(null);

  // Sheet-like Column Filters State
  const [openFilterCol, setOpenFilterCol] = useState<string | null>(null);
  const [colSearchQuery, setColSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Multi-select filters for each column
  const [nameFilters, setNameFilters] = useState<string[]>([]);
  const [genderFilters, setGenderFilters] = useState<string[]>([]);
  const [collegeFilters, setCollegeFilters] = useState<string[]>([]);
  const [locationFilters, setLocationFilters] = useState<string[]>([]);
  const [cityFilters, setCityFilters] = useState<string[]>([]);
  const [propertyFilters, setPropertyFilters] = useState<string[]>([]);
  const [moveInFilters, setMoveInFilters] = useState<string[]>([]);

  const filterMenuRef = useRef<HTMLDivElement>(null);

  // Close filter popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(event.target as Node)) {
        setOpenFilterCol(null);
        setColSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPurchasedLeads = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await fetch(`/api/owner/purchased-leads?category=${activeTab}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load purchased leads");
      }
      setLeads(data.leads || []);
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load purchased leads");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchasedLeads();
  }, [activeTab]);

  // Unique values for each column across current tab leads
  const columnUniqueValues = useMemo(() => {
    const names = Array.from(new Set(leads.map((l) => l.tenantName).filter(Boolean))).sort();
    const genders = Array.from(new Set(leads.map((l) => l.gender || "any"))).sort();
    const colleges = Array.from(new Set(leads.map((l) => l.college || "General Tenant"))).sort();
    const locations = Array.from(new Set(leads.map((l) => l.area || "Area Matched"))).sort();
    const cities = Array.from(new Set(leads.map((l) => l.city || "Greater Noida"))).sort();
    const properties = Array.from(new Set(leads.map((l) => l.property?.title || "None (City Lead)"))).sort();
    const moveIns = Array.from(new Set(leads.map((l) => l.moveInTimeline || "Immediate"))).sort();

    return { names, genders, colleges, locations, cities, properties, moveIns };
  }, [leads]);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortField(null);
        setSortOrder("asc");
      }
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Check if any sheet column filter is active
  const hasActiveFilters = useMemo(() => {
    return (
      nameFilters.length > 0 ||
      genderFilters.length > 0 ||
      collegeFilters.length > 0 ||
      locationFilters.length > 0 ||
      cityFilters.length > 0 ||
      propertyFilters.length > 0 ||
      moveInFilters.length > 0 ||
      sortField !== null ||
      searchQuery.trim().length > 0
    );
  }, [nameFilters, genderFilters, collegeFilters, locationFilters, cityFilters, propertyFilters, moveInFilters, sortField, searchQuery]);

  // Clear all sheet filters
  const clearAllFilters = () => {
    setNameFilters([]);
    setGenderFilters([]);
    setCollegeFilters([]);
    setLocationFilters([]);
    setCityFilters([]);
    setPropertyFilters([]);
    setMoveInFilters([]);
    setSortField(null);
    setSortOrder("asc");
    setSearchQuery("");
    setOpenFilterCol(null);
    setColSearchQuery("");
  };

  // Filtered & Sorted leads
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // Global Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((l) => {
        return (
          l.tenantName?.toLowerCase().includes(q) ||
          l.tenantPhone?.toLowerCase().includes(q) ||
          l.college?.toLowerCase().includes(q) ||
          l.area?.toLowerCase().includes(q) ||
          l.city?.toLowerCase().includes(q) ||
          l.property?.title?.toLowerCase().includes(q)
        );
      });
    }

    // Column Filters
    if (nameFilters.length > 0) {
      result = result.filter((l) => nameFilters.includes(l.tenantName));
    }
    if (genderFilters.length > 0) {
      result = result.filter((l) => genderFilters.includes(l.gender || "any"));
    }
    if (collegeFilters.length > 0) {
      result = result.filter((l) => collegeFilters.includes(l.college || "General Tenant"));
    }
    if (locationFilters.length > 0) {
      result = result.filter((l) => locationFilters.includes(l.area || "Area Matched"));
    }
    if (cityFilters.length > 0) {
      result = result.filter((l) => cityFilters.includes(l.city || "Greater Noida"));
    }
    if (propertyFilters.length > 0) {
      result = result.filter((l) => propertyFilters.includes(l.property?.title || "None (City Lead)"));
    }
    if (moveInFilters.length > 0) {
      result = result.filter((l) => moveInFilters.includes(l.moveInTimeline || "Immediate"));
    }

    // Sorting
    if (sortField) {
      result.sort((a, b) => {
        let aVal: any = "";
        let bVal: any = "";

        switch (sortField) {
          case "tenantName":
            aVal = a.tenantName || "";
            bVal = b.tenantName || "";
            break;
          case "tenantPhone":
            aVal = a.tenantPhone || "";
            bVal = b.tenantPhone || "";
            break;
          case "gender":
            aVal = a.gender || "";
            bVal = b.gender || "";
            break;
          case "college":
            aVal = a.college || "";
            bVal = b.college || "";
            break;
          case "area":
            aVal = a.area || "";
            bVal = b.area || "";
            break;
          case "city":
            aVal = a.city || "";
            bVal = b.city || "";
            break;
          case "property":
            aVal = a.property?.title || "";
            bVal = b.property?.title || "";
            break;
          case "budget":
            aVal = a.budget || 0;
            bVal = b.budget || 0;
            break;
          case "moveInTimeline":
            aVal = a.moveInTimeline || "";
            bVal = b.moveInTimeline || "";
            break;
          case "price":
            aVal = a.price || 0;
            bVal = b.price || 0;
            break;
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
        }
        return sortOrder === "asc"
          ? String(aVal).localeCompare(String(bVal))
          : String(bVal).localeCompare(String(aVal));
      });
    }

    return result;
  }, [
    leads,
    searchQuery,
    nameFilters,
    genderFilters,
    collegeFilters,
    locationFilters,
    cityFilters,
    propertyFilters,
    moveInFilters,
    sortField,
    sortOrder,
  ]);

  const copyPhoneNumber = (phone: string, id: string) => {
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "signup":
        return "City Lead";
      case "opened_property":
        return "Opened Property";
      case "tried_to_contact":
        return "Contacted";
      case "conversion_system":
        return "Conversion Lead";
      default:
        return cat || "Lead";
    }
  };

  // CSV Export
  const exportToCSV = () => {
    try {
      setIsExporting("csv");
      const headers = [
        "S.No",
        "Tenant Name",
        "Phone",
        "Gender",
        "College / Company",
        "Target Location",
        "Target City",
        "Property Revealed",
        "Budget (INR/mo)",
        "Move-in",
        "Price Paid (INR)"
      ];

      const rows = filteredLeads.map((l, idx) => [
        idx + 1,
        `"${(l.tenantName || "").replace(/"/g, '""')}"`,
        `"${(l.tenantPhone || "").replace(/"/g, '""')}"`,
        `"${(l.gender || "any").toUpperCase()}"`,
        `"${(l.college || "General Tenant").replace(/"/g, '""')}"`,
        `"${(l.area || "Area Matched").replace(/"/g, '""')}"`,
        `"${(l.city || "Greater Noida").replace(/"/g, '""')}"`,
        `"${(l.property?.title || "None (City Lead)").replace(/"/g, '""')}"`,
        `"${l.budget ? Number(l.budget).toLocaleString("en-IN") : "10,000"}"`,
        `"${(l.moveInTimeline || "Immediate").replace(/"/g, '""')}"`,
        `"${l.price || 49}"`
      ].join(","));

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      link.setAttribute("href", url);
      link.setAttribute("download", `Purchased_Leads_${activeTab.toUpperCase()}_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV Export Error:", err);
      alert("Failed to export CSV.");
    } finally {
      setIsExporting(null);
    }
  };

  // PDF Export
  const exportToPDF = () => {
    try {
      setIsExporting("pdf");
      const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const dateStr = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      // Brand Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 60, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Provider App - Purchased Leads Directory", 30, 30);

      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(203, 213, 225);
      doc.text(`Category: ${activeTab.toUpperCase()} | Generated: ${dateStr} | Total Records: ${filteredLeads.length}`, 30, 47);

      const tableData = filteredLeads.map((l, index) => [
        index + 1,
        l.tenantName || "N/A",
        l.tenantPhone || "N/A",
        (l.gender || "any").toUpperCase(),
        l.college || "General Tenant",
        l.area || "Area Matched",
        l.city || "Greater Noida",
        l.property?.title ? l.property.title : "None (City Lead)",
        `Rs. ${l.budget ? Number(l.budget).toLocaleString("en-IN") : "10,000"}`,
        l.moveInTimeline || "Immediate",
        `Rs. ${l.price || 49}`
      ]);

      autoTable(doc, {
        head: [
          [
            "#",
            "Tenant Name",
            "Phone",
            "Gender",
            "College / Company",
            "Target Location",
            "Target City",
            "Property Revealed",
            "Budget/mo",
            "Move-in",
            "Price"
          ]
        ],
        body: tableData,
        startY: 75,
        theme: "striped",
        headStyles: {
          fillColor: [30, 41, 59], // slate-800
          textColor: [255, 255, 255],
          fontSize: 8.5,
          fontStyle: "bold",
          halign: "left"
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        styles: {
          overflow: "linebreak",
          cellPadding: 5
        },
        didDrawPage: (data) => {
          const str = `Page ${data.pageNumber}`;
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          doc.text(str, doc.internal.pageSize.getWidth() - 50, doc.internal.pageSize.getHeight() - 15);
          doc.text("Confidential - Owner Purchased Directory", 30, doc.internal.pageSize.getHeight() - 15);
        }
      });

      const fileDate = new Date().toISOString().split("T")[0];
      doc.save(`Purchased_Leads_${activeTab.toUpperCase()}_${fileDate}.pdf`);
    } catch (err) {
      console.error("PDF Export Error:", err);
      alert("Failed to export PDF.");
    } finally {
      setIsExporting(null);
    }
  };

  // Helper to render sheet-like filter popover for a column
  const renderSheetFilterPopover = (
    colKey: string,
    title: string,
    values: string[],
    selectedValues: string[],
    setSelectedValues: (vals: string[]) => void,
    sortFieldKey?: SortField
  ) => {
    if (openFilterCol !== colKey) return null;

    const filteredValues = colSearchQuery.trim()
      ? values.filter((v) => v.toLowerCase().includes(colSearchQuery.toLowerCase()))
      : values;

    const isAllSelected = selectedValues.length === 0;

    return (
      <div
        ref={filterMenuRef}
        className="absolute top-full left-0 mt-1 z-50 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 text-left font-sans normal-case animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
          <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            Filter: {title}
          </span>
          <button
            onClick={() => setOpenFilterCol(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sort Actions */}
        {sortFieldKey && (
          <div className="flex items-center gap-1 border-b border-slate-100 pb-2 mb-2">
            <button
              onClick={() => {
                setSortField(sortFieldKey);
                setSortOrder("asc");
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                sortField === sortFieldKey && sortOrder === "asc"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <ArrowUp className="w-3 h-3 text-blue-600" /> A → Z
            </button>
            <button
              onClick={() => {
                setSortField(sortFieldKey);
                setSortOrder("desc");
              }}
              className={`flex-1 flex items-center justify-center gap-1 py-1 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                sortField === sortFieldKey && sortOrder === "desc"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <ArrowDown className="w-3 h-3 text-blue-600" /> Z → A
            </button>
          </div>
        )}

        {/* Search inside values */}
        <div className="relative mb-2">
          <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search values..."
            value={colSearchQuery}
            onChange={(e) => setColSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-2 py-1 text-[11px] font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Select All / Clear Row */}
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 px-1 mb-1.5">
          <button
            onClick={() => setSelectedValues([])}
            className={`hover:underline ${isAllSelected ? "text-blue-600 font-extrabold" : ""}`}
          >
            Select All ({values.length})
          </button>
          {selectedValues.length > 0 && (
            <button
              onClick={() => setSelectedValues([])}
              className="text-red-500 hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Values Checkbox List */}
        <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
          {filteredValues.length === 0 ? (
            <p className="text-[11px] text-slate-400 italic py-2 text-center">No values found</p>
          ) : (
            filteredValues.map((val) => {
              const count = leads.filter((l) => {
                switch (colKey) {
                  case "name": return l.tenantName === val;
                  case "gender": return (l.gender || "any") === val;
                  case "college": return (l.college || "General Tenant") === val;
                  case "location": return (l.area || "Area Matched") === val;
                  case "city": return (l.city || "Greater Noida") === val;
                  case "property": return (l.property?.title || "None (City Lead)") === val;
                  case "moveIn": return (l.moveInTimeline || "Immediate") === val;
                  default: return false;
                }
              }).length;

              const isChecked = selectedValues.includes(val);

              return (
                <label
                  key={val}
                  className="flex items-center justify-between gap-2 px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer text-[11px] text-slate-700"
                >
                  <div className="flex items-center gap-2 truncate">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedValues([...selectedValues, val]);
                        } else {
                          setSelectedValues(selectedValues.filter((v) => v !== val));
                        }
                      }}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="truncate capitalize font-semibold">{val}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">{count}</span>
                </label>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-3 py-4 sm:px-6 sm:py-8 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* 1. Header with Title & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
              <UserCheck className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
              Purchased Leads Directory
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <Check className="w-3 h-3" /> Unlocked Contacts
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium pt-1 max-w-2xl">
            Access and manage all student and prospective tenant leads unlocked by your account with interactive spreadsheet filters, direct dialer, and instant CSV/PDF export.
          </p>
        </div>

        {/* Action Buttons: Export CSV & PDF */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap pt-2 lg:pt-0">
          <button
            onClick={exportToCSV}
            disabled={filteredLeads.length === 0 || isExporting !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-sm disabled:opacity-50 disabled:pointer-events-none"
            title="Download formatted CSV spreadsheet"
          >
            {isExporting === "csv" ? (
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            )}
            <span>CSV</span>
          </button>

          <button
            onClick={exportToPDF}
            disabled={filteredLeads.length === 0 || isExporting !== null}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 active:scale-95 text-slate-800 border border-slate-300 font-extrabold text-xs sm:text-sm transition-all shadow-xs disabled:opacity-50 disabled:pointer-events-none"
            title="Download printable PDF document"
          >
            {isExporting === "pdf" ? (
              <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
            ) : (
              <FileText className="w-4 h-4 text-rose-500" />
            )}
            <span>PDF</span>
          </button>

          {/* Cards vs Table View Toggle */}
          <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Sheet / Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`p-2 rounded-lg text-xs font-bold transition-all ${
                viewMode === "card" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Category Tabs Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Horizontal scrollable category tabs */}
        <div className="-mx-3 px-3 sm:mx-0 sm:px-0 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "all" as const, label: "All Purchased", shortLabel: "All", icon: UserCheck, count: counts.all },
            { id: "city" as const, label: "City Leads", shortLabel: "City", icon: Users, count: counts.city },
            { id: "opened_property" as const, label: "Opened Property", shortLabel: "Viewers", icon: Building2, count: counts.opened_property },
            { id: "tried_to_contact" as const, label: "Contact Inquiries", shortLabel: "Inquiries", icon: Phone, count: counts.tried_to_contact },
            { id: "conversion_system" as const, label: "Conversion Leads", shortLabel: "Conversions", icon: Award, count: counts.conversion_system },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-extrabold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 border shrink-0 ${
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.shortLabel}</span>
                <span
                  className={`text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full ${
                    isActive ? "bg-slate-800 text-emerald-400" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Global Search & Clear Filters */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition-all shrink-0"
              title="Reset all sheet column filters and search"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Sheet</span>
            </button>
          )}

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search across sheet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl sm:rounded-2xl pl-9 pr-7 py-2 text-xs sm:text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Main Content: Leads Table / Cards */}
      {isLoading ? (
        <div className="py-24 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-slate-500 font-bold text-sm">Loading your purchased tenant contacts...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl font-bold text-sm text-center">
          {error}
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl mx-auto flex items-center justify-center">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">
            {hasActiveFilters ? "No leads match current sheet filters" : "No Purchased Leads in This Category"}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm">
            {hasActiveFilters
              ? "Your current column filters or search returned 0 results. Click 'Reset Sheet' to restore all purchased leads."
              : activeTab === "all"
              ? "You haven't purchased any tenant leads yet. Explore the marketplace to unlock student and tenant leads with direct contact numbers."
              : `You haven't purchased any leads under the ${getCategoryLabel(activeTab)} category yet.`}
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-all"
              >
                Clear All Filters
              </button>
            )}
            <Link
              href="/owner/leads"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all active:scale-95"
            >
              <span>Explore Leads Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* Sheet Table View with 10 Columns and Header Filters */
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm overflow-visible">
          <div className="overflow-x-auto rounded-2xl sm:rounded-3xl">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-black text-slate-700 select-none">
                  
                  {/* 1. Tenant Name Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("tenantName")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Tenant Name
                        {sortField === "tenantName" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "name" ? null : "name");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          nameFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter Tenant Names"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("name", "Tenant Name", columnUniqueValues.names, nameFilters, setNameFilters, "tenantName")}
                  </th>

                  {/* 2. Phone Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("tenantPhone")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Phone
                        {sortField === "tenantPhone" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                    </div>
                  </th>

                  {/* 3. Gender Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("gender")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Gender
                        {sortField === "gender" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "gender" ? null : "gender");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          genderFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter Gender"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("gender", "Gender", columnUniqueValues.genders, genderFilters, setGenderFilters, "gender")}
                  </th>

                  {/* 4. College / Company Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("college")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        College / Company
                        {sortField === "college" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "college" ? null : "college");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          collegeFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter College / Company"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("college", "College / Company", columnUniqueValues.colleges, collegeFilters, setCollegeFilters, "college")}
                  </th>

                  {/* 5. Target Location Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("area")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Target Location
                        {sortField === "area" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "location" ? null : "location");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          locationFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter Location"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("location", "Target Location", columnUniqueValues.locations, locationFilters, setLocationFilters, "area")}
                  </th>

                  {/* 6. Target City Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("city")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Target City
                        {sortField === "city" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "city" ? null : "city");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          cityFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter City"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("city", "Target City", columnUniqueValues.cities, cityFilters, setCityFilters, "city")}
                  </th>

                  {/* 7. Property Revealed Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("property")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Property Revealed
                        {sortField === "property" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "property" ? null : "property");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          propertyFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter Properties"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("property", "Property Revealed", columnUniqueValues.properties, propertyFilters, setPropertyFilters, "property")}
                  </th>

                  {/* 8. Budget Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("budget")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Budget
                        {sortField === "budget" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => handleSort("budget")}
                        className={`p-1 rounded-md transition-all ${
                          sortField === "budget"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Sort Budget"
                      >
                        <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </div>
                  </th>

                  {/* 9. Move-in Header */}
                  <th className="py-3 px-3.5 relative whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1.5">
                      <span
                        onClick={() => handleSort("moveInTimeline")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Move-in
                        {sortField === "moveInTimeline" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                      <button
                        onClick={() => {
                          setOpenFilterCol(openFilterCol === "moveIn" ? null : "moveIn");
                          setColSearchQuery("");
                        }}
                        className={`p-1 rounded-md transition-all ${
                          moveInFilters.length > 0
                            ? "bg-blue-600 text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Filter Move-in"
                      >
                        <Filter className="w-3 h-3" />
                      </button>
                    </div>
                    {renderSheetFilterPopover("moveIn", "Move-in Timeline", columnUniqueValues.moveIns, moveInFilters, setMoveInFilters, "moveInTimeline")}
                  </th>

                  {/* 10. Price / Action Header */}
                  <th className="py-3 px-3.5 text-right relative whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <span
                        onClick={() => handleSort("price")}
                        className="cursor-pointer hover:text-blue-600 flex items-center gap-1"
                      >
                        Price
                        {sortField === "price" && (sortOrder === "asc" ? <ArrowUp className="w-3 h-3 text-blue-600" /> : <ArrowDown className="w-3 h-3 text-blue-600" />)}
                      </span>
                    </div>
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                {filteredLeads.map((lead) => {
                  const cleanPhone = lead.tenantPhone ? lead.tenantPhone.replace(/[^0-9]/g, "").slice(-10) : "";
                  const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(lead.tenantName || "")}%2C%20I%20saw%20your%20requirement%20for%20a%20property%20on%20ProviderApp.` : "";

                  return (
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* 1. Tenant Name */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                            {lead.tenantName ? lead.tenantName[0].toUpperCase() : "T"}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-sm leading-tight">
                              {lead.tenantName}
                            </p>
                            <span className="text-[10px] text-slate-400 font-semibold">
                              {getCategoryLabel(lead.category)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Phone */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <a
                            href={`tel:${lead.tenantPhone}`}
                            className="text-xs font-extrabold text-emerald-600 hover:underline flex items-center gap-1 font-mono"
                          >
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{lead.tenantPhone}</span>
                          </a>

                          <div className="flex items-center gap-1.5">
                            {waUrl && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100/70 hover:bg-emerald-200 px-2 py-0.5 rounded-md transition-colors"
                              >
                                WhatsApp
                              </a>
                            )}
                            <button
                              onClick={() => copyPhoneNumber(lead.tenantPhone, lead._id)}
                              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition-colors"
                              title="Copy Phone"
                            >
                              {copiedId === lead._id ? "Copied" : "Copy"}
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* 3. Gender */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
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
                      <td className="py-3.5 px-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold max-w-[170px] truncate">
                          <GraduationCap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="capitalize truncate">
                            {lead.college || "General Tenant"}
                          </span>
                        </div>
                      </td>

                      {/* 5. Target Location */}
                      <td className="py-3.5 px-3.5">
                        <div className="font-bold text-slate-900 flex items-center gap-1 text-xs whitespace-nowrap">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{lead.area || "Area Matched"}</span>
                        </div>
                      </td>

                      {/* 6. Target City */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                          {lead.city || "Greater Noida"}
                        </span>
                      </td>

                      {/* 7. Property Revealed */}
                      <td className="py-3.5 px-3.5">
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
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100 text-xs font-extrabold">
                          ₹{lead.budget ? Number(lead.budget).toLocaleString("en-IN") : "10,000"}/mo
                        </span>
                      </td>

                      {/* 9. Move-in */}
                      <td className="py-3.5 px-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-slate-600 text-xs">
                          <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-slate-700">
                            {lead.moveInTimeline || "Immediate"}
                          </span>
                        </div>
                      </td>

                      {/* 10. Price */}
                      <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-xl border border-emerald-200">
                          <Unlock className="w-3 h-3 text-emerald-600" /> ₹{lead.price || 49}
                        </span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredLeads.map((lead) => {
            const cleanPhone = lead.tenantPhone ? lead.tenantPhone.replace(/[^0-9]/g, "").slice(-10) : "";
            const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(lead.tenantName || "")}%2C%20I%20saw%20your%20requirement%20for%20a%20property%20on%ProviderApp.` : "";

            return (
              <div
                key={lead._id}
                className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                {/* Card Top: Gender & City */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
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
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                    {lead.city || "Greater Noida"}
                  </span>
                </div>

                {/* Identity & Phone */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
                    {lead.tenantName ? lead.tenantName[0].toUpperCase() : "T"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-extrabold text-slate-900 truncate">
                      {lead.tenantName}
                    </h3>
                    <a
                      href={`tel:${lead.tenantPhone}`}
                      className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 mt-0.5 font-mono"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{lead.tenantPhone}</span>
                    </a>
                  </div>
                </div>

                {/* Attributes Box */}
                <div className="bg-slate-50/80 rounded-xl p-3 space-y-2 text-xs text-slate-600 border border-slate-100">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-blue-500" /> Location:
                    </span>
                    <span className="font-bold text-slate-800 truncate text-right">
                      {lead.area || "Area Matched"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-purple-600" /> College:
                    </span>
                    <span className="font-bold text-slate-800 truncate text-right">
                      {lead.college || "General Tenant"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <IndianRupee className="w-3 h-3 text-emerald-600" /> Budget:
                    </span>
                    <span className="font-black text-emerald-700 text-right">
                      ₹{lead.budget ? Number(lead.budget).toLocaleString("en-IN") : "10,000"}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-500" /> Move-in:
                    </span>
                    <span className="font-bold text-slate-800 text-right">
                      {lead.moveInTimeline || "Immediate"}
                    </span>
                  </div>

                  {lead.property?.title && (
                    <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-indigo-500" /> Property:
                      </span>
                      <span className="font-bold text-indigo-700 truncate max-w-[130px] text-right">
                        {lead.property.title}
                      </span>
                    </div>
                  )}
                </div>

                {/* Call & WhatsApp Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href={`tel:${lead.tenantPhone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>

                  {waUrl ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-black text-xs rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <button
                      onClick={() => copyPhoneNumber(lead.tenantPhone, lead._id)}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-xl transition-all active:scale-95"
                    >
                      {copiedId === lead._id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === lead._id ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
