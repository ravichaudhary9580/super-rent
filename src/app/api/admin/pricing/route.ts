import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { SystemSettings } from "@/models/SystemSettings";
import { Lead } from "@/models/Lead";
import { DEFAULT_PRICING_ENGINE, calculateDynamicLeadPrice } from "@/lib/pricingEngine";

export async function GET() {
  try {
    await connectDB();
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({
        pricingEngine: DEFAULT_PRICING_ENGINE
      });
    }

    const pricingEngine = settings.pricingEngine || {
      ...DEFAULT_PRICING_ENGINE,
      signup: {
        ...DEFAULT_PRICING_ENGINE.signup,
        basePrice: settings.signupLeadPrice ?? 39
      },
      opened_property: {
        ...DEFAULT_PRICING_ENGINE.opened_property,
        basePrice: settings.openedPropertyLeadPrice ?? 79
      },
      tried_to_contact: {
        ...DEFAULT_PRICING_ENGINE.tried_to_contact,
        basePrice: settings.contactAttemptLeadPrice ?? 169
      },
      conversion_system: {
        ...DEFAULT_PRICING_ENGINE.conversion_system,
        basePrice: settings.conversionSystemPrice ?? 429
      }
    };

    return NextResponse.json({
      success: true,
      settings: {
        signupLeadPrice: settings.signupLeadPrice ?? 49,
        openedPropertyLeadPrice: settings.openedPropertyLeadPrice ?? 99,
        contactAttemptLeadPrice: settings.contactAttemptLeadPrice ?? 199,
        conversionSystemPrice: settings.conversionSystemPrice ?? 499,
        sharedLeadPrice: settings.sharedLeadPrice ?? 49,
        exclusiveLeadPrice: settings.exclusiveLeadPrice ?? 249,
        verifiedLeadPrice: settings.verifiedLeadPrice ?? 499,
        payPerBookingCommission: settings.payPerBookingCommission ?? 20000,
        pricingEngine
      }
    });
  } catch (error: any) {
    console.error("Error fetching pricing settings:", error);
    return NextResponse.json({ error: "Failed to fetch pricing settings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const adminUserId = (session?.user as any)?.id;

    const body = await req.json();
    await connectDB();

    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings({});
    }

    // Action: Recalculate and update prices on all existing leads in the database
    if (body.action === "recalculate_leads") {
      const allLeads = await Lead.find();
      let updatedCount = 0;

      for (const lead of allLeads) {
        const calc = calculateDynamicLeadPrice(lead, settings);
        if (lead.price !== calc.finalPrice) {
          lead.price = calc.finalPrice;
          await lead.save();
          updatedCount++;
        }
      }

      return NextResponse.json({
        success: true,
        message: `Successfully recalculated and updated prices for ${updatedCount} leads.`,
        totalLeads: allLeads.length,
        updatedCount
      });
    }

    const {
      pricingEngine,
      signupLeadPrice,
      openedPropertyLeadPrice,
      contactAttemptLeadPrice,
      conversionSystemPrice,
      sharedLeadPrice,
      exclusiveLeadPrice,
      verifiedLeadPrice,
      payPerBookingCommission
    } = body;

    if (pricingEngine) {
      settings.pricingEngine = pricingEngine;

      // Sync legacy scalar base prices
      if (pricingEngine.signup?.basePrice !== undefined) {
        settings.signupLeadPrice = Number(pricingEngine.signup.basePrice);
      }
      if (pricingEngine.opened_property?.basePrice !== undefined) {
        settings.openedPropertyLeadPrice = Number(pricingEngine.opened_property.basePrice);
      }
      if (pricingEngine.tried_to_contact?.basePrice !== undefined) {
        settings.contactAttemptLeadPrice = Number(pricingEngine.tried_to_contact.basePrice);
      }
      if (pricingEngine.conversion_system?.basePrice !== undefined) {
        settings.conversionSystemPrice = Number(pricingEngine.conversion_system.basePrice);
      }
    }

    if (signupLeadPrice !== undefined) settings.signupLeadPrice = Number(signupLeadPrice);
    if (openedPropertyLeadPrice !== undefined) settings.openedPropertyLeadPrice = Number(openedPropertyLeadPrice);
    if (contactAttemptLeadPrice !== undefined) settings.contactAttemptLeadPrice = Number(contactAttemptLeadPrice);
    if (conversionSystemPrice !== undefined) settings.conversionSystemPrice = Number(conversionSystemPrice);

    if (sharedLeadPrice !== undefined) settings.sharedLeadPrice = Number(sharedLeadPrice);
    if (exclusiveLeadPrice !== undefined) settings.exclusiveLeadPrice = Number(exclusiveLeadPrice);
    if (verifiedLeadPrice !== undefined) settings.verifiedLeadPrice = Number(verifiedLeadPrice);
    if (payPerBookingCommission !== undefined) settings.payPerBookingCommission = Number(payPerBookingCommission);

    if (adminUserId) settings.updatedBy = adminUserId as any;

    await settings.save();

    return NextResponse.json({
      success: true,
      message: "Lead pricing engine configuration updated successfully!",
      settings
    });
  } catch (error: any) {
    console.error("Error updating pricing settings:", error);
    return NextResponse.json({ error: "Failed to update pricing settings" }, { status: 500 });
  }
}
