import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongoose";
import { Lead } from "@/models/Lead";
import { SystemSettings } from "@/models/SystemSettings";
import { getMatchingLeads, getPriceForType } from "@/lib/distributionEngine";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    const buyerUserId = (session?.user as any)?.id;

    const { searchParams } = new URL(req.url);
    const leadType = searchParams.get("leadType") as any;
    const area = searchParams.get("area") || undefined;
    const college = searchParams.get("college") || undefined;
    const maxBudget = searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : undefined;

    const leads = await getMatchingLeads({
      leadType: leadType || undefined,
      area,
      college,
      maxBudget,
      buyerUserId
    });

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { tenantName, tenantPhone, college, area, budget, gender, moveInTimeline, leadType, temperature } = body;

    if (!tenantName || !tenantPhone) {
      return NextResponse.json({ error: "Tenant name and phone are required" }, { status: 400 });
    }

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    const type = leadType || "shared";
    const maxBuyers = type === "exclusive" || type === "verified" ? 1 : 4;
    const price = getPriceForType(type, settings);

    const lead = await Lead.create({
      tenantName,
      tenantPhone,
      college: college || "Nearby College",
      area: area || "North Campus",
      budget: budget || 12000,
      gender: gender || "any",
      moveInTimeline: moveInTimeline || "Within 15 days",
      leadType: type,
      temperature: temperature || "hot",
      price,
      maxBuyers,
      unlockedBy: [],
      isVerified: type === "verified",
      stage: type === "verified" ? "verified" : "new"
    });

    return NextResponse.json({ success: true, lead });
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return NextResponse.json({ error: "Failed to create lead", details: error.message }, { status: 500 });
  }
}
