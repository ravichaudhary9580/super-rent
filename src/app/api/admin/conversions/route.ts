import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { User } from "@/models/User";
import { ConversionRequest } from "@/models/ConversionRequest";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const query: any = {};
    if (status && status !== "all") {
      query.status = status;
    }

    let conversions = await ConversionRequest.find(query)
      .sort({ createdAt: -1 })
      .populate("propertyId", "title location price city area furnishing")
      .populate("ownerId", "name phone email");

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      conversions = conversions.filter((c: any) => {
        return (
          c.tenantName?.toLowerCase().includes(q) ||
          c.tenantPhone?.toLowerCase().includes(q) ||
          c.ownerId?.name?.toLowerCase().includes(q) ||
          c.ownerId?.phone?.toLowerCase().includes(q) ||
          c.city?.toLowerCase().includes(q) ||
          c.area?.toLowerCase().includes(q) ||
          c.propertyId?.title?.toLowerCase().includes(q)
        );
      });
    }

    return NextResponse.json({
      success: true,
      conversions
    });
  } catch (error: any) {
    console.error("Error fetching admin conversions:", error);
    return NextResponse.json({ error: "Failed to fetch admin conversions." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { id, status, salesAgentName, adminNotes } = body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Valid Conversion Request ID is required." }, { status: 400 });
    }

    const conversion = await ConversionRequest.findById(id);
    if (!conversion) {
      return NextResponse.json({ error: "Conversion request not found." }, { status: 404 });
    }

    if (status !== undefined) {
      conversion.status = status;
      if (status === "in_progress" || status === "visit_scheduled" || status === "converted") {
        conversion.lastContactedAt = new Date();
      }
    }
    if (salesAgentName !== undefined) conversion.salesAgentName = salesAgentName;
    if (adminNotes !== undefined) conversion.adminNotes = adminNotes;

    await conversion.save();

    const updated = await ConversionRequest.findById(id)
      .populate("propertyId", "title location price city area furnishing")
      .populate("ownerId", "name phone email");

    return NextResponse.json({
      success: true,
      message: "Conversion request updated successfully.",
      conversion: updated
    });
  } catch (error: any) {
    console.error("Error updating conversion request:", error);
    return NextResponse.json({ error: "Failed to update conversion request." }, { status: 500 });
  }
}
