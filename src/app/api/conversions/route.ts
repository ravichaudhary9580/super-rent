import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/models/User";
import { ConversionRequest } from "@/models/ConversionRequest";
import { Lead } from "@/models/Lead";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectDB();

    // Look up dbUser
    let dbUser = null;
    const sessionUser = session.user as any;
    if (sessionUser.id && mongoose.Types.ObjectId.isValid(sessionUser.id)) {
      dbUser = await User.findById(sessionUser.id);
    }
    if (!dbUser && sessionUser.phone) {
      dbUser = await User.findOne({ phone: sessionUser.phone });
    }
    if (!dbUser && sessionUser.email) {
      dbUser = await User.findOne({ email: sessionUser.email });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 });
    }

    const isOwner = dbUser.role === "owner";
    const isAdmin = dbUser.role === "admin";

    const query: any = {};
    if (isOwner && !isAdmin) {
      query.ownerId = dbUser._id;
    }

    const conversions = await ConversionRequest.find(query)
      .sort({ createdAt: -1 })
      .populate("propertyId", "title location price city area furnishing images")
      .populate("ownerId", "name phone email");

    const total = conversions.length;
    const pending = conversions.filter((c) => c.status === "pending").length;
    const inProgress = conversions.filter(
      (c) => c.status === "assigned" || c.status === "in_progress"
    ).length;
    const visitScheduled = conversions.filter((c) => c.status === "visit_scheduled").length;
    const converted = conversions.filter((c) => c.status === "converted").length;

    return NextResponse.json({
      success: true,
      conversions,
      stats: {
        total,
        pending,
        inProgress,
        visitScheduled,
        converted
      }
    });
  } catch (error: any) {
    console.error("Error fetching conversion requests:", error);
    return NextResponse.json({ error: "Failed to fetch conversions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectDB();

    let dbUser = null;
    const sessionUser = session.user as any;
    if (sessionUser.id && mongoose.Types.ObjectId.isValid(sessionUser.id)) {
      dbUser = await User.findById(sessionUser.id);
    }
    if (!dbUser && sessionUser.phone) {
      dbUser = await User.findOne({ phone: sessionUser.phone });
    }
    if (!dbUser && sessionUser.email) {
      dbUser = await User.findOne({ email: sessionUser.email });
    }

    if (!dbUser) {
      return NextResponse.json({ error: "Owner account not found." }, { status: 404 });
    }

    const body = await req.json();
    const {
      tenantName,
      tenantPhone,
      propertyId,
      leadId,
      city,
      area,
      budget,
      moveInTimeline,
      ownerNotes
    } = body;

    if (!tenantName || !tenantPhone) {
      return NextResponse.json(
        { error: "Tenant name and contact number are required." },
        { status: 400 }
      );
    }

    // 1. Create Conversion Request
    const newConversion = await ConversionRequest.create({
      ownerId: dbUser._id,
      leadId: leadId && mongoose.Types.ObjectId.isValid(leadId) ? leadId : undefined,
      propertyId: propertyId && mongoose.Types.ObjectId.isValid(propertyId) ? propertyId : undefined,
      tenantName: tenantName.trim(),
      tenantPhone: tenantPhone.trim(),
      city: city || "Greater Noida",
      area: area || "",
      budget: Number(budget) || 0,
      moveInTimeline: moveInTimeline || "Immediate",
      ownerNotes: ownerNotes || "",
      status: "pending"
    });

    // 2. Also register / mirror as an assisted conversion Lead in the database so admin leads oversight tracks it
    try {
      await Lead.create({
        ownerId: dbUser._id,
        propertyId: propertyId && mongoose.Types.ObjectId.isValid(propertyId) ? propertyId : undefined,
        tenantName: tenantName.trim(),
        tenantPhone: tenantPhone.trim(),
        city: city || "Greater Noida",
        area: area || "",
        budget: Number(budget) || 12000,
        category: "conversion_system",
        leadType: "exclusive",
        stage: "new",
        price: 0,
        verificationNotes: `Assisted Conversion Request by Owner ${dbUser.name || dbUser.phone}: ${ownerNotes || "Please contact for site visit"}`
      });
    } catch (leadErr) {
      console.warn("Notice: Mirrored lead creation skipped or handled:", leadErr);
    }

    const populated = await ConversionRequest.findById(newConversion._id)
      .populate("propertyId", "title location price city area furnishing images")
      .populate("ownerId", "name phone email");

    return NextResponse.json({
      success: true,
      message: "Lead submitted to Provider App sales team for assisted conversion!",
      conversion: populated
    });
  } catch (error: any) {
    console.error("Error creating conversion request:", error);
    return NextResponse.json({ error: "Failed to submit conversion request." }, { status: 500 });
  }
}
