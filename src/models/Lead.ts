import mongoose, { Schema, Document } from "mongoose";

export interface ILead extends Document {
  propertyId?: mongoose.Types.ObjectId;
  tenantId?: mongoose.Types.ObjectId;
  ownerId?: mongoose.Types.ObjectId;
  tenantName: string;
  tenantPhone?: string;
  city?: string;
  college?: string;
  area?: string;
  budget?: number;
  gender?: "male" | "female" | "any";
  moveInTimeline?: string;
  leadType: "shared" | "exclusive" | "verified" | "pay_per_booking";
  category?: "signup" | "opened_property" | "tried_to_contact" | "conversion_system";
  price: number;
  maxBuyers: number;
  unlockedBy: mongoose.Types.ObjectId[];
  isVerified: boolean;
  verificationNotes?: string;
  stage: "new" | "contacted" | "verified" | "converted" | "booked";
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    tenantId: { type: Schema.Types.ObjectId, ref: "User" },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    tenantName: { type: String, required: true, default: "Prospective Tenant" },
    tenantPhone: { type: String },
    city: { type: String, default: "Greater Noida" },
    college: { type: String, default: "" },
    area: { type: String, default: "" },
    budget: { type: Number, default: 12000 },
    gender: { type: String, enum: ["male", "female", "any"], default: "any" },
    moveInTimeline: { type: String, default: "Within 15 days" },
    leadType: {
      type: String,
      enum: ["shared", "exclusive", "verified", "pay_per_booking"],
      default: "shared",
      required: true
    },
    category: {
      type: String,
      enum: ["signup", "opened_property", "tried_to_contact", "conversion_system"],
      default: "signup",
      required: true
    },
    price: { type: Number, required: true, default: 49 },
    maxBuyers: { type: Number, default: 4 },
    unlockedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
    verificationNotes: { type: String },
    stage: {
      type: String,
      enum: ["new", "contacted", "verified", "converted", "booked"],
      default: "new"
    }
  },
  { timestamps: true, strict: false }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).Lead;
}

export const Lead = mongoose.models.Lead || mongoose.model<ILead>("Lead", LeadSchema);
