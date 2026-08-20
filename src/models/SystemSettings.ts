import mongoose, { Schema, Document } from "mongoose";

export interface ISystemSettings extends Document {
  sharedLeadPrice: number;
  exclusiveLeadPrice: number;
  verifiedLeadPrice: number;
  payPerBookingCommission: number;
  updatedBy?: mongoose.Types.ObjectId;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    sharedLeadPrice: { type: Number, default: 49 },
    exclusiveLeadPrice: { type: Number, default: 249 },
    verifiedLeadPrice: { type: Number, default: 499 },
    payPerBookingCommission: { type: Number, default: 20000 },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export const SystemSettings = mongoose.models.SystemSettings || mongoose.model<ISystemSettings>("SystemSettings", SystemSettingsSchema);
