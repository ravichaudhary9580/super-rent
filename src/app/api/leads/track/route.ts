import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { SystemSettings } from "@/models/SystemSettings";
import { calculateDynamicLeadPrice } from "@/lib/pricingEngine";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { propertyId, action } = await req.json();

    if (!propertyId) {
      return NextResponse.json({ error: "propertyId is required" }, { status: 400 });
    }

    if (!["view", "contact", "conversion"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    await connectDB();

    const sessionUser = session.user as any;
    const user = await User.findOne({
      $or: [
        { _id: sessionUser.id },
        { phone: sessionUser.phone },
        { email: sessionUser.email }
      ].filter(Boolean)
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    // Load pricing settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    let category: "opened_property" | "tried_to_contact" | "conversion_system" = "opened_property";
    let stage: "new" | "contacted" | "verified" | "converted" | "booked" = "new";
    let note = `Viewed property "${property.title}"`;

    if (action === "contact") {
      category = "tried_to_contact";
      stage = "contacted";
      note = `Clicked 'Contact Owner Now' for property "${property.title}"`;
    } else if (action === "conversion") {
      category = "conversion_system";
      stage = "verified";
      note = `Requested Assisted Conversion / Booking for property "${property.title}"`;
    }

    const city =
      user.targetCity ||
      user.city ||
      (typeof property.location === "object" ? property.location?.city : property.city) ||
      "Greater Noida";

    const area =
      user.location ||
      (typeof property.location === "object" ? property.location?.area : property.location) ||
      "Campus Hub";

    const leadBudget = Number(user.budget) || property.price || 12000;
    const isLeadVerified = action === "conversion" || action === "contact";

    const price = calculateDynamicLeadPrice({
      category,
      tenantPhone: user.phone,
      college: user.college,
      city,
      area,
      budget: leadBudget,
      gender: user.gender || "any",
      propertyId: property._id,
      isVerified: isLeadVerified
    }, settings).finalPrice;

    // Priority ranking to prevent lower action from downgrading a higher action
    const categoryPriority: Record<string, number> = {
      signup: 1,
      opened_property: 2,
      tried_to_contact: 3,
      conversion_system: 4
    };

    // Find existing lead for this tenant on this property
    let lead = await Lead.findOne({
      tenantId: user._id,
      propertyId: property._id
    });

    if (lead) {
      const currentPriority = categoryPriority[lead.category || "opened_property"] || 2;
      const newPriority = categoryPriority[category] || 2;

      // Update lead if it's the same property or upgrading priority
      if (newPriority >= currentPriority) {
        lead.category = category;
        lead.price = price;
        lead.stage = stage;
        lead.verificationNotes = note;
      }

      lead.ownerId = property.ownerId;
      lead.city = city;
      lead.area = area;
      if (!lead.tenantPhone && user.phone) lead.tenantPhone = user.phone;
      if (!lead.tenantName && user.name) lead.tenantName = user.name;
      await lead.save();
    } else {
      // Create new lead linked to this property and owner
      lead = await Lead.create({
        tenantId: user._id,
        propertyId: property._id,
        ownerId: property.ownerId,
        tenantName: user.name || "Prospective Tenant",
        tenantPhone: user.phone || "+91 98000 00000",
        city,
        area,
        college: user.college || "",
        budget: Number(user.budget) || property.price || 12000,
        gender: user.gender || "any",
        category,
        leadType: "exclusive",
        price,
        maxBuyers: 1,
        unlockedBy: [],
        isVerified: action === "conversion" || action === "contact",
        verificationNotes: note,
        stage
      });
    }

    return NextResponse.json({ success: true, leadId: lead._id, category: lead.category });
  } catch (error: any) {
    console.error("Error in /api/leads/track:", error);
    return NextResponse.json(
      { error: "Failed to track lead action", details: error.message },
      { status: 500 }
    );
  }
}
