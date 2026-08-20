import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { Property } from "@/models/Property";
import { User } from "@/models/User";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const { id } = params;

    let property = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(id).populate("ownerId", "name phone email");
    }

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      property
    });
  } catch (error: any) {
    console.error("Error fetching property detail:", error);
    return NextResponse.json({ error: "Failed to fetch property details" }, { status: 500 });
  }
}
