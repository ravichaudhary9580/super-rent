import mongoose, { Schema, Document } from "mongoose";

export interface IConversionRequest extends Document {
  ownerId: mongoose.Types.ObjectId;
  leadId?: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  tenantName: string;
  tenantPhone: string;
  city?: string;
  area?: string;
  budget?: number;
  moveInTimeline?: string;
  ownerNotes?: string;
  status: "pending" | "assigned" | "in_progress" | "visit_scheduled" | "converted" | "dropped";
  salesAgentName?: string;
  adminNotes?: string;
  commissionType?: string;
  lastContactedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversionRequestSchema = new Schema<IConversionRequest>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    propertyId: { type: Schema.Types.ObjectId, ref: "Property" },
    tenantName: { type: String, required: true, trim: true },
    tenantPhone: { type: String, required: true, trim: true },
    city: { type: String, default: "Greater Noida" },
    area: { type: String, default: "" },
    budget: { type: Number, default: 0 },
    moveInTimeline: { type: String, default: "Immediate" },
    ownerNotes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "visit_scheduled", "converted", "dropped"],
      default: "pending",
      index: true
    },
    salesAgentName: { type: String, default: "" },
    adminNotes: { type: String, default: "" },
    commissionType: { type: String, default: "Standard Assisted Conversion" },
    lastContactedAt: { type: Date }
  },
  { timestamps: true, strict: false }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).ConversionRequest;
}

export const ConversionRequest =
  mongoose.models.ConversionRequest ||
  mongoose.model<IConversionRequest>("ConversionRequest", ConversionRequestSchema);
