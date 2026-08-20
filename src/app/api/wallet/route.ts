import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongoose";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 500 });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      totalSpent: wallet.totalSpent,
      currency: wallet.currency,
      transactions
    });
  } catch (error: any) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ error: "Failed to fetch wallet", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id;

    if (!session || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, razorpayPaymentId } = await req.json();
    const rechargeAmount = Number(amount);

    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
    }

    await connectDB();

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 500 });
    }

    wallet.balance += rechargeAmount;
    await wallet.save();

    await Transaction.create({
      userId,
      type: "credit",
      amount: rechargeAmount,
      description: `Wallet Recharge via Razorpay (${razorpayPaymentId || "SIMULATED_PAYMENT"})`,
      razorpayPaymentId: razorpayPaymentId || `PAY_${Date.now()}`,
      status: "success"
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ₹${rechargeAmount} to your wallet!`,
      newBalance: wallet.balance
    });
  } catch (error: any) {
    console.error("Error recharging wallet:", error);
    return NextResponse.json({ error: "Failed to recharge wallet", details: error.message }, { status: 500 });
  }
}
