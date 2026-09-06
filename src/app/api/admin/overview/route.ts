import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { Transaction } from "@/models/Transaction";
import { Wallet } from "@/models/Wallet";

export async function GET() {
  try {
    await connectDB();

    const isDbConnected = mongoose.connection.readyState === 1;
    const platformHealth = isDbConnected ? "100% Operational" : "Degraded";

    const [totalUsers, totalTenants, totalOwners, totalProperties, totalLeads, debitTransactions] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "tenant" }),
      User.countDocuments({ role: "owner" }),
      Property.countDocuments({ status: "Active" }),
      Lead.countDocuments(),
      Transaction.find({ type: "debit", status: "success" })
    ]);

    const totalRevenue = debitTransactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        totalTenants,
        totalOwners,
        activeListings: totalProperties,
        totalLeads,
        totalRevenue,
        platformHealth
      }
    });
  } catch (error: any) {
    console.error("Error fetching admin overview stats:", error);
    return NextResponse.json({ error: "Failed to fetch overview stats", details: error.message }, { status: 500 });
  }
}
