import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";
import { Lead } from "@/models/Lead";
import { SystemSettings } from "@/models/SystemSettings";
import { calculateDynamicLeadPrice } from "@/lib/pricingEngine";

import { Wallet } from "@/models/Wallet";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      role, 
      phone, 
      otp, 
      city, 
      location, 
      college, 
      budget, 
      gender,
      name,
      businessName,
      hostelName,
      propertyType,
      capacity,
      alternatePhone
    } = await req.json();

    if (!role || !["tenant", "owner"].includes(role)) {
      return NextResponse.json({ error: "Valid role is required" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ 
      $or: [
        { _id: (session.user as any).id },
        { phone: (session.user as any).phone },
        { email: session.user.email }
      ].filter(Boolean)
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If the user does not have a phone number attached yet, verify OTP
    if (!user.phone) {
      if (!phone || !otp) {
        return NextResponse.json({ error: "Phone and OTP are required for new accounts" }, { status: 400 });
      }

      // Format phone number to E.164 format (default to +91 for 10-digit Indian numbers)
      let formattedPhone = phone.trim();
      if (!formattedPhone.startsWith("+")) {
        const digitsOnly = formattedPhone.replace(/\D/g, "");
        if (digitsOnly.length === 10) {
          formattedPhone = `+91${digitsOnly}`;
        }
      }

      // Check if another account already uses this phone number
      const existingPhoneUser = await User.findOne({
        phone: formattedPhone,
        _id: { $ne: user._id }
      });

      if (existingPhoneUser) {
        return NextResponse.json(
          { error: "An account with this phone number already exists." },
          { status: 400 }
        );
      }

      // Verify OTP
      const validOtp = await Otp.findOne({ phone: formattedPhone, code: otp });
      if (!validOtp) {
        return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
      }

      // Delete OTP
      await Otp.deleteOne({ _id: validOtp._id });
      user.phone = formattedPhone;
    }

    user.role = role;

    // If owner, save property business details, mark onboarding completed, and ensure wallet
    if (role === "owner") {
      if (name && name.trim()) user.name = name.trim();
      if (city) {
        user.city = city.trim();
        user.targetCity = city.trim();
      }
      if (location) user.location = location.trim();
      if (businessName || hostelName) {
        const bName = (businessName || hostelName).trim();
        user.businessName = bName;
        user.hostelName = bName;
      }
      if (propertyType) user.propertyType = propertyType.trim();
      if (capacity) user.capacity = capacity.trim();
      if (alternatePhone && alternatePhone.trim()) {
        user.emergencyContact = {
          phone: alternatePhone.trim(),
          relation: "Alternate Contact"
        };
      }
      user.onboardingCompleted = true;

      // Ensure owner wallet is initialized with welcome credits
      let wallet = await Wallet.findOne({ userId: user._id });
      if (!wallet) {
        wallet = await Wallet.create({ userId: user._id, balance: 500, totalSpent: 0 });
      }
    }

    // If tenant, save questionnaire preferences and automatically register as a lead
    if (role === "tenant") {
      if (city) {
        user.city = city.trim();
        user.targetCity = city.trim();
      }
      if (location) user.location = location.trim();
      if (college) user.college = college.trim();
      if (budget) user.budget = budget.toString();
      if (gender) user.gender = gender;
      user.onboardingCompleted = true;

      // Query current pricing settings for signup lead
      let settings = await SystemSettings.findOne();
      if (!settings) {
        settings = await SystemSettings.create({});
      }

      const targetCity = city?.trim() || user.targetCity || user.city || "Greater Noida";
      const targetArea = location?.trim() || user.location || "Knowledge Park";
      const leadCollege = college?.trim() || user.college || "";
      const leadBudget = Number(budget) || 12000;
      const leadGender = gender || user.gender || "any";

      const leadPrice = calculateDynamicLeadPrice({
        category: "signup",
        tenantPhone: user.phone,
        city: targetCity,
        area: targetArea,
        college: leadCollege,
        budget: leadBudget,
        gender: leadGender,
        leadType: "shared"
      }, settings).finalPrice;

      // Register or update tenant as a Signup Lead in MongoDB
      await Lead.findOneAndUpdate(
        { tenantId: user._id, category: "signup" },
        {
          tenantId: user._id,
          tenantName: user.name,
          tenantPhone: user.phone,
          city: targetCity,
          area: targetArea,
          college: leadCollege,
          budget: leadBudget,
          gender: leadGender,
          category: "signup",
          leadType: "shared",
          price: leadPrice,
          stage: "new"
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: "Onboarding complete",
      role: user.role
    });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
