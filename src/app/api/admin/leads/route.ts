import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Transaction } from "@/models/Transaction";
import { Property } from "@/models/Property";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Ensure models are registered for populate
    if (!User || !Transaction || !Property) {}

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const city = searchParams.get("city");
    const leadType = searchParams.get("leadType");
    const isVerified = searchParams.get("isVerified");
    const stage = searchParams.get("stage");
    const timeframe = searchParams.get("timeframe");

    const query: any = {};

    if (category && category !== "all") {
      if (category === "purchased") {
        query["unlockedBy.0"] = { $exists: true };
      } else {
        query.category = category;
      }
    }

    if (city && city !== "all") {
      query.city = { $regex: city.trim(), $options: "i" };
    }

    if (leadType && leadType !== "all") {
      query.leadType = leadType;
    }

    if (isVerified === "true") {
      query.isVerified = true;
    } else if (isVerified === "false") {
      query.isVerified = false;
    }

    if (stage && stage !== "all") {
      query.stage = stage;
    }

    if (timeframe && timeframe !== "all") {
      const now = new Date();
      if (timeframe === "today") {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query.createdAt = { $gte: startOfDay };
      } else if (timeframe === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: weekAgo };
      } else if (timeframe === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query.createdAt = { $gte: monthAgo };
      }
    }

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .populate("propertyId", "title location price type images")
      .populate("ownerId", "name phone email")
      .populate("unlockedBy", "name phone email role city location createdAt image");

    // Fetch related transactions for unlock timestamps and amount paid
    const leadIds = leads.map((l) => l._id);
    const transactions = await Transaction.find({
      leadId: { $in: leadIds },
      type: "debit",
      status: "success"
    }).lean();

    const enrichedLeads = leads.map((l) => {
      const leadObj = l.toObject();
      const leadTxs = transactions.filter(
        (t: any) => t.leadId && t.leadId.toString() === leadObj._id.toString()
      );

      const unlockedOwners = (leadObj.unlockedBy || []).map((owner: any) => {
        if (owner && typeof owner === "object" && owner._id) {
          const ownerTx = leadTxs.find(
            (t: any) => t.userId && t.userId.toString() === owner._id.toString()
          );
          return {
            _id: owner._id,
            name: owner.name || "Owner",
            phone: owner.phone || "",
            email: owner.email || "",
            role: owner.role || "owner",
            city: owner.city || "Greater Noida",
            location: owner.location || "",
            unlockedAt: ownerTx ? ownerTx.createdAt : owner.createdAt,
            amountPaid: ownerTx ? ownerTx.amount : (leadObj.price || 49),
            transactionId: ownerTx ? ownerTx._id : undefined
          };
        }
        return owner;
      });

      leadObj.unlockedOwners = unlockedOwners;
      return leadObj;
    });

    // Also get distinct cities and stats
    const [distinctCities, totalLeadsCount, unlockedLeadsCount] = await Promise.all([
      Lead.distinct("city"),
      Lead.countDocuments(),
      Lead.countDocuments({ "unlockedBy.0": { $exists: true } })
    ]);

    return NextResponse.json({
      success: true,
      leads: enrichedLeads,
      cities: distinctCities.filter(Boolean),
      stats: {
        total: totalLeadsCount,
        unlocked: unlockedLeadsCount,
        filtered: leads.length
      }
    });
  } catch (error: any) {
    console.error("Error fetching admin leads:", error);
    return NextResponse.json({ error: "Failed to fetch admin leads" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { leadId, isVerified, leadType, stage, verificationNotes, price } = await req.json();

    if (!leadId) {
      return NextResponse.json({ error: "Lead ID is required" }, { status: 400 });
    }

    await connectDB();

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    if (isVerified !== undefined) lead.isVerified = isVerified;
    if (leadType !== undefined) {
      lead.leadType = leadType;
      lead.maxBuyers = leadType === "exclusive" || leadType === "verified" ? 1 : 4;
    }
    if (stage !== undefined) lead.stage = stage;
    if (verificationNotes !== undefined) lead.verificationNotes = verificationNotes;
    if (price !== undefined) lead.price = Number(price);

    await lead.save();

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead
    });
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return NextResponse.json({ error: "Failed to update lead" }, { status: 500 });
  }
}
