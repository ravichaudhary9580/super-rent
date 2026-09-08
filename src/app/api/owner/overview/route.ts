import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { Property } from "@/models/Property";
import { Lead } from "@/models/Lead";
import { User } from "@/models/User";
import { Wallet } from "@/models/Wallet";

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

    if (matchingLeadsCount === 0) {
      matchingLeadsCount = totalMarketplaceLeads;
    }

    // 4. High-intent / Direct Leads available (tried to contact / conversion)
    let hotLeadsCount =
      ownerAreas.length > 0
        ? await Lead.countDocuments({
            category: { $in: ["tried_to_contact", "conversion_system"] },
            area: { $in: ownerAreas }
          })
        : await Lead.countDocuments({ category: { $in: ["tried_to_contact", "conversion_system"] } });

    if (hotLeadsCount === 0) {
      hotLeadsCount = await Lead.countDocuments({ category: { $in: ["tried_to_contact", "conversion_system"] } });
    }

    // 5. Leads purchased/unlocked by this owner
    const purchasedLeads = await Lead.countDocuments({ unlockedBy: user._id });

    // 6. Owner Wallet
    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({ userId: user._id, balance: 500 });
    }

    // 7. Recent Purchased / Unlocked Leads (Latest 4)
    const recentPurchasedLeadsDocs = await Lead.find({ unlockedBy: user._id })
      .sort({ updatedAt: -1 })
      .limit(4)
      .lean();

    const propIds = recentPurchasedLeadsDocs
      .map((l: any) => l.propertyId)
      .filter(Boolean);

    const propMap: Record<string, any> = {};
    if (propIds.length > 0) {
      const props = await Property.find(
        { _id: { $in: propIds } },
        "title location rent type"
      ).lean();
      props.forEach((p: any) => {
        propMap[p._id.toString()] = p;
      });
    }

    const recentPurchasedLeads = recentPurchasedLeadsDocs.map((l: any) => ({
      _id: l._id.toString(),
      tenantName: l.tenantName,
      tenantPhone: l.tenantPhone,
      city: l.city || "Greater Noida",
      area: l.area || "",
      college: l.college || "",
      budget: l.budget,
      gender: l.gender,
      moveInTimeline: l.moveInTimeline || "Immediate",
      category: l.category || "signup",
      propertyTitle: l.propertyId ? propMap[l.propertyId.toString()]?.title : undefined,
      price: l.price || 49,
      unlockedAt: l.updatedAt
    }));

    // 8. Recent Properties (Latest 3)
    const recentPropertiesDocs = await Property.find({ ownerId: user._id })
      .sort({ createdAt: -1 })
      .limit(3);

    const recentProperties = recentPropertiesDocs.map((p) => ({
      _id: p._id.toString(),
      title: p.title,
      rent: p.rent,
      location: p.location,
      images: p.images || [],
      status: p.status || "Active",
      type: p.type || "Room"
    }));

    // 9. Category breakdown of purchased leads
    const [cityCount, openedPropertyCount, triedContactCount, conversionCount] = await Promise.all([
      Lead.countDocuments({ unlockedBy: user._id, $or: [{ category: "signup" }, { category: { $exists: false } }] }),
      Lead.countDocuments({ unlockedBy: user._id, category: "opened_property" }),
      Lead.countDocuments({ unlockedBy: user._id, category: "tried_to_contact" }),
      Lead.countDocuments({ unlockedBy: user._id, category: "conversion_system" })
    ]);

    return NextResponse.json({
      success: true,
      user: {
        name: user.name || "Owner",
        phone: user.phone || ""
      },
      stats: {
        activeListings,
        totalProperties,
        totalLeads: matchingLeadsCount,
        hotLeads: hotLeadsCount,
        purchasedLeads,
        walletBalance: wallet.balance,
        totalSpent: wallet.totalSpent || 0
      },
      categoryCounts: {
        city: cityCount,
        opened_property: openedPropertyCount,
        tried_to_contact: triedContactCount,
        conversion_system: conversionCount
      },
      recentPurchasedLeads,
      recentProperties
    });
  } catch (error: any) {
    console.error("Error fetching owner overview:", error);
    return NextResponse.json(
      { error: "Failed to fetch owner stats", details: error.message },
      { status: 500 }
    );
  }
}
