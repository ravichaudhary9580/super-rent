import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const sessionUser = session.user as any;
    let user = null;

    if (sessionUser.id) {
      user = await User.findById(sessionUser.id);
    }
    if (!user && sessionUser.phone) {
      user = await User.findOne({ phone: sessionUser.phone });
    }
    if (!user && sessionUser.email) {
      user = await User.findOne({ email: sessionUser.email });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 1. Active Listings & Total Properties for this owner
    const [activeListings, totalProperties] = await Promise.all([
      Property.countDocuments({ ownerId: user._id, status: "Active" }),
      Property.countDocuments({ ownerId: user._id })
    ]);

    // 2. Owner's localities from their properties
    const ownerProps = await Property.find({ ownerId: user._id }, "location");
    const ownerAreas = [
      ...new Set(ownerProps.map((p) => p.location?.area).filter(Boolean))
    ];

    // 3. Marketplace Leads available
    const totalMarketplaceLeads = await Lead.countDocuments();
    let matchingLeadsCount =
      ownerAreas.length > 0
        ? await Lead.countDocuments({ area: { $in: ownerAreas } })
        : totalMarketplaceLeads;

    // Fall back to marketplace count if no area-specific leads yet
    if (matchingLeadsCount === 0) {
      matchingLeadsCount = totalMarketplaceLeads;
    }

    // 4. Hot Leads available
    let hotLeadsCount =
      ownerAreas.length > 0
        ? await Lead.countDocuments({
            temperature: "hot",
            area: { $in: ownerAreas }
          })
        : await Lead.countDocuments({ temperature: "hot" });

    if (hotLeadsCount === 0) {
      hotLeadsCount = await Lead.countDocuments({ temperature: "hot" });
    }

    // 5. Leads purchased/unlocked by this owner
    const purchasedLeads = await Lead.countDocuments({ unlockedBy: user._id });

    return NextResponse.json({
      success: true,
      stats: {
        activeListings,
        totalProperties,
        totalLeads: matchingLeadsCount,
        hotLeads: hotLeadsCount,
        purchasedLeads
      }
    });
  } catch (error: any) {
    console.error("Error fetching owner overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch owner stats", details: error.message },
      { status: 500 }
    );
  }
}
