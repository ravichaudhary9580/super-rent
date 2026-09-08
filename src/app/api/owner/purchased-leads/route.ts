import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as an owner." }, { status: 401 });
    }

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
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";

    // Leads where the current owner is recorded in unlockedBy array
    const baseQuery: any = {
      unlockedBy: dbUser._id
    };

    const allPurchased = await Lead.find(baseQuery)
      .sort({ updatedAt: -1, createdAt: -1 })
      .populate("propertyId", "title location price type images");

    const counts = {
      all: allPurchased.length,
      city: allPurchased.filter((l) => l.category === "signup" || !l.category).length,
      opened_property: allPurchased.filter((l) => l.category === "opened_property").length,
      tried_to_contact: allPurchased.filter((l) => l.category === "tried_to_contact").length,
      conversion_system: allPurchased.filter((l) => l.category === "conversion_system").length,
    };

    let filteredLeads = allPurchased;
    if (category !== "all") {
      if (category === "city") {
        filteredLeads = allPurchased.filter((l) => l.category === "signup" || !l.category);
      } else {
        filteredLeads = allPurchased.filter((l) => l.category === category);
      }
    }

    const formattedLeads = filteredLeads.map((lead) => ({
      _id: lead._id.toString(),
      tenantName: lead.tenantName,
      tenantPhone: lead.tenantPhone,
      city: lead.city || "Greater Noida",
      area: lead.area || "North Campus",
      college: lead.college || "General Tenant",
      budget: lead.budget || 12000,
      gender: lead.gender || "any",
      moveInTimeline: lead.moveInTimeline || "Immediate",
      category: lead.category || "signup",
      leadType: lead.leadType || "shared",
      price: lead.price || 49,
      stage: lead.stage || "contacted",
      property: lead.propertyId || null,
      unlockedAt: lead.updatedAt || lead.createdAt,
      createdAt: lead.createdAt
    }));

    return NextResponse.json({
      success: true,
      leads: formattedLeads,
      counts
    });
  } catch (error: any) {
    console.error("Error fetching purchased leads:", error);
    return NextResponse.json(
      { error: "Failed to fetch purchased leads", details: error.message },
      { status: 500 }
    );
  }
}
