import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Otp } from "@/models/Otp";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, phone, otp } = await req.json();

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
    await user.save();

    return NextResponse.json({ success: true, message: "Onboarding complete" });
  } catch (error: any) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
