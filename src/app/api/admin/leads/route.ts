import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Lead } from "@/models/Lead";

export async function GET() {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      leads
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
