import connectDB from "@/lib/mongoose";
import { Lead, ILead } from "@/models/Lead";
import { SystemSettings } from "@/models/SystemSettings";
import { calculateDynamicLeadPrice } from "@/lib/pricingEngine";

export interface LeadFilterOptions {
  category?: "signup" | "opened_property" | "tried_to_contact" | "conversion_system" | "city" | "all";
  leadType?: "shared" | "exclusive" | "verified" | "pay_per_booking";
  city?: string;
  area?: string;
  college?: string;
  maxBudget?: number;
  gender?: "male" | "female" | "any";
  buyerUserId?: string;
  ownerId?: string;
}

/**
 * Mask string with asterisks preserving start and end characters
 */
export function maskName(name: string): string {
  if (!name) return "Te****";
  const parts = name.trim().split(" ");
  return parts
    .map((part) => {
      if (part.length <= 2) return part[0] + "*";
      const start = part.slice(0, 2);
      const asterisks = "*".repeat(Math.max(part.length - 2, 3));
      return `${start}${asterisks}`;
    })
    .join(" ");
}

export function maskPhone(phone?: string): string {
  if (!phone) return "+91 98*** ***00";
  const cleaned = phone.replace(/\s+/g, "");
  if (cleaned.length >= 10) {
    const last2 = cleaned.slice(-2);
    const first4 = cleaned.slice(0, cleaned.length - 6);
    return `${first4}*** ***${last2}`;
  }
  return "+91 98*** ***" + cleaned.slice(-2);
}

export function maskBudget(budget?: number): string {
  if (!budget) return "₹**,***";
  return "₹**,***";
}

/**
 * Lead Distribution Matching Engine
 * Matches database leads against buyer preferences and enforces asterisk masking until purchased.
 */
export async function getMatchingLeads(options: LeadFilterOptions = {}) {
  await connectDB();

  const query: any = {};

  // Category filtering:
  // - "city": shows all signup leads looking for properties in this city
  // - "opened_property", "tried_to_contact", "conversion_system": filters by that specific category
  if (options.category && options.category !== "all") {
    if (options.category === "city") {
      query.category = "signup";
    } else {
      query.category = options.category;
    }
  }

  let cityFilter = options.city;
  if (!cityFilter && options.ownerId && (options.category === "city" || !options.category)) {
    try {
      const { User } = await import("@/models/User");
      const { Property } = await import("@/models/Property");
      const owner = await User.findById(options.ownerId);
      if (owner?.city || owner?.targetCity) {
        cityFilter = owner.city || owner.targetCity;
      } else {
        const prop = await Property.findOne({ ownerId: options.ownerId });
        if (prop?.location?.city) {
          cityFilter = prop.location.city;
        }
      }
    } catch (e) {
      // ignore lookup error
    }
  }

  if (cityFilter && cityFilter !== "all") {
    query.city = { $regex: cityFilter.trim(), $options: "i" };
  }

  // Owner property isolation for specific behavioral tabs
  if (options.ownerId && ["opened_property", "tried_to_contact", "conversion_system"].includes(options.category || "")) {
    try {
      const mongoose = (await import("mongoose")).default;
      const isValid = mongoose.Types.ObjectId.isValid(options.ownerId);
      const ownerObjId = isValid ? new mongoose.Types.ObjectId(options.ownerId) : null;

      const { Property } = await import("@/models/Property");
      const props = await Property.find({
        $or: [
          { ownerId: options.ownerId },
          ...(ownerObjId ? [{ ownerId: ownerObjId }] : [])
        ]
      }).select("_id");
      const propIds = props.map((p) => p._id);

      query.$or = [
        { ownerId: options.ownerId },
        ...(ownerObjId ? [{ ownerId: ownerObjId }] : []),
        ...(propIds.length > 0 ? [{ propertyId: { $in: propIds } }] : []),
        { ownerId: { $exists: false } },
        { ownerId: null }
      ];
    } catch (e) {
      // fallback
      query.ownerId = options.ownerId;
    }
  }

  if (options.area) {
    query.area = { $regex: options.area, $options: "i" };
  }

  if (options.college) {
    query.college = { $regex: options.college, $options: "i" };
  }

  if (options.maxBudget) {
    query.budget = { $lte: options.maxBudget };
  }

  if (options.gender && options.gender !== "any") {
    query.gender = { $in: [options.gender, "any"] };
  }

  const leads = await Lead.find(query)
    .sort({ createdAt: -1 })
    .populate("propertyId", "title location price type");

  // Determine current system settings for default price fallback
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }

  // Lead Capacity & Exclusivity filtering:
  // City signup category and shared leads can be unlocked by up to 4 owners.
  // When under capacity (< 4 owners), show it to other owners so the first 4 owners can unlock it.
  // Once 4 owners unlock it, it is sold out and only visible to the owners who purchased it.
  const visibleLeads = leads.filter((lead) => {
    const isExclusive = lead.leadType === "exclusive" || lead.leadType === "verified";
    const maxBuyersLimit = isExclusive ? 1 : (lead.maxBuyers || 4);
    const unlockedByCount = lead.unlockedBy ? lead.unlockedBy.length : 0;
    const isBoughtByCurrentUser = options.buyerUserId
      ? lead.unlockedBy?.some((id: any) => id.toString() === options.buyerUserId)
      : false;

    // If reached max capacity (e.g. 4 owners for city signup/shared, or 1 for exclusive):
    // Only show to the owners who already purchased it.
    if (unlockedByCount >= maxBuyersLimit) {
      return isBoughtByCurrentUser;
    }

    // Still has open slots (< 4 owners): visible to all owners so the first 4 can unlock it!
    return true;
  });

  return visibleLeads.map((lead) => {
    const isExclusive = lead.leadType === "exclusive" || lead.leadType === "verified";
    const maxBuyersLimit = isExclusive ? 1 : (lead.maxBuyers || 4);
    const unlockedByCount = lead.unlockedBy ? lead.unlockedBy.length : 0;
    const isBoughtByCurrentUser = options.buyerUserId
      ? lead.unlockedBy?.some((id: any) => id.toString() === options.buyerUserId)
      : false;

    const isSoldOut = unlockedByCount >= maxBuyersLimit;
    const price = lead.price || calculateDynamicLeadPrice(lead, settings).finalPrice;

    return {
      _id: lead._id.toString(),
      tenantName: isBoughtByCurrentUser ? lead.tenantName : maskName(lead.tenantName),
      tenantPhone: isBoughtByCurrentUser ? lead.tenantPhone : maskPhone(lead.tenantPhone),
      rawPhone: isBoughtByCurrentUser ? lead.tenantPhone : undefined,
      city: lead.city || "Greater Noida",
      college: isBoughtByCurrentUser ? lead.college : (lead.college ? maskName(lead.college) : "Campus Student"),
      area: lead.area || "North Campus",
      budget: isBoughtByCurrentUser ? (lead.budget || 12000) : undefined,
      maskedBudget: isBoughtByCurrentUser ? undefined : maskBudget(lead.budget || 12000),
      gender: lead.gender || "any",
      moveInTimeline: lead.moveInTimeline || "Immediate",
      category: lead.category || "signup",
      leadType: isExclusive ? "exclusive" : (lead.leadType || "shared"),
      price,
      maxBuyers: maxBuyersLimit,
      buyerCount: unlockedByCount,
      isUnlocked: isBoughtByCurrentUser,
      isSoldOut: isSoldOut && !isBoughtByCurrentUser,
      isVerified: lead.isVerified || false,
      verificationNotes: lead.verificationNotes,
      stage: lead.stage || "new",
      property: lead.propertyId || null,
      createdAt: lead.createdAt
    };
  });
}

export function getPriceForCategory(category: string, settings: any) {
  switch (category) {
    case "opened_property":
      return settings?.openedPropertyLeadPrice || 99;
    case "tried_to_contact":
      return settings?.contactAttemptLeadPrice || 199;
    case "conversion_system":
      return settings?.conversionSystemPrice || 499;
    case "signup":
    default:
      return settings?.signupLeadPrice || 49;
  }
}

export function getPriceForType(type: string, settings: any) {
  switch (type) {
    case "exclusive":
      return settings?.exclusiveLeadPrice || 249;
    case "verified":
      return settings?.verifiedLeadPrice || 499;
    case "pay_per_booking":
      return settings?.payPerBookingCommission || 20000;
    case "shared":
    default:
      return settings?.sharedLeadPrice || 49;
  }
}
