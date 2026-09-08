import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";
import { Transaction } from "@/models/Transaction";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const url = new URL(req.url);
    const ownerId = url.searchParams.get("ownerId");

    // Deep Inspection for Single Owner Profile Modal
    if (ownerId) {
      const owner = await User.findById(ownerId).select("-password");
      if (!owner) {
        return NextResponse.json({ error: "Owner account not found" }, { status: 404 });
      }

      const wallet = await Wallet.findOne({ userId: owner._id });
      const properties = await Property.find({ ownerId: owner._id }).sort({ createdAt: -1 });
      const purchasedLeads = await Lead.find({ unlockedBy: owner._id })
        .populate("propertyId", "title price location")
        .sort({ createdAt: -1 });
      const transactions = await Transaction.find({ userId: owner._id }).sort({ createdAt: -1 });

      return NextResponse.json({
        success: true,
        owner: {
          id: owner._id.toString(),
          _id: owner._id.toString(),
          name: owner.name,
          email: owner.email,
          phone: owner.phone || "N/A",
          city: owner.city || "New Delhi",
          location: owner.location || "North Campus",
          businessName: owner.businessName || owner.hostelName || "",
          hostelName: owner.hostelName || owner.businessName || "",
          propertyType: owner.propertyType || "Hostel",
          capacity: owner.capacity || "",
          createdAt: owner.createdAt,
          walletBalance: wallet ? wallet.balance : 500,
          totalSpent: wallet ? wallet.totalSpent : 0,
          propertiesCount: properties.length,
          purchasesCount: purchasedLeads.length
        },
        properties,
        purchasedLeads,
        transactions
      });
    }

    // List all owners with enriched statistics
    const owners = await User.find({ role: "owner" }).sort({ createdAt: -1 });

    const enrichedOwners = await Promise.all(
      owners.map(async (owner) => {
        const wallet = await Wallet.findOne({ userId: owner._id });
        const propertiesCount = await Property.countDocuments({ ownerId: owner._id });
        const leadsCount = await Lead.countDocuments({ unlockedBy: owner._id });
        const latestTx = await Transaction.findOne({ userId: owner._id }).sort({ createdAt: -1 });

        return {
          id: owner._id.toString(),
          _id: owner._id.toString(),
          name: owner.name,
          email: owner.email,
          phone: owner.phone || "N/A",
          city: owner.city || "New Delhi",
          location: owner.location || "North Campus",
          businessName: owner.businessName || owner.hostelName || "",
          hostelName: owner.hostelName || owner.businessName || "",
          propertyType: owner.propertyType || "Hostel",
          capacity: owner.capacity || "",
          createdAt: owner.createdAt,
          walletBalance: wallet ? wallet.balance : 500,
          totalSpent: wallet ? wallet.totalSpent : 0,
          propertiesCount: propertiesCount || 0,
          purchasesCount: leadsCount || 0,
          lastActivityAt: latestTx ? latestTx.createdAt : owner.createdAt
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
    const body = await req.json();
    const { ownerId, amount, action = "credit", note } = body;
    const adjustAmount = Number(amount);

    if (!ownerId || isNaN(adjustAmount) || adjustAmount <= 0) {
      return NextResponse.json({ error: "Valid owner ID and a positive amount are required" }, { status: 400 });
    }

    await connectDB();

    let wallet = await Wallet.findOne({ userId: ownerId });
    if (!wallet) {
      wallet = await Wallet.create({ userId: ownerId, balance: 500, totalSpent: 0 });
    }

    if (action === "debit") {
      if (wallet.balance < adjustAmount) {
        return NextResponse.json(
          { error: `Insufficient wallet balance. Current balance is ₹${wallet.balance}.` },
          { status: 400 }
        );
      }
      wallet.balance -= adjustAmount;
      await wallet.save();

      await Transaction.create({
        userId: ownerId,
        type: "debit",
        amount: adjustAmount,
        description: note || `Admin Manual Wallet Deduction (-₹${adjustAmount})`,
        razorpayPaymentId: `ADMIN_DEBIT_${Date.now()}`,
        status: "success"
      });

      return NextResponse.json({
        success: true,
        message: `Successfully deducted ₹${adjustAmount} from owner wallet!`,
        newBalance: wallet.balance
      });
    } else {
      // Default: Credit
      wallet.balance += adjustAmount;
      await wallet.save();

      await Transaction.create({
        userId: ownerId,
        type: "credit",
        amount: adjustAmount,
        description: note || `Admin Manual Wallet Credit (+₹${adjustAmount})`,
        razorpayPaymentId: `ADMIN_CREDIT_${Date.now()}`,
        status: "success"
      });

      return NextResponse.json({
        success: true,
        message: `Successfully credited ₹${adjustAmount} to owner wallet!`,
        newBalance: wallet.balance
      });
    }
  } catch (error: any) {
    console.error("Error adjusting owner wallet:", error);
    return NextResponse.json({ error: "Failed to adjust owner wallet", details: error.message }, { status: 500 });
  }
}
