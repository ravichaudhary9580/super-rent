import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: "credit" | "debit";
  amount: number;
  description: string;
  leadId?: mongoose.Types.ObjectId;
  razorpayPaymentId?: string;
  status: "success" | "pending" | "failed";
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    razorpayPaymentId: { type: String },
    status: { type: String, enum: ["success", "pending", "failed"], default: "success" }
  },
  { timestamps: true }
);

export const Transaction = mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
