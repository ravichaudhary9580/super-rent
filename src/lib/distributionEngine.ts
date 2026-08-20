import connectDB from "@/lib/mongoose";
import { Lead, ILead } from "@/models/Lead";
import { SystemSettings } from "@/models/SystemSettings";

export interface LeadFilterOptions {
  leadType?: "shared" | "exclusive" | "verified" | "pay_per_booking";
  area?: string;
  college?: string;
  maxBudget?: number;
  gender?: "male" | "female" | "any";
  buyerUserId?: string;
}

/**
 * Lead Distribution Matching Engine
 * Matches database leads against buyer preferences and enforces exclusivity/max buyer rules.
 */
export async function getMatchingLeads(options: LeadFilterOptions = {}) {
  await connectDB();

  const query: any = {};

  if (options.leadType) {
    query.leadType = options.leadType;
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

  const leads = await Lead.find(query).sort({ createdAt: -1 }).populate("propertyId", "title location");

  // Determine current system settings for default price fallback
  let settings = await SystemSettings.findOne();
  if (!settings) {
    settings = await SystemSettings.create({});
  }

  return leads.map((lead) => {
    const unlockedByCount = lead.unlockedBy ? lead.unlockedBy.length : 0;
    const isBoughtByCurrentUser = options.buyerUserId
      ? lead.unlockedBy?.some((id: any) => id.toString() === options.buyerUserId)
      : false;

    const isSoldOut = unlockedByCount >= lead.maxBuyers;

    return {
      _id: lead._id.toString(),
      tenantName: isBoughtByCurrentUser ? lead.tenantName : "Locked Tenant",
      tenantPhone: isBoughtByCurrentUser ? lead.tenantPhone : undefined,
      college: isBoughtByCurrentUser ? lead.college : undefined,
      area: lead.area,
      budget: lead.budget,
      gender: isBoughtByCurrentUser ? lead.gender : undefined,
      moveInTimeline: isBoughtByCurrentUser ? lead.moveInTimeline : undefined,
      leadType: lead.leadType,
      temperature: lead.temperature,
      price: lead.price || getPriceForType(lead.leadType, settings),
      maxBuyers: lead.maxBuyers,
      buyerCount: unlockedByCount,
      isUnlocked: isBoughtByCurrentUser,
      isSoldOut: isSoldOut && !isBoughtByCurrentUser,
      isVerified: lead.isVerified,
      verificationNotes: isBoughtByCurrentUser ? lead.verificationNotes : undefined,
      stage: lead.stage,
      createdAt: lead.createdAt
    };
  });
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
