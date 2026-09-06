import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local for MONGODB_URI
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  try {
    const envPath = path.resolve(__dirname, "../.env.local");
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed.startsWith("MONGODB_URI=")) {
        mongoUri = trimmed.split("=")[1].replace(/["']/g, "");
      }
    }
  } catch (err) {
    console.error("Could not read .env.local", err);
  }
}

if (!mongoUri) {
  console.error("MONGODB_URI not found!");
  process.exit(1);
}

const LeadSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tenantName: { type: String, required: true, default: "Prospective Tenant" },
    tenantPhone: { type: String },
    college: { type: String, default: "Nearby College" },
    area: { type: String, default: "North Campus" },
    budget: { type: Number, default: 12000 },
    gender: { type: String, enum: ["male", "female", "any"], default: "any" },
    moveInTimeline: { type: String, default: "Within 15 days" },
    leadType: {
      type: String,
      enum: ["shared", "exclusive", "verified", "pay_per_booking"],
      default: "shared",
      required: true
    },
    temperature: { type: String, enum: ["hot", "warm", "cold"], default: "hot", required: true },
    price: { type: Number, required: true, default: 49 },
    maxBuyers: { type: Number, default: 4 },
    unlockedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isVerified: { type: Boolean, default: false },
    verificationNotes: { type: String },
    stage: {
      type: String,
      enum: ["new", "contacted", "verified", "converted", "booked"],
      default: "new"
    }
  },
  { timestamps: true }
);

const Lead = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);

const sampleLeads = [
  // 1. Sharda University - Verified Hot Lead
  {
    tenantName: "Aarav Mehra",
    tenantPhone: "+91 98112 34567",
    college: "Sharda University (B.Tech CSE)",
    area: "Knowledge Park III",
    budget: 11000,
    gender: "male",
    moveInTimeline: "Immediate (Within 2 days)",
    leadType: "verified",
    temperature: "hot",
    price: 499,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Parent verified. Looking for single/twin AC hostel room with 4 meals and high-speed WiFi near KP 3.",
    stage: "verified"
  },
  // 2. Galgotias University - Exclusive Hot Lead
  {
    tenantName: "Ananya Sharma",
    tenantPhone: "+91 98765 89012",
    college: "Galgotias University (MBA)",
    area: "Knowledge Park II",
    budget: 14000,
    gender: "female",
    moveInTimeline: "Within 5 days",
    leadType: "exclusive",
    temperature: "hot",
    price: 249,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Looking for premium girls PG with 3-tier security, attached washroom, and food.",
    stage: "new"
  },
  // 3. GL Bajaj - Shared Hot Lead
  {
    tenantName: "Rohan Varma & Friend",
    tenantPhone: "+91 97123 45678",
    college: "GL Bajaj Institute (B.Tech IT)",
    area: "Knowledge Park III",
    budget: 8500,
    gender: "male",
    moveInTimeline: "Immediate",
    leadType: "shared",
    temperature: "hot",
    price: 49,
    maxBuyers: 4,
    unlockedBy: [],
    isVerified: false,
    stage: "new"
  },
  // 4. TechZone 4 Working Professional - Exclusive Lead
  {
    tenantName: "Kunal Singhal",
    tenantPhone: "+91 99580 12345",
    college: "Corporate Professional (Tech Mahindra)",
    area: "TechZone 4",
    budget: 16000,
    gender: "male",
    moveInTimeline: "Within 10 days",
    leadType: "exclusive",
    temperature: "warm",
    price: 249,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Senior software engineer shifting from Bengaluru. Requires fully-furnished 1BHK/studio with 200Mbps WiFi and power backup.",
    stage: "verified"
  },
  // 5. Bennett University - Verified Lead
  {
    tenantName: "Sneha Nair",
    tenantPhone: "+91 98450 67890",
    college: "Bennett University (BBA LLB)",
    area: "Pari Chowk",
    budget: 13500,
    gender: "female",
    moveInTimeline: "Within 7 days",
    leadType: "verified",
    temperature: "hot",
    price: 499,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Called student & father. Budget approved up to ₹15k. Wants single AC room with metro transit shuttle.",
    stage: "verified"
  },
  // 6. Alpha 1 - Shared Lead
  {
    tenantName: "Aditya Prakash",
    tenantPhone: "+91 91234 56780",
    college: "NIET (MCA)",
    area: "Alpha 1",
    budget: 7500,
    gender: "male",
    moveInTimeline: "Within 15 days",
    leadType: "shared",
    temperature: "warm",
    price: 49,
    maxBuyers: 4,
    unlockedBy: [],
    isVerified: false,
    stage: "new"
  },
  // 7. Gamma 2 - Pay-Per-Booking Lead
  {
    tenantName: "Dr. Priyanshu & Neha Mishra",
    tenantPhone: "+91 98991 22334",
    college: "Doctors at Yatharth Super Speciality Hospital",
    area: "Gamma 2",
    budget: 24000,
    gender: "any",
    moveInTimeline: "1st of next month",
    leadType: "pay_per_booking",
    temperature: "hot",
    price: 20000,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Doctor couple seeking premium 2BHK gated society flat near Yatharth Hospital / Pari Chowk. Long term 2-year lease intent.",
    stage: "verified"
  },
  // 8. Beta 1 - Shared Lead
  {
    tenantName: "Deepak Choudhary",
    tenantPhone: "+91 96543 21098",
    college: "ITS Engineering College",
    area: "Beta 1",
    budget: 6500,
    gender: "male",
    moveInTimeline: "Immediate",
    leadType: "shared",
    temperature: "hot",
    price: 49,
    maxBuyers: 4,
    unlockedBy: [],
    isVerified: false,
    stage: "new"
  },
  // 9. Delta 1 - Verified Girls PG Lead
  {
    tenantName: "Pooja Hegde & Ritu Roy",
    tenantPhone: "+91 97890 12345",
    college: "Gautam Buddha University (Biotech)",
    area: "Delta 1",
    budget: 9000,
    gender: "female",
    moveInTimeline: "Within 5 days",
    leadType: "verified",
    temperature: "hot",
    price: 499,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Two female students looking for twin-sharing room in safe girls PG near Delta 1 metro station.",
    stage: "verified"
  },
  // 10. Knowledge Park I - Shared Lead
  {
    tenantName: "Vikas Patel",
    tenantPhone: "+91 94120 54321",
    college: "NIET Greater Noida (Mechanical)",
    area: "Knowledge Park I",
    budget: 8000,
    gender: "male",
    moveInTimeline: "Within 10 days",
    leadType: "shared",
    temperature: "warm",
    price: 49,
    maxBuyers: 4,
    unlockedBy: [],
    isVerified: false,
    stage: "new"
  },
  // 11. Zeta 1 - Exclusive Studio Apartment
  {
    tenantName: "Rishabh Malhotra",
    tenantPhone: "+91 98109 87654",
    college: "IT Consultant (Adobe Noida)",
    area: "Zeta 1",
    budget: 18000,
    gender: "male",
    moveInTimeline: "Immediate (Within 3 days)",
    leadType: "exclusive",
    temperature: "hot",
    price: 249,
    maxBuyers: 1,
    unlockedBy: [],
    isVerified: true,
    verificationNotes: "Ready to pay token immediately for a fully-furnished 1BHK in AVJ Heights or similar society.",
    stage: "new"
  },
  // 12. Knowledge Park II - Shared Lead
  {
    tenantName: "Tanmay Bansal",
    tenantPhone: "+91 98231 45670",
    college: "Sharda School of Business",
    area: "Knowledge Park II",
    budget: 9500,
    gender: "male",
    moveInTimeline: "Within 12 days",
    leadType: "shared",
    temperature: "warm",
    price: 49,
    maxBuyers: 4,
    unlockedBy: [],
    isVerified: false,
    stage: "new"
  }
];

async function runSeed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully!");

    // Clear existing leads or seed new ones
    console.log("Clearing previous sample leads...");
    await Lead.deleteMany({});

    console.log(`Inserting ${sampleLeads.length} leads...`);
    const result = await Lead.insertMany(sampleLeads);

    console.log(`\nSuccessfully seeded ${result.length} leads into the database!`);
    console.log("Sample lead breakdown:");
    console.log("- Shared Leads (₹49):", result.filter(l => l.leadType === "shared").length);
    console.log("- Exclusive Leads (₹249):", result.filter(l => l.leadType === "exclusive").length);
    console.log("- Verified Leads (₹499):", result.filter(l => l.leadType === "verified").length);
    console.log("- Pay-Per-Booking Leads:", result.filter(l => l.leadType === "pay_per_booking").length);

    await mongoose.disconnect();
    console.log("\nDatabase connection closed. Seeding complete.");
  } catch (error) {
    console.error("Error seeding leads:", error);
    process.exit(1);
  }
}

runSeed();
