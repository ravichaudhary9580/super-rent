import mongoose, { Schema, Document } from "mongoose";

export interface IProperty extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: "Hostel" | "PG" | "Room" | "Flat";
  price: number;
  location: {
    city: string;
    area: string;
    fullAddress: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  status: "Pending" | "Active" | "Rejected";
}

const PropertySchema = new Schema<IProperty>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, enum: ["Hostel", "PG", "Room", "Flat"], required: true },
    price: { type: Number, required: true },
    location: {
      city: { type: String, required: true },
      area: { type: String, required: true },
      fullAddress: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    status: { type: String, enum: ["Pending", "Active", "Rejected"], default: "Pending" }
  },
  { timestamps: true }
);

export const Property = mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);
