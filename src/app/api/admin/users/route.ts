import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const query: any = {};
    if (role && role !== "all") {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      users: users.map(u => ({
        id: u._id.toString(),
        _id: u._id.toString(),
        name: u.name || "Unnamed User",
        email: u.email || "No email",
        phone: u.phone || "No phone",
        role: u.role || "tenant",
        createdAt: u.createdAt || new Date(),
        image: u.image || ""
      }))
    });
  } catch (error: any) {
    console.error("Error fetching users for admin:", error);
    return NextResponse.json({ error: "Failed to fetch users", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "User ID and new role are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.role = role;
    await user.save();

    return NextResponse.json({
      success: true,
      message: `Role updated to ${role} successfully`,
      user
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Failed to update user", details: error.message }, { status: 500 });
  }
}
