import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongoose";
import { SystemSettings } from "@/models/SystemSettings";

export async function GET() {
  try {
    await connectDB();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    return NextResponse.json({
      success: true,
      settings: {
        sharedLeadPrice: settings.sharedLeadPrice || 49,
        exclusiveLeadPrice: settings.exclusiveLeadPrice || 249,
        verifiedLeadPrice: settings.verifiedLeadPrice || 499,
        payPerBookingCommission: settings.payPerBookingCommission || 20000
      }
    });
  } catch (error: any) {
    console.error("Error fetching pricing settings:", error);
    return NextResponse.json({ error: "Failed to fetch pricing settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const adminUserId = (session?.user as any)?.id;

    const { sharedLeadPrice, exclusiveLeadPrice, verifiedLeadPrice, payPerBookingCommission } = await req.json();

    await connectDB();

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    if (sharedLeadPrice !== undefined) settings.sharedLeadPrice = Number(sharedLeadPrice);
    if (exclusiveLeadPrice !== undefined) settings.exclusiveLeadPrice = Number(exclusiveLeadPrice);
    if (verifiedLeadPrice !== undefined) settings.verifiedLeadPrice = Number(verifiedLeadPrice);
    if (payPerBookingCommission !== undefined) settings.payPerBookingCommission = Number(payPerBookingCommission);
    if (adminUserId) settings.updatedBy = adminUserId as any;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Lead pricing configuration updated successfully!",
      settings
    });
  } catch (error: any) {
    console.error("Error updating pricing settings:", error);
    return NextResponse.json({ error: "Failed to update pricing settings" }, { status: 500 });
  }
}
