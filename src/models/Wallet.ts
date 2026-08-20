import mongoose, { Schema, Document } from "mongoose";

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  balance: number;
  totalSpent: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const WalletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, required: true, default: 500 }, // Welcome bonus credits for buyers
    totalSpent: { type: Number, required: true, default: 0 },
    currency: { type: String, default: "INR" }
  },
  { timestamps: true }
);

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>("Wallet", WalletSchema);
