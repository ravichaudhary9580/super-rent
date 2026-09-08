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
      return NextResponse.json({ error: "User profile not found. Please log in again." }, { status: 401 });
    }

    const buyerUserId = dbUser._id.toString();
    const buyerPhone = dbUser.phone;

    const { leadIds } = await req.json();
    if (!Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json({ error: "Please select at least one lead to buy." }, { status: 400 });
    }

    // Fetch all requested leads from MongoDB
    const leads = await Lead.find({ _id: { $in: leadIds } });
    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: "Selected leads could not be found." }, { status: 404 });
    }

    // Filter valid leads that can be purchased
    const validLeadsToBuy: any[] = [];
    for (const lead of leads) {
      const alreadyUnlocked = lead.unlockedBy.some((id: any) => id.toString() === buyerUserId);
      if (alreadyUnlocked) continue;

      const isExclusive = lead.leadType === "exclusive" || lead.leadType === "verified";
      const maxCapacity = isExclusive ? 1 : (lead.maxBuyers || 4);
      if (lead.unlockedBy.length >= maxCapacity) continue;

      validLeadsToBuy.push(lead);
    }

    if (validLeadsToBuy.length === 0) {
      return NextResponse.json({
        error: "All selected leads are either already unlocked or have reached their maximum buyer capacity."
      }, { status: 400 });
    }

    const totalCost = validLeadsToBuy.reduce((sum, lead) => sum + (lead.price || 49), 0);

    // Fetch or create owner wallet
    let wallet = await Wallet.findOne({ userId: buyerUserId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: buyerUserId, balance: 500 });
    }

    // Validate sufficient wallet balance
    if (wallet.balance < totalCost) {
      return NextResponse.json({
        error: `Insufficient wallet balance for bulk purchase. Required: ₹${totalCost}, Current Balance: ₹${wallet.balance}. Please deposit funds into your wallet.`,
        insufficientFunds: true,
        requiredAmount: totalCost,
        currentBalance: wallet.balance,
        shortage: totalCost - wallet.balance
      }, { status: 400 });
    }

    // Debit wallet atomically
    wallet.balance -= totalCost;
    wallet.totalSpent = (wallet.totalSpent || 0) + totalCost;
    await wallet.save();

    // Unlock leads & create individual transaction records
    for (const lead of validLeadsToBuy) {
      lead.unlockedBy.push(buyerUserId as any);
      if (lead.stage === "new") {
        lead.stage = "contacted";
      }
      await lead.save();

      await Transaction.create({
        userId: buyerUserId,
        type: "debit",
        amount: lead.price || 49,
        description: `Bulk Unlocked Lead: ${lead.tenantName} (${lead.college || lead.area || "Tenant"})`,
        leadId: lead._id,
        status: "success"
      });
    }

    // Optional notification to buyer
    if (buyerPhone) {
      try {
        await sendInstantNotification({
          recipientPhone: buyerPhone,
          message: `Bulk Purchase Successful! You unlocked ${validLeadsToBuy.length} leads for ₹${totalCost}. View all contacts in your Purchased Leads directory.`,
          type: "lead_unlocked"
        });
      } catch (notifyErr) {
        console.error("Bulk notification error:", notifyErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully unlocked ${validLeadsToBuy.length} leads!`,
      unlockedCount: validLeadsToBuy.length,
      totalCost,
      newBalance: wallet.balance,
      unlockedLeadIds: validLeadsToBuy.map((l) => l._id.toString())
    });
  } catch (error: any) {
    console.error("Error executing bulk lead purchase:", error);
    return NextResponse.json({ error: "Failed to process bulk purchase", details: error.message }, { status: 500 });
  }
}
