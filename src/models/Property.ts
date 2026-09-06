import mongoose, { Schema, Document } from "mongoose";

export interface IRoomPricing {
  seater: string;
  acPrice?: number | null;
  nonAcPrice?: number | null;
}

export interface IProperty extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: "Hostel" | "PG" | "Room" | "Flat";
  price: number;
  pricingCycle?: "Monthly" | "Annually";
  deposit?: number;
  maintenance?: string;
  noticePeriod?: string;
  genderPreference?: "Boys" | "Girls" | "Coliving" | "Anyone" | "Family";
  occupancy?: string;
  sharingOptions?: string[];
  roomPricings?: IRoomPricing[];
  furnishing?: "Fully Furnished" | "Semi-Furnished" | "Unfurnished";
  foodIncluded?: string;
  availableFrom?: string;
  contactPhone?: string;
  rules?: string[];
  location: {
    city: string;
    area: string;
    fullAddress: string;
    pincode?: string;
    nearbyLandmark?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  amenities: string[];
  images: string[];
  status: "Pending" | "Active" | "Rejected" | "Inactive";
}

const PropertySchema = new Schema<IProperty>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["Hostel", "PG", "Room", "Flat"], required: true },
    price: { type: Number, required: true },
    pricingCycle: { type: String, enum: ["Monthly", "Annually"], default: "Monthly" },
    deposit: { type: Number, default: 0 },
    maintenance: { type: String, default: "Included" },
    noticePeriod: { type: String, default: "1 Month" },
    genderPreference: { 
      type: String, 
      enum: ["Boys", "Girls", "Coliving", "Anyone", "Family"], 
      default: "Anyone" 
    },
    occupancy: { type: String, default: "Single / Sharing" },
    sharingOptions: [{ type: String }],
    roomPricings: [
      {
        seater: { type: String },
        acPrice: { type: Number, default: null },
        nonAcPrice: { type: Number, default: null },
      }
    ],
    furnishing: { 
      type: String, 
      enum: ["Fully Furnished", "Semi-Furnished", "Unfurnished"], 
      default: "Fully Furnished" 
    },
    foodIncluded: { type: String, default: "Optional" },
    availableFrom: { type: String, default: "Immediately" },
    contactPhone: { type: String },
    rules: [{ type: String }],
    location: {
      city: { type: String, required: true },
      area: { type: String, required: true },
      fullAddress: { type: String, required: true },
      pincode: { type: String },
      nearbyLandmark: { type: String },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number }
      }
    },
    amenities: [{ type: String }],
    images: [{ type: String }],
    status: { 
      type: String, 
      enum: ["Pending", "Active", "Rejected", "Inactive"], 
      default: "Pending" 
    }
  },
  { timestamps: true }
);

export const Property = mongoose.models.Property || mongoose.model<IProperty>("Property", PropertySchema);

