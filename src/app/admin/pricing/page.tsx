"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Save, 
  Users, 
  Building2, 
  Flame, 
  Award, 
  Loader2, 
  CheckCircle2, 
  IndianRupee,
  Sparkles,
  Plus,
  Trash2,
  Check,
  X,
  ShieldCheck,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  Zap,
  RefreshCw,
  Calculator,
  Sliders,
  ChevronRight,
  Info,
  DollarSign
} from "lucide-react";
import { 
  IPricingEngineConfig, 
  ICategoryPricingConfig, 
  IPricingRule, 
  IPricingFieldAddons 
} from "@/models/SystemSettings";
import { DEFAULT_PRICING_ENGINE, calculateDynamicLeadPrice } from "@/lib/pricingEngine";

export default function PricingControl() {
  const [activeCategory, setActiveCategory] = useState<"signup" | "opened_property" | "tried_to_contact" | "conversion_system" | "global">("signup");
  const [engineConfig, setEngineConfig] = useState<IPricingEngineConfig>(DEFAULT_PRICING_ENGINE);
  
  // Legacy fields
  const [sharedLeadPrice, setSharedLeadPrice] = useState<number>(49);
  const [exclusiveLeadPrice, setExclusiveLeadPrice] = useState<number>(249);
  const [verifiedLeadPrice, setVerifiedLeadPrice] = useState<number>(499);
  const [payPerBookingCommission, setPayPerBookingCommission] = useState<number>(20000);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Custom Rule Modal
  const [isRuleModalOpen, setIsRuleModalOpen] = useState<boolean>(false);
  const [newRule, setNewRule] = useState<Partial<IPricingRule>>({
    name: "",
    category: "signup",
    requiredFields: ["college", "area"],
    action: "add_bonus",
    priceValue: 20,
    minBudget: 0,
    immediateOnly: false,
    enabled: true
  });

  // Interactive Live Simulator State
  const [simLead, setSimLead] = useState({
    tenantPhone: "+91 98765 43210",
    college: "NIET Greater Noida",
    area: "Knowledge Park 2",
    budget: 12000,
    moveInTimeline: "Immediate",
    gender: "male",
    propertyId: "sample_property_123",
    isVerified: true
  });
  const [simActiveFields, setSimActiveFields] = useState({
    phone: true,
    college: true,
    area: true,
    budget: true,
    immediateMoveIn: true,
    gender: false,
    property: false,
    isVerified: false
  });

  const fetchPricing = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/pricing");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          if (data.settings.pricingEngine) {
            setEngineConfig(data.settings.pricingEngine);
          }
          setSharedLeadPrice(data.settings.sharedLeadPrice ?? 49);
          setExclusiveLeadPrice(data.settings.exclusiveLeadPrice ?? 249);
          setVerifiedLeadPrice(data.settings.verifiedLeadPrice ?? 499);
          setPayPerBookingCommission(data.settings.payPerBookingCommission ?? 20000);
        }
      }
    } catch (e) {
      console.error(e);
      setMessage({ type: "error", text: "Failed to load pricing engine settings." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      setMessage(null);

      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricingEngine: engineConfig,
          signupLeadPrice: engineConfig.signup?.basePrice ?? 49,
          openedPropertyLeadPrice: engineConfig.opened_property?.basePrice ?? 99,
          contactAttemptLeadPrice: engineConfig.tried_to_contact?.basePrice ?? 199,
          conversionSystemPrice: engineConfig.conversion_system?.basePrice ?? 499,
          sharedLeadPrice,
          exclusiveLeadPrice,
          verifiedLeadPrice,
          payPerBookingCommission
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save pricing configuration.");

      setMessage({ type: "success", text: "Field-based Lead Pricing Engine saved and active!" });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save pricing settings." });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecalculateExistingLeads = async () => {
    if (!confirm("This will recalculate the price of all leads currently in the database according to your saved rules. Continue?")) {
      return;
    }

    try {
      setIsRecalculating(true);
      setMessage(null);

      // Save latest config first
      await handleSave();

      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recalculate_leads" })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Recalculation failed.");

      setMessage({
        type: "success",
        text: `Success! ${data.updatedCount} of ${data.totalLeads} leads had their prices updated to match your latest field-based rules.`
      });
      setTimeout(() => setMessage(null), 6000);
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to recalculate lead prices." });
    } finally {
      setIsRecalculating(false);
    }
  };

  const updateBasePrice = (category: "signup" | "opened_property" | "tried_to_contact" | "conversion_system", price: number) => {
    setEngineConfig((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        basePrice: Math.max(0, price)
      }
    }));
  };

  const updateFieldAddon = (
    category: "signup" | "opened_property" | "tried_to_contact" | "conversion_system",
    field: keyof IPricingFieldAddons,
    value: number
  ) => {
    setEngineConfig((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        fieldAddons: {
          ...prev[category].fieldAddons,
          [field]: value
        }
      }
    }));
  };

  const toggleRuleEnabled = (category: "signup" | "opened_property" | "tried_to_contact" | "conversion_system", ruleId: string) => {
    setEngineConfig((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        rules: prev[category].rules.map((r) => r.id === ruleId ? { ...r, enabled: !r.enabled } : r)
      }
    }));
  };

  const deleteRule = (category: "signup" | "opened_property" | "tried_to_contact" | "conversion_system", ruleId: string) => {
    setEngineConfig((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        rules: prev[category].rules.filter((r) => r.id !== ruleId)
      }
    }));
  };

  const handleCreateRule = () => {
    if (!newRule.name?.trim()) {
      alert("Please provide a name for the rule.");
      return;
    }

    const cat: "signup" | "opened_property" | "tried_to_contact" | "conversion_system" =
      newRule.category === "opened_property" ||
      newRule.category === "tried_to_contact" ||
      newRule.category === "conversion_system"
        ? newRule.category
        : "signup";

    const ruleToAdd: IPricingRule = {
      id: `rule-${Date.now()}`,
      name: newRule.name.trim(),
      category: newRule.category || cat,
      requiredFields: newRule.requiredFields || [],
      action: newRule.action || "add_bonus",
      priceValue: Number(newRule.priceValue) || 20,
      minBudget: Number(newRule.minBudget) || 0,
      immediateOnly: Boolean(newRule.immediateOnly),
      enabled: true
    };

    setEngineConfig((prev) => ({
      ...prev,
      [cat]: {
        ...prev[cat],
        rules: [...(prev[cat].rules || []), ruleToAdd]
      }
    }));

    setIsRuleModalOpen(false);
    setNewRule({
      name: "",
      category: activeCategory === "global" ? "signup" : activeCategory,
      requiredFields: ["college", "area"],
      action: "add_bonus",
      priceValue: 20,
      minBudget: 0,
      immediateOnly: false,
      enabled: true
    });
  };

  // Live Simulator Calculation
  const simulatedLeadPayload = useMemo(() => {
    const cat = activeCategory === "global" ? "signup" : activeCategory;
    return {
      category: cat,
      tenantPhone: simActiveFields.phone ? simLead.tenantPhone : undefined,
      college: simActiveFields.college ? simLead.college : undefined,
      area: simActiveFields.area ? simLead.area : undefined,
      budget: simActiveFields.budget ? simLead.budget : 0,
      moveInTimeline: simActiveFields.immediateMoveIn ? simLead.moveInTimeline : "Flexible",
      gender: simActiveFields.gender ? simLead.gender : "any",
      propertyId: simActiveFields.property ? simLead.propertyId : undefined,
      isVerified: simActiveFields.isVerified
    };
  }, [activeCategory, simActiveFields, simLead]);

  const simulatedResult = useMemo(() => {
    return calculateDynamicLeadPrice(simulatedLeadPayload, { pricingEngine: engineConfig });
  }, [simulatedLeadPayload, engineConfig]);

  const categoryMetadata = {
    signup: {
      name: "City Signup Leads",
      tag: "City Marketplace Pool",
      color: "blue",
      icon: Users,
      desc: "Prospects registered via city questionnaire. Unlocked by up to 4 owners in that city."
    },
    opened_property: {
      name: "Opened Property Leads",
      tag: "Direct Property Interest",
      color: "indigo",
      icon: Building2,
      desc: "Prospects who clicked and viewed a specific property page. Delivered directly to that property's owner."
    },
    tried_to_contact: {
      name: "Tried to Contact",
      tag: "High Intent Urgent",
      color: "orange",
      icon: Flame,
      desc: "Prospects who clicked 'Contact Owner Now' on a property listing. High conversion urgency."
    },
    conversion_system: {
      name: "Assisted Conversion",
      tag: "Provider App Assisted",
      color: "purple",
      icon: Award,
      desc: "Prospects routed to the Provider App sales team for guided site visits and conversion management."
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Dynamic Field-Based Engine
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Lead Pricing Control
          </h1>
          <p className="text-slate-500 mt-1 font-medium text-sm sm:text-base max-w-3xl">
            Configure dynamic lead prices based on data completeness (Phone, College, Area, Budget, Move-in) and custom multi-field condition rules.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRecalculateExistingLeads}
            disabled={isRecalculating || isSaving}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-2 border border-slate-200 cursor-pointer active:scale-95 disabled:opacity-50"
            title="Update all existing leads in the database with the new pricing rules"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? "animate-spin text-blue-600" : "text-slate-500"}`} />
            <span>{isRecalculating ? "Recalculating..." : "Apply to Existing Leads"}</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? "Saving Engine..." : "Save Pricing Engine"}</span>
          </button>
        </div>
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
            message.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          {message.type === "error" ? (
            <X className="w-5 h-5 text-red-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Category Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        {(["signup", "opened_property", "tried_to_contact", "conversion_system", "global"] as const).map((tab) => {
          const isSelected = activeCategory === tab;
          const meta = tab !== "global" ? categoryMetadata[tab] : null;
          const Icon = meta ? meta.icon : Sliders;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveCategory(tab);
                if (tab !== "global") {
                  setNewRule((prev) => ({ ...prev, category: tab }));
                }
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-extrabold text-xs transition-all cursor-pointer ${
                isSelected
                  ? "bg-white text-slate-900 shadow-sm border border-slate-200/70"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-blue-600" : "text-slate-400"}`} />
              <span>{meta ? meta.name : "Tier Multipliers"}</span>
              {meta && tab !== "global" && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? "bg-blue-50 text-blue-700 font-black" : "bg-slate-200 text-slate-500"
                }`}>
                  ₹{engineConfig[tab]?.basePrice ?? 49}+
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Grid: Left Settings (2/3) + Right Live Simulator (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Category Rules & Field Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {activeCategory !== "global" ? (
            <>
              {/* Category Card Header */}
              {(() => {
                const meta = categoryMetadata[activeCategory];
                const catConfig = engineConfig[activeCategory] || DEFAULT_PRICING_ENGINE[activeCategory];
                const addons = catConfig.fieldAddons || {};
                const rules = catConfig.rules || [];

                return (
                  <div className="space-y-6">
                    {/* 1. Base Price Banner */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                        <div className="flex items-start gap-3.5">
                          <div className={`p-3 rounded-2xl bg-${meta.color}-100 text-${meta.color}-700 shrink-0`}>
                            <meta.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-lg font-black text-slate-900">{meta.name}</h2>
                              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                {meta.tag}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-1">{meta.desc}</p>
                          </div>
                        </div>

                        {/* Base Price Input */}
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center gap-3 shrink-0">
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Base Price</p>
                            <p className="text-[11px] text-slate-400">Starting minimum</p>
                          </div>
                          <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-inner">
                            <span className="text-slate-400 font-bold text-sm">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={catConfig.basePrice}
                              onChange={(e) => updateBasePrice(activeCategory, Number(e.target.value))}
                              className="w-20 font-black text-base text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Info Notice */}
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50/80 p-3 rounded-xl border border-slate-100">
                        <Info className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>
                          When a lead has additional fields available (such as verified phone, known college, or immediate move-in), the add-ons below are dynamically added to this base price.
                        </span>
                      </div>
                    </div>

                    {/* 2. Field-Level Add-On Matrix */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>Field Data Add-on Matrix</span>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                              8 Available Fields
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Extra premium added to lead price when specific prospect information is present.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                        {/* 1. Phone */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                              <Phone className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">Verified Phone Number</p>
                              <p className="text-[10px] text-slate-400 truncate">Phone verified via OTP</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasPhone ?? 10}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasPhone", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 2. College / Institution */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-purple-100 text-purple-700 shrink-0">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">College / Company</p>
                              <p className="text-[10px] text-slate-400 truncate">Specific student institution</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasCollege ?? 10}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasCollege", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 3. Target Area / Locality */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">Target Area / Locality</p>
                              <p className="text-[10px] text-slate-400 truncate">Sector or locality matched</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasArea ?? 10}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasArea", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 4. Budget Defined */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                              <IndianRupee className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">Budget Specified</p>
                              <p className="text-[10px] text-slate-400 truncate">Has rent budget range</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasBudget ?? 10}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasBudget", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 5. High Budget Prospect */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">High Budget Threshold</p>
                              <p className="text-[10px] text-slate-400 truncate">Rent ≥ ₹{(addons.highBudgetThreshold || 15000).toLocaleString("en-IN")}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasHighBudget ?? 20}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasHighBudget", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 6. Immediate Move-in */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-orange-100 text-orange-700 shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">Immediate Move-In</p>
                              <p className="text-[10px] text-slate-400 truncate">Immediate / within 7-15 days</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasImmediateMoveIn ?? 15}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasImmediateMoveIn", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 7. Specific Property Viewed */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">Property Linked</p>
                              <p className="text-[10px] text-slate-400 truncate">Specific listing associated</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.hasProperty ?? 10}
                              onChange={(e) => updateFieldAddon(activeCategory, "hasProperty", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* 8. Verified Lead Badge */}
                        <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-white hover:border-blue-300 transition-all">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                              <ShieldCheck className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-extrabold text-slate-900 truncate">Verified Lead Badge</p>
                              <p className="text-[10px] text-slate-400 truncate">Team verification complete</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-lg border border-slate-200">
                            <span className="text-slate-400 text-xs font-bold">+₹</span>
                            <input
                              type="number"
                              min="0"
                              value={addons.isVerified ?? 20}
                              onChange={(e) => updateFieldAddon(activeCategory, "isVerified", Number(e.target.value))}
                              className="w-12 font-black text-xs text-slate-900 text-right focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Custom Multi-Field Conditional Rules */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                            <span>Custom Multi-Field Rules</span>
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                              "If Field A + Field B then..."
                            </span>
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Override or add bonus pricing when multiple fields are all simultaneously present on a prospect.
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setNewRule((prev) => ({
                              ...prev,
                              category: activeCategory,
                              name: "",
                              requiredFields: ["college", "area"],
                              action: "add_bonus",
                              priceValue: 20
                            }));
                            setIsRuleModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Multi-Field Rule</span>
                        </button>
                      </div>

                      {rules.length === 0 ? (
                        <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs font-medium">
                          No custom rules added for this category yet. Click "Add Multi-Field Rule" above to create one.
                        </div>
                      ) : (
                        <div className="space-y-2.5 pt-1">
                          {rules.map((rule) => (
                            <div
                              key={rule.id}
                              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                rule.enabled
                                  ? "bg-white border-slate-200 shadow-xs hover:border-blue-300"
                                  : "bg-slate-50 border-slate-200/60 opacity-60"
                              }`}
                            >
                              <div className="space-y-1.5 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-extrabold text-slate-900 text-sm">{rule.name}</h4>
                                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                    rule.action === "set_fixed"
                                      ? "bg-purple-50 text-purple-700 border border-purple-200"
                                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  }`}>
                                    {rule.action === "set_fixed" ? `Fixed ₹${rule.priceValue}` : `+₹${rule.priceValue} Bonus`}
                                  </span>
                                </div>

                                {/* Required Fields Tags */}
                                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                                  <span className="font-bold text-slate-400 text-[10px] uppercase">Requires:</span>
                                  {rule.requiredFields?.map((f) => (
                                    <span key={f} className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md border border-slate-200 capitalize">
                                      ✓ {f}
                                    </span>
                                  ))}
                                  {rule.minBudget ? (
                                    <span className="bg-amber-50 text-amber-700 font-bold px-2 py-0.5 rounded-md border border-amber-200">
                                      Budget ≥ ₹{rule.minBudget.toLocaleString("en-IN")}
                                    </span>
                                  ) : null}
                                  {rule.immediateOnly ? (
                                    <span className="bg-orange-50 text-orange-700 font-bold px-2 py-0.5 rounded-md border border-orange-200">
                                      Immediate Move-In
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleRuleEnabled(activeCategory, rule.id)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                    rule.enabled
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                                  }`}
                                >
                                  {rule.enabled ? "Active" : "Disabled"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteRule(activeCategory, rule.id)}
                                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Rule"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </>
          ) : (
            /* Global Tier Multipliers Tab */
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div>
                <h2 className="text-lg font-black text-slate-900">Lead Tier Defaults</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal baseline pricing for Exclusive, Verified, and Pay Per Booking leads.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Shared Lead */}
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-slate-800">Shared Lead Base</span>
                    <span className="text-[10px] font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Up to 4 Owners</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-slate-200">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={sharedLeadPrice}
                      onChange={(e) => setSharedLeadPrice(Number(e.target.value))}
                      className="w-full font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Exclusive Lead */}
                <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-amber-900">Exclusive Lead Price</span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-200 px-2 py-0.5 rounded">1 Owner Only</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-amber-200">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={exclusiveLeadPrice}
                      onChange={(e) => setExclusiveLeadPrice(Number(e.target.value))}
                      className="w-full font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Verified Lead */}
                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-emerald-900">Verified Lead Price</span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded">Verified Profile</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-emerald-200">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={verifiedLeadPrice}
                      onChange={(e) => setVerifiedLeadPrice(Number(e.target.value))}
                      className="w-full font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Pay Per Booking */}
                <div className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-purple-900">Pay Per Booking Commission</span>
                    <span className="text-[10px] font-black text-purple-800 bg-purple-200 px-2 py-0.5 rounded">Post-Booking</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white p-2 rounded-xl border border-purple-200">
                    <span className="text-slate-400 font-bold">₹</span>
                    <input
                      type="number"
                      value={payPerBookingCommission}
                      onChange={(e) => setPayPerBookingCommission(Number(e.target.value))}
                      className="w-full font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Interactive Pricing Simulator */}
        <div className="space-y-6">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5 sticky top-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-400/30">
                  <Calculator className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-white">Live Price Simulator</h3>
                  <p className="text-[10px] text-slate-400">Real-time dynamic rule calculator</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-400/20">
                {activeCategory === "global" ? "signup" : activeCategory}
              </span>
            </div>

            {/* Big Total Card */}
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Calculated Lead Price</p>
              <div className="text-4xl font-black text-emerald-400 flex items-center justify-center gap-1">
                <span>₹</span>
                <span>{simulatedResult.finalPrice}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Base ₹{simulatedResult.basePrice} + Field & Rule Add-ons
              </p>
            </div>

            {/* Simulator Field Toggles */}
            <div className="space-y-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Toggle Prospect Data Available</p>
              <div className="space-y-1.5 text-xs">
                {/* Phone */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.phone}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, phone: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>Verified Phone Number</span>
                  </div>
                  <span className="text-[10px] text-blue-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.hasPhone ?? 10}</span>
                </label>

                {/* College */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.college}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, college: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>College / Institution</span>
                  </div>
                  <span className="text-[10px] text-purple-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.hasCollege ?? 10}</span>
                </label>

                {/* Area */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.area}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, area: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>Target Area / Sector</span>
                  </div>
                  <span className="text-[10px] text-emerald-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.hasArea ?? 10}</span>
                </label>

                {/* Budget */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.budget}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, budget: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>Budget Defined (₹12,000)</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.hasBudget ?? 10}</span>
                </label>

                {/* Immediate */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.immediateMoveIn}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, immediateMoveIn: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>Immediate Move-In</span>
                  </div>
                  <span className="text-[10px] text-orange-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.hasImmediateMoveIn ?? 15}</span>
                </label>

                {/* Property */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.property}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, property: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>Specific Property Linked</span>
                  </div>
                  <span className="text-[10px] text-indigo-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.hasProperty ?? 10}</span>
                </label>

                {/* Verified */}
                <label className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={simActiveFields.isVerified}
                      onChange={(e) => setSimActiveFields((prev) => ({ ...prev, isVerified: e.target.checked }))}
                      className="rounded border-slate-700 text-blue-500 focus:ring-blue-400"
                    />
                    <span>Verified Lead Badge</span>
                  </div>
                  <span className="text-[10px] text-teal-300 font-bold">+₹{engineConfig[activeCategory === "global" ? "signup" : activeCategory]?.fieldAddons?.isVerified ?? 20}</span>
                </label>
              </div>
            </div>

            {/* Price Breakdown Receipt */}
            <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Calculation Breakdown</p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {simulatedResult.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-300">
                    <span className="truncate pr-2">{item.label}</span>
                    <span className={`font-bold shrink-0 ${item.type === "base" ? "text-white" : item.type === "rule" ? "text-purple-300" : "text-emerald-400"}`}>
                      {item.type === "base" ? `₹${item.amount}` : `+₹${item.amount}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal for Creating Custom Multi-Field Rule */}
      {isRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Add Multi-Field Condition Rule</h3>
                <p className="text-xs text-slate-500">"If Field A AND Field B are both present, then..."</p>
              </div>
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Rule Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Rule Name</label>
                <input
                  type="text"
                  placeholder="e.g. Complete Student Profile, Urgent High Budget"
                  value={newRule.name || ""}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Applicable Category</label>
                <select
                  value={newRule.category || "signup"}
                  onChange={(e) => setNewRule((prev) => ({ ...prev, category: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="signup">City Signup Leads</option>
                  <option value="opened_property">Opened Property Leads</option>
                  <option value="tried_to_contact">Tried to Contact</option>
                  <option value="conversion_system">Assisted Conversion</option>
                  <option value="all">All Categories</option>
                </select>
              </div>

              {/* Required Fields Checkboxes */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Required Fields (All must be present)</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                  {[
                    { id: "phone", label: "Phone Number" },
                    { id: "college", label: "College / Company" },
                    { id: "area", label: "Locality / Area" },
                    { id: "budget", label: "Budget Defined" },
                    { id: "moveInTimeline", label: "Immediate Move-in" },
                    { id: "property", label: "Property Linked" },
                    { id: "isVerified", label: "Verified Lead" }
                  ].map((f) => {
                    const isChecked = (newRule.requiredFields || []).includes(f.id);
                    return (
                      <label key={f.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            setNewRule((prev) => {
                              const curr = prev.requiredFields || [];
                              const updated = isChecked ? curr.filter((x) => x !== f.id) : [...curr, f.id];
                              return { ...prev, requiredFields: updated };
                            });
                          }}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-semibold text-slate-700">{f.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Action: Add Bonus vs Set Fixed */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pricing Effect</label>
                  <select
                    value={newRule.action || "add_bonus"}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, action: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="add_bonus">Add Bonus (+₹X)</option>
                    <option value="set_fixed">Set Exact Price (₹X)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={newRule.priceValue || 20}
                    onChange={(e) => setNewRule((prev) => ({ ...prev, priceValue: Number(e.target.value) }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-black text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRuleModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateRule}
                className="px-5 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all cursor-pointer"
              >
                Add Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
