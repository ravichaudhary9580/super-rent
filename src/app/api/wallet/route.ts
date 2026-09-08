import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as an owner/buyer." }, { status: 401 });
    }

    await connectDB();

    const sessionUser = session.user as any;
    let dbUser = null;
    if (sessionUser.id) {
      dbUser = await User.findById(sessionUser.id);
    }
    if (!dbUser && sessionUser.phone) {
      dbUser = await User.findOne({ phone: sessionUser.phone });
    }
    if (!dbUser && sessionUser.email) {
      dbUser = await User.findOne({ email: sessionUser.email });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 401 });
    }

    const userId = dbUser._id;

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 500 });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      balance: wallet.balance,
      totalSpent: wallet.totalSpent || 0,
      currency: wallet.currency || "INR",
      userName: dbUser.name,
      userRole: dbUser.role,
      transactions
    });
  } catch (error: any) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json({ error: "Failed to fetch wallet", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as an owner/buyer." }, { status: 401 });
    }

    await connectDB();

    const sessionUser = session.user as any;
    let dbUser = null;
    if (sessionUser.id) {
      dbUser = await User.findById(sessionUser.id);
    }
    if (!dbUser && sessionUser.phone) {
      dbUser = await User.findOne({ phone: sessionUser.phone });
    }
    if (!dbUser && sessionUser.email) {
      dbUser = await User.findOne({ email: sessionUser.email });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 401 });
    }

    const userId = dbUser._id;
    const { amount, razorpayPaymentId, note } = await req.json();
    const rechargeAmount = Number(amount);

    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 500 });
    }

    wallet.balance += rechargeAmount;
    await wallet.save();

    // Primary company-to-owner deposit transaction
    const paymentRef = razorpayPaymentId || `DEP-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const depositTx = await Transaction.create({
      userId,
      type: "credit",
      amount: rechargeAmount,
      description: note || `Owner Wallet Deposit to Provier App (${dbUser.name || dbUser.phone || "Owner"} -> Provider App Company Account)`,
      razorpayPaymentId: paymentRef,
      status: "success"
    });

    return NextResponse.json({
      success: true,
      message: `Successfully added ₹${rechargeAmount.toLocaleString("en-IN")} to your wallet!`,
      newBalance: wallet.balance,
      transaction: depositTx
    });
  } catch (error: any) {
    console.error("Error recharging wallet:", error);
    return NextResponse.json({ error: "Failed to recharge wallet", details: error.message }, { status: 500 });
  }
}

