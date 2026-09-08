import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Lead } from "@/models/Lead";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { sendInstantNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as an owner/buyer." }, { status: 401 });
    }

    await connectDB();

    const sessionUser = session.user as any;
    const dbUser = await User.findOne({
      $or: [
        { _id: sessionUser.id },
        { phone: sessionUser.phone },
        { email: sessionUser.email }
      ].filter(Boolean)
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please log in again." }, { status: 401 });
    }

    const buyerUserId = dbUser._id.toString();
    const buyerPhone = dbUser.phone;

    const { leadId } = await req.json();
    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if user already unlocked this lead
    if (lead.unlockedBy.some((id: any) => id.toString() === buyerUserId)) {
      return NextResponse.json({
        success: true,
        message: "Lead already unlocked",
        tenantPhone: lead.tenantPhone,
        tenantName: lead.tenantName,
        budget: lead.budget
      });
    }

    // Check max buyers limit (City signup and shared leads can be unlocked by up to 4 owners)
    const isExclusive = lead.leadType === "exclusive" || lead.leadType === "verified";
    const maxCapacity = isExclusive ? 1 : (lead.maxBuyers || 4);
    if (lead.unlockedBy.length >= maxCapacity) {
      return NextResponse.json({
        error: `This lead has reached its maximum capacity of ${maxCapacity} owner(s) and is sold out.`
      }, { status: 400 });
    }

    // Fetch or create buyer wallet
    let wallet = await Wallet.findOne({ userId: buyerUserId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: buyerUserId, balance: 500 });
    }

    // Check wallet balance
    if (wallet.balance < lead.price) {
      return NextResponse.json({
        error: `Insufficient wallet balance. Required: ₹${lead.price}, Current Balance: ₹${wallet.balance}. Please deposit funds into your wallet.`,
        insufficientFunds: true,
        requiredAmount: lead.price,
        currentBalance: wallet.balance
      }, { status: 400 });
    }

    // Execute atomic debit
    wallet.balance -= lead.price;
    wallet.totalSpent += lead.price;
    await wallet.save();

    // Record debit transaction
    await Transaction.create({
      userId: buyerUserId,
      type: "debit",
      amount: lead.price,
      description: `Unlocked ${lead.leadType.toUpperCase()} Lead: ${lead.tenantName} (${lead.college})`,
      leadId: lead._id,
      status: "success"
    });

    // Add buyer to lead unlockedBy array
    lead.unlockedBy.push(buyerUserId as any);
    if (lead.stage === "new") {
      lead.stage = "contacted";
    }
    await lead.save();

    // Trigger instant WhatsApp/SMS notification to buyer
    if (buyerPhone) {
      await sendInstantNotification({
        recipientPhone: buyerPhone,
        message: `Lead Unlocked! You purchased ${lead.tenantName} (${lead.tenantPhone}). College: ${lead.college}, Budget: ₹${lead.budget}.`,
        leadId: lead._id.toString(),
        type: "lead_unlocked"
      });
    }

    return NextResponse.json({
      success: true,
      message: "Lead unlocked successfully!",
      tenantName: lead.tenantName,
      tenantPhone: lead.tenantPhone,
      budget: lead.budget,
      newBalance: wallet.balance
    });
  } catch (error: any) {
    console.error("Error unlocking lead:", error);
    return NextResponse.json({ error: "Failed to unlock lead", details: error.message }, { status: 500 });
  }
}
