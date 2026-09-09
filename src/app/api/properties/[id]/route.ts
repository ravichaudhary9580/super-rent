import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { Property } from "@/models/Property";
import { User } from "@/models/User";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    let property = null;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      property = await Property.findById(id).populate("ownerId", "name phone email businessName hostelName image");
    }

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // If property is not active, only owner or admin can view it
    if (property.status && property.status !== "Active") {
      const session = await getServerSession(authOptions);
      const isOwner = session?.user && (
        (session.user as any).id === property.ownerId?._id?.toString() ||
        (session.user as any).id === property.ownerId?.toString() ||
        session.user.email === property.ownerId?.email
      );
      const isAdmin = (session?.user as any)?.role === "admin";
      if (!isOwner && !isAdmin) {
        return NextResponse.json(
          { error: "This listing is currently pending approval and is not yet publicly visible." },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      property
    });
  } catch (error: any) {
    console.error("Error fetching property detail:", error);
    return NextResponse.json({ error: "Failed to fetch property details", details: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const sessionUser = session.user as any;
    const userOrClauses: any[] = [];
    if (sessionUser.id) userOrClauses.push({ _id: sessionUser.id });
    if (sessionUser.phone) userOrClauses.push({ phone: sessionUser.phone });
    if (session.user.email) userOrClauses.push({ email: session.user.email });

    if (userOrClauses.length === 0) {
      return NextResponse.json({ error: "Invalid session user" }, { status: 401 });
    }

    const dbUser = await User.findOne({ $or: userOrClauses });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Check authorization: Owner or Admin
    const isOwner = property.ownerId?.toString() === dbUser._id.toString();
    const isAdmin = dbUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    const body = await req.json();

    if (body.title !== undefined) property.title = body.title.trim();
    if (body.description !== undefined) property.description = body.description.trim();
    if (body.type !== undefined) property.type = body.type;
    if (body.price !== undefined && !isNaN(Number(body.price))) property.price = Number(body.price);
    if (body.pricingCycle !== undefined) property.pricingCycle = body.pricingCycle;
    if (body.deposit !== undefined && !isNaN(Number(body.deposit))) property.deposit = Number(body.deposit);
    if (body.maintenance !== undefined) property.maintenance = String(body.maintenance).trim();
    if (body.noticePeriod !== undefined) property.noticePeriod = String(body.noticePeriod).trim();
    if (body.genderPreference !== undefined) property.genderPreference = body.genderPreference;
    if (body.furnishing !== undefined) property.furnishing = body.furnishing;
    if (body.occupancy !== undefined) property.occupancy = String(body.occupancy).trim();
    if (body.contactPhone !== undefined) property.contactPhone = String(body.contactPhone).trim();

    if (Array.isArray(body.sharingOptions)) {
      property.sharingOptions = body.sharingOptions.filter((s: any) => typeof s === "string" && s.trim());
      if (!body.occupancy && property.sharingOptions.length > 0) {
        property.occupancy = property.sharingOptions.join(", ");
      }
    }

    if (Array.isArray(body.roomPricings)) {
      property.roomPricings = body.roomPricings
        .map((rp: any) => ({
          seater: String(rp.seater || "").trim(),
          acPrice: rp.acPrice !== undefined && rp.acPrice !== null && rp.acPrice !== "" && !isNaN(Number(rp.acPrice)) ? Number(rp.acPrice) : null,
          nonAcPrice: rp.nonAcPrice !== undefined && rp.nonAcPrice !== null && rp.nonAcPrice !== "" && !isNaN(Number(rp.nonAcPrice)) ? Number(rp.nonAcPrice) : null,
        }))
        .filter((rp: any) => rp.seater && (rp.acPrice !== null || rp.nonAcPrice !== null));
    }

    if (body.foodIncluded !== undefined) property.foodIncluded = body.foodIncluded;
    if (body.availableFrom !== undefined) property.availableFrom = String(body.availableFrom).trim();

    // Status control: Owner cannot choose listing status; only Admin can set status
    if (isAdmin && body.status !== undefined) {
      property.status = body.status;
    } else if (isOwner && property.status === "Rejected") {
      // When an owner updates a rejected listing, automatically move it back to Pending for admin re-evaluation
      property.status = "Pending";
    }

    if (Array.isArray(body.rules)) {
      property.rules = body.rules.filter((r: any) => typeof r === "string" && r.trim());
    }

    if (Array.isArray(body.amenities)) {
      property.amenities = body.amenities.filter((a: any) => typeof a === "string" && a.trim());
    }

    if (Array.isArray(body.images)) {
      property.images = body.images.filter((img: any) => typeof img === "string" && img.trim());
    }

    if (body.location) {
      const updatedLocation: any = {
        city: body.location.city !== undefined ? body.location.city.trim() : (property.location?.city || ""),
        area: body.location.area !== undefined ? body.location.area.trim() : (property.location?.area || ""),
        fullAddress: body.location.fullAddress !== undefined ? body.location.fullAddress.trim() : (property.location?.fullAddress || ""),
      };

      if (body.location.pincode !== undefined) {
        updatedLocation.pincode = body.location.pincode.trim();
      } else if (property.location?.pincode) {
        updatedLocation.pincode = property.location.pincode;
      }

      if (body.location.nearbyLandmark !== undefined) {
        updatedLocation.nearbyLandmark = body.location.nearbyLandmark.trim();
      } else if (property.location?.nearbyLandmark) {
        updatedLocation.nearbyLandmark = property.location.nearbyLandmark;
      }

      if (
        body.location.coordinates &&
        body.location.coordinates.lat !== undefined &&
        body.location.coordinates.lng !== undefined &&
        !isNaN(Number(body.location.coordinates.lat)) &&
        !isNaN(Number(body.location.coordinates.lng))
      ) {
        updatedLocation.coordinates = {
          lat: Number(body.location.coordinates.lat),
          lng: Number(body.location.coordinates.lng),
        };
      } else if (
        property.location?.coordinates?.lat !== undefined &&
        property.location?.coordinates?.lng !== undefined
      ) {
        updatedLocation.coordinates = property.location.coordinates;
      }

      property.location = updatedLocation;
    }

    await property.save();

    return NextResponse.json({
      success: true,
      property
    });
  } catch (error: any) {
    console.error("Error updating property:", error);
    return NextResponse.json({ error: "Failed to update property", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    await connectDB();
    const { id } = await params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return NextResponse.json({ error: "Invalid property ID" }, { status: 400 });
    }

    const sessionUser = session.user as any;
    const userOrClauses: any[] = [];
    if (sessionUser.id) userOrClauses.push({ _id: sessionUser.id });
    if (sessionUser.phone) userOrClauses.push({ phone: sessionUser.phone });
    if (session.user.email) userOrClauses.push({ email: session.user.email });

    if (userOrClauses.length === 0) {
      return NextResponse.json({ error: "Invalid session user" }, { status: 401 });
    }

    const dbUser = await User.findOne({ $or: userOrClauses });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    const property = await Property.findById(id);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    const isOwner = property.ownerId?.toString() === dbUser._id.toString();
    const isAdmin = dbUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: You do not own this property" }, { status: 403 });
    }

    await Property.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Property deleted successfully"
    });
  } catch (error: any) {
    console.error("Error deleting property:", error);
    return NextResponse.json({ error: "Failed to delete property", details: error.message }, { status: 500 });
  }
}

