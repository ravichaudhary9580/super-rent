import { NextRequest, NextResponse } from "next/server";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import connectDB from "@/lib/mongoose";
import { Otp } from "@/models/Otp";
import { User } from "@/models/User";

const snsClient = new SNSClient({
  region: process.env.REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID || "",
    secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
  }
});

export async function POST(req: NextRequest) {
  try {
    const { phone, mode } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    // Format phone number to E.164 (defaults 10-digit Indian numbers to +91)
    let formattedPhone = phone.trim();
    if (!formattedPhone.startsWith("+")) {
      const digitsOnly = formattedPhone.replace(/\D/g, "");
      if (digitsOnly.length === 10) {
        formattedPhone = `+91${digitsOnly}`;
      }
    }

    await connectDB();

    // Block sign-in if the user has no account (login mode only)
    if (mode === "login") {
      const existingUser = await User.findOne({
        $or: [{ phone: formattedPhone }, { phone: phone.trim() }],
      });
      if (!existingUser) {
        return NextResponse.json(
          { error: "No account found for this number. Please sign up first." },
          { status: 404 }
        );
      }
    }

    // Generate a 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Atomically upsert: create or overwrite the OTP for this phone in one operation.
    // We explicitly set createdAt so the 5-min TTL resets on every resend.
    await Otp.findOneAndUpdate(
      { phone: formattedPhone },
      { phone: formattedPhone, code, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Send via AWS SNS
    let smsSent = false;
    if (process.env.ACCESS_KEY_ID && process.env.SECRET_ACCESS_KEY) {
      try {
        const command = new PublishCommand({
          Message: `Your SuperRent verification code is: ${code}. Valid for 5 minutes.`,
          PhoneNumber: formattedPhone,
          // IMPORTANT: Must be "Transactional" for OTPs sent to Indian (+91) numbers.
          // "Promotional" SMS is blocked by Indian carriers for numbers registered on DND.
          MessageAttributes: {
            "AWS.SNS.SMS.SMSType": {
              DataType: "String",
              StringValue: "Transactional",
            },
            "AWS.SNS.SMS.SenderID": {
              DataType: "String",
              StringValue: "SUPRENT", // Up to 11 chars, alphanumeric
            },
          },
        });
        const snsResult = await snsClient.send(command);
        smsSent = true;
        console.log(`[SNS] SMS sent to ${formattedPhone}, MessageId: ${snsResult.MessageId}`);
      } catch (awsError: any) {
        console.error(`[SNS ERROR] ${awsError.name}: ${awsError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      smsSent,
      message: smsSent ? "OTP sent via SMS" : "OTP generated successfully",
      formattedPhone
    });
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP", details: error.message }, { status: 500 });
  }
}
