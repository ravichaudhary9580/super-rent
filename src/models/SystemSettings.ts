import mongoose, { Schema, Document } from "mongoose";

export interface IPricingFieldAddons {
  hasPhone?: number;
  hasCollege?: number;
  hasArea?: number;
  hasBudget?: number;
  hasHighBudget?: number;
  highBudgetThreshold?: number;
  hasImmediateMoveIn?: number;
  hasGender?: number;
  hasProperty?: number;
  isVerified?: number;
}

export interface IPricingRule {
  id: string;
  name: string;
  category: "all" | "signup" | "opened_property" | "tried_to_contact" | "conversion_system";
  requiredFields: string[]; // e.g. ["college", "area", "phone"]
  minBudget?: number;
  immediateOnly?: boolean;
  action: "set_fixed" | "add_bonus";
  priceValue: number;
  enabled: boolean;
}

export interface ICategoryPricingConfig {
  basePrice: number;
  fieldAddons: IPricingFieldAddons;
  rules: IPricingRule[];
}

export interface IPricingEngineConfig {
  signup: ICategoryPricingConfig;
  opened_property: ICategoryPricingConfig;
  tried_to_contact: ICategoryPricingConfig;
  conversion_system: ICategoryPricingConfig;
  globalRules: IPricingRule[];
}

export interface ISystemSettings extends Document {
  signupLeadPrice: number;
  openedPropertyLeadPrice: number;
  contactAttemptLeadPrice: number;
  conversionSystemPrice: number;
  sharedLeadPrice: number;
  exclusiveLeadPrice: number;
  verifiedLeadPrice: number;
  payPerBookingCommission: number;
  pricingEngine?: IPricingEngineConfig;
  updatedBy?: mongoose.Types.ObjectId;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    signupLeadPrice: { type: Number, default: 49 },
    openedPropertyLeadPrice: { type: Number, default: 99 },
    contactAttemptLeadPrice: { type: Number, default: 199 },
    conversionSystemPrice: { type: Number, default: 499 },
    sharedLeadPrice: { type: Number, default: 49 },
    exclusiveLeadPrice: { type: Number, default: 249 },
    verifiedLeadPrice: { type: Number, default: 499 },
    payPerBookingCommission: { type: Number, default: 20000 },
    pricingEngine: {
      type: Schema.Types.Mixed,
      default: null
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).SystemSettings;
}

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);
