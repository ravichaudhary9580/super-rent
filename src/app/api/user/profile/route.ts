import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { deleteFromS3 } from "@/lib/s3";

// GET: Fetch current user profile
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({
      $or: [
        { _id: (session.user as any).id },
        { phone: (session.user as any).phone },
        { email: session.user.email }
      ].filter(Boolean)
    }).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error: any) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Failed to fetch profile", details: error.message }, { status: 500 });
  }
}

// PUT: Update current user profile
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      email,
      city,
      targetCity,
      location,
      college,
      occupation,
      gender,
      budget,
      preferredType,
      moveInDate,
      bio,
      whatsappOptIn,
      emergencyContact,
      image
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
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

    const updateData: any = {
      name: name.trim()
    };

    if (email !== undefined) updateData.email = email.trim();
    if (city !== undefined) updateData.city = city.trim();
    if (targetCity !== undefined) updateData.targetCity = targetCity.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (college !== undefined) updateData.college = college.trim();
    if (occupation !== undefined) updateData.occupation = occupation.trim();
    if (gender !== undefined) updateData.gender = gender;
    if (budget !== undefined) updateData.budget = budget.trim();
    if (preferredType !== undefined) updateData.preferredType = preferredType;
    if (moveInDate !== undefined) updateData.moveInDate = moveInDate;
    if (bio !== undefined) updateData.bio = bio.trim();
    if (whatsappOptIn !== undefined) updateData.whatsappOptIn = Boolean(whatsappOptIn);

    // Automatic S3 Cleanup: If avatar changed, delete the old avatar from S3
    if (image && user.image && user.image !== image && user.image.includes("amazonaws.com")) {
      try {
        const oldUrl = new URL(user.image);
        const oldKey = oldUrl.pathname.replace(/^\/+/, "");
        if (oldKey) {
          await deleteFromS3(oldKey);
        }
      } catch (err) {
        console.warn("Could not delete old avatar from S3:", err);
      }
    }

    if (image !== undefined) updateData.image = image;

    if (emergencyContact) {
      updateData.emergencyContact = {
        name: emergencyContact.name?.trim() || "",
        phone: emergencyContact.phone?.trim() || "",
        relation: emergencyContact.relation?.trim() || ""
      };
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { $set: updateData },
      { new: true, runValidators: false }
    ).select("-password");

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Failed to update profile", details: error.message }, { status: 500 });
  }
}
