import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  phone: string;
  code: string;
  createdAt: Date;
}

const OtpSchema = new Schema<IOtp>(
  {
    phone: { type: String, required: true, unique: true },
    code: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes
  }
);

export const Otp = mongoose.models.Otp || mongoose.model<IOtp>("Otp", OtpSchema);
