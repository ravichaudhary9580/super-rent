import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { Property } from "@/models/Property";
import { User } from "@/models/User";

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
      const session = await getServerSession(authOptions);
      if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const dbUser = await User.findOne({
        $or: [
          { _id: (session.user as any).id },
          { phone: (session.user as any).phone },
          { email: session.user.email }
        ].filter(Boolean)
      });

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 401 });
      }

      query.ownerId = dbUser._id;
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
        { "location.nearbyLandmark": { $regex: search, $options: "i" } },
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
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectDB();

    const dbUser = await User.findOne({
      $or: [
        { _id: (session.user as any).id },
        { phone: (session.user as any).phone },
        { email: session.user.email }
      ].filter(Boolean)
    });

    if (!dbUser) {
      return NextResponse.json({ error: "Owner profile not found. Please re-login." }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      type,
      price,
      pricingCycle,
      deposit,
      maintenance,
      noticePeriod,
      genderPreference,
      occupancy,
      sharingOptions,
      roomPricings,
      furnishing,
      foodIncluded,
      availableFrom,
      contactPhone,
      rules,
      location,
      amenities,
      images,
      status
    } = body;

    if (!title?.trim() || !type || !price || !location?.city?.trim() || !location?.area?.trim()) {
      return NextResponse.json({ error: "Missing required property fields (Title, Type, Rent, City, Area)" }, { status: 400 });
    }

    const resolvedSharingOptions = Array.isArray(sharingOptions) && sharingOptions.length > 0
      ? sharingOptions.filter((s: any) => typeof s === "string" && s.trim())
      : (occupancy ? [occupancy.trim()] : []);

    const resolvedRoomPricings = Array.isArray(roomPricings)
      ? roomPricings
          .map((rp: any) => ({
            seater: String(rp.seater || "").trim(),
            acPrice: rp.acPrice !== undefined && rp.acPrice !== null && rp.acPrice !== "" && !isNaN(Number(rp.acPrice)) ? Number(rp.acPrice) : null,
            nonAcPrice: rp.nonAcPrice !== undefined && rp.nonAcPrice !== null && rp.nonAcPrice !== "" && !isNaN(Number(rp.nonAcPrice)) ? Number(rp.nonAcPrice) : null,
          }))
          .filter((rp: any) => rp.seater && (rp.acPrice !== null || rp.nonAcPrice !== null))
      : [];

    const property = await Property.create({
      ownerId: dbUser._id,
      title: title.trim(),
      description: description?.trim() || "",
      type,
      price: Number(price),
      pricingCycle: pricingCycle || (type === "Hostel" ? "Annually" : "Monthly"),
      deposit: deposit ? Number(deposit) : 0,
      maintenance: maintenance?.trim() || "Included",
      noticePeriod: noticePeriod?.trim() || "1 Month",
      genderPreference: genderPreference || "Anyone",
      occupancy: occupancy?.trim() || (resolvedSharingOptions.length > 0 ? resolvedSharingOptions.join(", ") : "Single / Sharing"),
      sharingOptions: resolvedSharingOptions,
      roomPricings: resolvedRoomPricings,
      furnishing: furnishing || "Fully Furnished",
      foodIncluded: foodIncluded || "Optional",
      availableFrom: availableFrom?.trim() || "Immediately",
      contactPhone: contactPhone?.trim() || dbUser.phone || "",
      rules: Array.isArray(rules) ? rules.filter((r: any) => typeof r === "string" && r.trim()) : [],
      location: {
        city: location.city.trim(),
        area: location.area.trim(),
        fullAddress: location.fullAddress?.trim() || `${location.area.trim()}, ${location.city.trim()}`,
        pincode: location.pincode?.trim() || "",
        nearbyLandmark: location.nearbyLandmark?.trim() || "",
        coordinates: location.coordinates || undefined
      },
      amenities: Array.isArray(amenities) ? amenities.filter((a: any) => typeof a === "string" && a.trim()) : [],
      images: Array.isArray(images) ? images.filter((img: any) => typeof img === "string" && img.trim()) : [],
      status: dbUser.role === "admin" && status ? status : "Pending"
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

