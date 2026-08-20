import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { Property } from "@/models/Property";

export async function GET() {
  try {
    await connectDB();

    let owners = await User.find({ role: "owner" }).sort({ createdAt: -1 });

    // Enrich owners with wallet balance, spent totals, and property count
    const enrichedOwners = await Promise.all(
      owners.map(async (owner) => {
        const wallet = await Wallet.findOne({ userId: owner._id });
        const propertiesCount = await Property.countDocuments({ ownerId: owner._id });
        const purchasesCount = await Transaction.countDocuments({ userId: owner._id, type: "debit" });

        return {
          id: owner._id.toString(),
          _id: owner._id.toString(),
          name: owner.name,
          email: owner.email,
          phone: owner.phone || "N/A",
          city: owner.city || "New Delhi",
          location: owner.location || "North Campus",
          createdAt: owner.createdAt,
          walletBalance: wallet ? wallet.balance : 500,
          totalSpent: wallet ? wallet.totalSpent : 0,
          propertiesCount: propertiesCount || 1,
          purchasesCount: purchasesCount || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      owners: enrichedOwners
    });
  } catch (error: any) {
    console.error("Error fetching owners for admin:", error);
    return NextResponse.json({ error: "Failed to fetch owners", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerId, amount, note } = await req.json();
    const creditAmount = Number(amount);

    if (!ownerId || isNaN(creditAmount) || creditAmount <= 0) {
      return NextResponse.json({ error: "Valid owner ID and positive amount are required" }, { status: 400 });
    }

    await connectDB();

    let wallet = await Wallet.findOne({ userId: ownerId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: ownerId, balance: 500 });
    }

    wallet.balance += creditAmount;
    await wallet.save();

    await Transaction.create({
      userId: ownerId,
      type: "credit",
      amount: creditAmount,
      description: note || `Admin Manual Wallet Credit (+₹${creditAmount})`,
      razorpayPaymentId: `ADMIN_CREDIT_${Date.now()}`,
      status: "success"
    });

    return NextResponse.json({
      success: true,
      message: `Successfully credited ₹${creditAmount} to owner wallet!`,
      newBalance: wallet.balance
    });
  } catch (error: any) {
    console.error("Error crediting owner wallet:", error);
    return NextResponse.json({ error: "Failed to credit owner wallet", details: error.message }, { status: 500 });
  }
}
