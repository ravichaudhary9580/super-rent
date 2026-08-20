import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongoose";
import { Property } from "@/models/Property";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const city = searchParams.get("city");
    const search = searchParams.get("search");
    const ownerOnly = searchParams.get("ownerOnly");
    const status = searchParams.get("status");

    const query: any = {};

    if (ownerOnly === "true") {
      const session = await getServerSession();
      const userId = (session?.user as any)?.id;
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      query.ownerId = userId;
    } else if (!status) {
      query.status = "Active";
    } else if (status !== "all") {
      query.status = status;
    }

    if (type && type !== "All") {
      query.type = type;
    }

    if (city && city !== "All") {
      query["location.city"] = { $regex: city, $options: "i" };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { "location.area": { $regex: search, $options: "i" } },
        { "location.city": { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const properties = await Property.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      properties
    });
  } catch (error: any) {
    console.error("Error fetching properties:", error);
    return NextResponse.json({ error: "Failed to fetch properties", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { title, description, type, price, location, amenities, images } = body;

    if (!title || !type || !price || !location?.city || !location?.area) {
      return NextResponse.json({ error: "Missing required property fields" }, { status: 400 });
    }

    const property = await Property.create({
      ownerId: userId,
      title,
      description: description || "",
      type,
      price: Number(price),
      location: {
        city: location.city,
        area: location.area,
        fullAddress: location.fullAddress || `${location.area}, ${location.city}`
      },
      amenities: amenities || [],
      images: images || [],
      status: "Active"
    });

    return NextResponse.json({
      success: true,
      property
    });
  } catch (error: any) {
    console.error("Error creating property:", error);
    return NextResponse.json({ error: "Failed to create property", details: error.message }, { status: 500 });
  }
}
