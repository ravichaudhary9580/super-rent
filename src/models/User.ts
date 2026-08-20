import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  whatsappOptIn?: boolean;
  college?: string;
  city?: string;
  targetCity?: string;
  location?: string;
  occupation?: string;
  gender?: string;
  budget?: string;
  preferredType?: string;
  moveInDate?: string;
  bio?: string;
  emergencyContact?: {
    name?: string;
    phone?: string;
    relation?: string;
  };
  image?: string;
  password?: string;
  role?: "tenant" | "owner" | "admin";
  emailVerified?: Date | null;
  razorpayCustomerId?: string;
  savedProperties?: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true }, // Populated when the user verifies OTP
    whatsappOptIn: { type: Boolean, default: true },
    college: { type: String, default: "" },
    city: { type: String, default: "" },
    targetCity: { type: String, default: "" },
    location: { type: String, default: "" },
    occupation: { type: String, default: "Student" },
    gender: { type: String, default: "" },
    budget: { type: String, default: "" },
    preferredType: { type: String, default: "Any" },
    moveInDate: { type: String, default: "" },
    bio: { type: String, default: "" },
    emergencyContact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      relation: { type: String, default: "" }
    },
    image: { type: String, default: "" },
    password: { type: String },
    role: { type: String, enum: ["tenant", "owner", "admin"] },
    emailVerified: { type: Date, default: null },
    razorpayCustomerId: { type: String },
    savedProperties: [{ type: Schema.Types.ObjectId, ref: "Property" }]
  },
  { timestamps: true, strict: false }
);

if (process.env.NODE_ENV !== "production") {
  delete (mongoose.models as any).User;
}

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

