import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";

export async function GET() {
  return seedAdminUser();
}

export async function POST() {
  return seedAdminUser();
}

async function seedAdminUser() {
  try {
    await connectDB();

    const adminPhone = "+919999999999";
    const adminEmail = "admin@superrent.com";
    const adminPassword = "admin123";

    let admin = await User.findOne({
      $or: [{ role: "admin" }, { phone: adminPhone }, { email: adminEmail }]
    });

    if (admin) {
      admin.role = "admin";
      admin.name = admin.name || "Super Admin";
      admin.phone = admin.phone || adminPhone;
      admin.email = admin.email || adminEmail;
      admin.password = adminPassword;
      await admin.save();

      return NextResponse.json({
        success: true,
        message: "Super Admin account verified and password updated!",
        admin: {
          id: admin._id,
          name: admin.name,
          phone: admin.phone,
          email: admin.email,
          role: admin.role,
          defaultPassword: adminPassword
        }
      });
    }

    // Create new Super Admin user with password
    admin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      phone: adminPhone,
      password: adminPassword,
      role: "admin"
    });

    return NextResponse.json({
      success: true,
      message: "Super Admin account created successfully!",
      admin: {
        id: admin._id,
        name: admin.name,
        phone: admin.phone,
        email: admin.email,
        role: admin.role,
        defaultPassword: adminPassword
      }
    });
  } catch (error: any) {
    console.error("Admin seed error:", error);
    return NextResponse.json({ error: "Failed to seed admin user", details: error.message }, { status: 500 });
  }
}
