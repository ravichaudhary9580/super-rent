import { IPricingEngineConfig, ICategoryPricingConfig, IPricingRule, IPricingFieldAddons } from "@/models/SystemSettings";

export const DEFAULT_PRICING_ENGINE: IPricingEngineConfig = {
  signup: {
    basePrice: 39,
    fieldAddons: {
      hasPhone: 10,
      hasCollege: 10,
      hasArea: 10,
      hasBudget: 10,
      hasHighBudget: 20,
      highBudgetThreshold: 15000,
      hasImmediateMoveIn: 15,
      hasGender: 5,
      hasProperty: 10,
      isVerified: 20
    },
    rules: [
      {
        id: "signup-full-profile",
        name: "Complete Student Profile (College + Area + Phone)",
        category: "signup",
        requiredFields: ["phone", "college", "area"],
        action: "add_bonus",
        priceValue: 20,
        enabled: true
      },
      {
        id: "signup-high-budget-immediate",
        name: "High Budget Ready Mover (Budget ≥ ₹15k + Immediate)",
        category: "signup",
        requiredFields: ["budget", "moveInTimeline"],
        minBudget: 15000,
        immediateOnly: true,
        action: "add_bonus",
        priceValue: 30,
        enabled: true
      }
    ]
  },
  opened_property: {
    basePrice: 79,
    fieldAddons: {
      hasPhone: 15,
      hasCollege: 10,
      hasArea: 10,
      hasBudget: 15,
      hasHighBudget: 25,
      highBudgetThreshold: 15000,
      hasImmediateMoveIn: 20,
      hasGender: 5,
      hasProperty: 15,
      isVerified: 30
    },
    rules: [
      {
        id: "opened-direct-contactable",
        name: "High Intent Prospect (Property + Phone + Immediate)",
        category: "opened_property",
        requiredFields: ["phone", "moveInTimeline"],
        immediateOnly: true,
        action: "add_bonus",
        priceValue: 25,
        enabled: true
      }
    ]
  },
  tried_to_contact: {
    basePrice: 169,
    fieldAddons: {
      hasPhone: 20,
      hasCollege: 15,
      hasArea: 15,
      hasBudget: 20,
      hasHighBudget: 35,
      highBudgetThreshold: 15000,
      hasImmediateMoveIn: 25,
      hasGender: 10,
      hasProperty: 20,
      isVerified: 40
    },
    rules: [
      {
        id: "contact-vip-ready",
        name: "Urgent Ready Mover (Immediate + Budget ≥ ₹15k)",
        category: "tried_to_contact",
        requiredFields: ["budget", "moveInTimeline"],
        minBudget: 15000,
        immediateOnly: true,
        action: "add_bonus",
        priceValue: 40,
        enabled: true
      }
    ]
  },
  conversion_system: {
    basePrice: 429,
    fieldAddons: {
      hasPhone: 25,
      hasCollege: 20,
      hasArea: 20,
      hasBudget: 30,
      hasHighBudget: 50,
      highBudgetThreshold: 15000,
      hasImmediateMoveIn: 35,
      hasGender: 10,
      hasProperty: 25,
      isVerified: 50
    },
    rules: [
      {
        id: "conversion-guaranteed-prospect",
        name: "Full Conversion Ready (Phone + College + Budget ≥ ₹15k)",
        category: "conversion_system",
        requiredFields: ["phone", "college", "budget"],
        minBudget: 15000,
        action: "add_bonus",
        priceValue: 50,
        enabled: true
      }
    ]
  },
  globalRules: []
};

export interface PriceBreakdownItem {
  label: string;
  amount: number;
  type: "base" | "field" | "rule";
}

export interface LeadPriceResult {
  finalPrice: number;
  basePrice: number;
  breakdown: PriceBreakdownItem[];
  appliedRules: string[];
}

export function getCategoryConfig(category: string, settings?: any): ICategoryPricingConfig {
  const catKey = (category === "opened_property" || category === "tried_to_contact" || category === "conversion_system")
    ? category
    : "signup";

  const engine = settings?.pricingEngine || DEFAULT_PRICING_ENGINE;
  const config = engine[catKey];

  if (!config) {
    return DEFAULT_PRICING_ENGINE[catKey];
  }

  // Ensure basePrice falls back to legacy settings if present
  let basePrice = config.basePrice;
  if (basePrice === undefined || basePrice === null) {
    if (catKey === "opened_property") basePrice = settings?.openedPropertyLeadPrice ?? 99;
    else if (catKey === "tried_to_contact") basePrice = settings?.contactAttemptLeadPrice ?? 199;
    else if (catKey === "conversion_system") basePrice = settings?.conversionSystemPrice ?? 499;
    else basePrice = settings?.signupLeadPrice ?? 49;
  }

  return {
    basePrice,
    fieldAddons: { ...DEFAULT_PRICING_ENGINE[catKey].fieldAddons, ...(config.fieldAddons || {}) },
    rules: Array.isArray(config.rules) ? config.rules : DEFAULT_PRICING_ENGINE[catKey].rules
  };
}

export function calculateDynamicLeadPrice(lead: any, settings?: any): LeadPriceResult {
  const category = lead?.category || "signup";
  const catKey = (category === "opened_property" || category === "tried_to_contact" || category === "conversion_system")
    ? category
    : "signup";

  const config = getCategoryConfig(catKey, settings);
  const addons = config.fieldAddons || {};
  const rules = config.rules || [];
  const globalRules: IPricingRule[] = Array.isArray(settings?.pricingEngine?.globalRules)
    ? settings.pricingEngine.globalRules
    : DEFAULT_PRICING_ENGINE.globalRules;

  let currentPrice = Number(config.basePrice) || 49;
  const breakdown: PriceBreakdownItem[] = [
    {
      label: `Base Category Price (${catKey.replace(/_/g, " ").toUpperCase()})`,
      amount: currentPrice,
      type: "base"
    }
  ];

  // 1. Evaluate Field Availability
  const phone = lead?.tenantPhone || lead?.rawPhone;
  const hasPhone = Boolean(phone && String(phone).replace(/\D/g, "").length >= 10);
  if (hasPhone && addons.hasPhone && addons.hasPhone > 0) {
    currentPrice += addons.hasPhone;
    breakdown.push({ label: "Verified Phone Available", amount: addons.hasPhone, type: "field" });
  }

  const college = lead?.college;
  const hasCollege = Boolean(college && String(college).trim().length > 0 && String(college).trim().toLowerCase() !== "general tenant");
  if (hasCollege && addons.hasCollege && addons.hasCollege > 0) {
    currentPrice += addons.hasCollege;
    breakdown.push({ label: `College / Institution Known (${college})`, amount: addons.hasCollege, type: "field" });
  }

  const area = lead?.area || (typeof lead?.location === "string" ? lead.location : "");
  const hasArea = Boolean(area && String(area).trim().length > 0 && String(area).trim().toLowerCase() !== "area matched");
  if (hasArea && addons.hasArea && addons.hasArea > 0) {
    currentPrice += addons.hasArea;
    breakdown.push({ label: `Target Locality / Area Specified (${area})`, amount: addons.hasArea, type: "field" });
  }

  const budgetNum = Number(lead?.budget) || 0;
  const hasBudget = budgetNum > 0;
  if (hasBudget && addons.hasBudget && addons.hasBudget > 0) {
    currentPrice += addons.hasBudget;
    breakdown.push({ label: `Budget Defined (₹${budgetNum.toLocaleString("en-IN")})`, amount: addons.hasBudget, type: "field" });
  }

  const highThreshold = addons.highBudgetThreshold || 15000;
  const hasHighBudget = budgetNum >= highThreshold;
  if (hasHighBudget && addons.hasHighBudget && addons.hasHighBudget > 0) {
    currentPrice += addons.hasHighBudget;
    breakdown.push({ label: `High Budget Prospect (≥ ₹${highThreshold.toLocaleString("en-IN")})`, amount: addons.hasHighBudget, type: "field" });
  }

  const moveIn = lead?.moveInTimeline || "";
  const isImmediate = Boolean(
    moveIn &&
    (moveIn.toLowerCase().includes("immediate") ||
     moveIn.toLowerCase().includes("urgent") ||
     moveIn.toLowerCase().includes("7 days") ||
     moveIn.toLowerCase().includes("15 days"))
  );
  if (isImmediate && addons.hasImmediateMoveIn && addons.hasImmediateMoveIn > 0) {
    currentPrice += addons.hasImmediateMoveIn;
    breakdown.push({ label: `Ready Move-in Timeline (${moveIn || "Immediate"})`, amount: addons.hasImmediateMoveIn, type: "field" });
  }

  const gender = lead?.gender;
  const hasGender = Boolean(gender && gender !== "any");
  if (hasGender && addons.hasGender && addons.hasGender > 0) {
    currentPrice += addons.hasGender;
    breakdown.push({ label: `Gender Preference Specified (${gender})`, amount: addons.hasGender, type: "field" });
  }

  const hasProperty = Boolean(lead?.propertyId || lead?.property);
  if (hasProperty && addons.hasProperty && addons.hasProperty > 0) {
    currentPrice += addons.hasProperty;
    breakdown.push({ label: "Specific Property Linked", amount: addons.hasProperty, type: "field" });
  }

  const isVerified = Boolean(lead?.isVerified);
  if (isVerified && addons.isVerified && addons.isVerified > 0) {
    currentPrice += addons.isVerified;
    breakdown.push({ label: "Verified Lead Badge", amount: addons.isVerified, type: "field" });
  }

  // 2. Evaluate Custom Multi-Field Conditional Rules
  const appliedRules: string[] = [];
  const allCandidateRules = [...rules, ...globalRules];

  for (const rule of allCandidateRules) {
    if (!rule.enabled) continue;
    if (rule.category !== "all" && rule.category !== catKey) continue;

    let matches = true;

    // Check all required fields in the rule
    for (const field of rule.requiredFields || []) {
      if (field === "phone" && !hasPhone) matches = false;
      else if (field === "college" && !hasCollege) matches = false;
      else if (field === "area" && !hasArea) matches = false;
      else if (field === "budget" && !hasBudget) matches = false;
      else if (field === "moveInTimeline" && !isImmediate) matches = false;
      else if (field === "gender" && !hasGender) matches = false;
      else if (field === "property" && !hasProperty) matches = false;
      else if (field === "isVerified" && !isVerified) matches = false;

      if (!matches) break;
    }

    // Check specific conditions
    if (matches && rule.minBudget && rule.minBudget > 0) {
      if (budgetNum < rule.minBudget) matches = false;
    }

    if (matches && rule.immediateOnly) {
      if (!isImmediate) matches = false;
    }

    if (matches) {
      appliedRules.push(rule.name);
      if (rule.action === "set_fixed") {
        currentPrice = rule.priceValue;
        breakdown.push({
          label: `Rule Override: ${rule.name} (Fixed Price)`,
          amount: rule.priceValue,
          type: "rule"
        });
      } else {
        currentPrice += rule.priceValue;
        breakdown.push({
          label: `Rule Bonus: ${rule.name}`,
          amount: rule.priceValue,
          type: "rule"
        });
      }
    }
  }

  // Ensure price is at least a positive integer
  const finalPrice = Math.max(1, Math.round(currentPrice));

  return {
    finalPrice,
    basePrice: config.basePrice,
    breakdown,
    appliedRules
  };
}
