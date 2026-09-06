import { NextResponse } from "next/server";
import connectDB from "@/lib/mongoose";
import { User } from "@/models/User";
import { Property } from "@/models/Property";
import { Wallet } from "@/models/Wallet";

export async function GET() {
  try {
    await connectDB();

    // 1. Find or Create Test Owner
    let owner = await User.findOne({ phone: "6677889900" });

    if (!owner) {
      owner = await User.create({
        name: "Vikram Sharma (GN Hostels & Residences)",
        phone: "6677889900",
        email: "owner.gn@superrent.in",
        role: "owner",
        city: "Greater Noida",
        targetCity: "Greater Noida",
        occupation: "Property Owner & Manager",
        bio: "Managing premium verified student & executive PG residences across Knowledge Park, Pari Chowk, and Alpha/Beta/Gamma sectors in Greater Noida.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
        whatsappOptIn: true
      });
    } else {
      owner.role = "owner";
      owner.city = "Greater Noida";
      owner.targetCity = "Greater Noida";
      if (!owner.name || owner.name === "User") {
        owner.name = "Vikram Sharma (GN Hostels & Residences)";
      }
      await owner.save();
    }

    // Ensure wallet exists for owner
    const existingWallet = await Wallet.findOne({ userId: owner._id });
    if (!existingWallet) {
      await Wallet.create({
        userId: owner._id,
        balance: 2500
      });
    }

    // 2. Clear previous Greater Noida test properties for clean idempotency
    await Property.deleteMany({
      ownerId: owner._id,
      "location.city": "Greater Noida"
    });

    // 3. Define 10 Detailed Properties in Greater Noida with High Quality Real Photos
    const sampleProperties = [
      {
        ownerId: owner._id,
        title: "Stanza Living Alpha Heights - Luxury Boys Hostel",
        description: "Modern, fully managed student hostel located 5 mins from Sharda University and Galgotias. Features spacious AC rooms, 4 nutritious chef-prepared meals daily, high-speed fiber internet, biometric security, professional daily housekeeping, and gaming lounge.",
        type: "Hostel",
        price: 9500,
        location: {
          city: "Greater Noida",
          area: "Knowledge Park II",
          fullAddress: "Plot 14, Knowledge Park II, Near Sharda University, Greater Noida, UP 201310",
          coordinates: { lat: 28.4728, lng: 77.4891 }
        },
        amenities: [
          "AC & Geyser",
          "High-Speed Fiber WiFi",
          "4 Meals Daily (North & South Indian)",
          "Daily Housekeeping",
          "Biometric Access & CCTV",
          "Power Backup (24x7)",
          "Attached Washroom",
          "Laundry & Ironing Service",
          "Study Table & Locker Almirah"
        ],
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Ivy League Elite Girls Residency & Hostel",
        description: "Premium, secure, and vibrant girls residency near GL Bajaj & Bennett University transit. 3-tier security with female wardens, biometric entry, hygienic buffet meals, AC rooms with dedicated study workstations, and medical on-call assistance.",
        type: "Hostel",
        price: 11000,
        location: {
          city: "Greater Noida",
          area: "Knowledge Park III",
          fullAddress: "Plot 8A, Knowledge Park III, Opposite GL Bajaj Institute, Greater Noida, UP 201306",
          coordinates: { lat: 28.4619, lng: 77.4983 }
        },
        amenities: [
          "AC & Water Heater",
          "3-Tier Biometric Security & 24/7 CCTV",
          "Buffet Meals (Breakfast, Lunch, Snacks, Dinner)",
          "High-Speed WiFi",
          "Fitness Center & Yoga Lawn",
          "Full Power Backup",
          "Laundry Service",
          "Medical First Aid & On-call Doctor"
        ],
        images: [
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "The Urban Nest Co-Living PG (Unisex)",
        description: "A trendy co-living community for students and young working professionals. Walking distance to Pari Chowk Metro Station. Private and twin-sharing rooms available with high-speed WiFi, modern common cafeteria, and zero brokerage.",
        type: "PG",
        price: 8500,
        location: {
          city: "Greater Noida",
          area: "Pari Chowk",
          fullAddress: "Near Pari Chowk Metro Station Gate 2, Sector Alpha 1, Greater Noida, UP 201308",
          coordinates: { lat: 28.4744, lng: 77.5132 }
        },
        amenities: [
          "Air Conditioned",
          "Superfast 200 Mbps WiFi",
          "RO Drinking Water",
          "Refrigerator & Microwave in Common Area",
          "24/7 Power Backup",
          "Keycard Digital Door Locks",
          "Regular Housekeeping"
        ],
        images: [
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Greenwood Luxury 1BHK Studio Apartment",
        description: "Exquisite fully-furnished studio apartment in Alpha 1 commercial belt. Comes with private kitchenette, modular wardrobes, smart LED TV, private balcony overlooking green park, and dedicated covered car parking.",
        type: "Flat",
        price: 15500,
        location: {
          city: "Greater Noida",
          area: "Alpha 1",
          fullAddress: "Block B, Near Commercial Belt & Metro, Alpha 1, Greater Noida, UP 201308",
          coordinates: { lat: 28.4772, lng: 77.5186 }
        },
        amenities: [
          "Private Kitchenette with Induction",
          "1.5 Ton Split AC",
          "Smart Android LED TV",
          "Private Balcony",
          "Covered Parking Space",
          "High-Speed Fiber Internet",
          "Lift & 100% Power Backup",
          "Gated Society Security"
        ],
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Scholar's Haven Budget Boys PG",
        description: "Clean, budget-friendly PG accommodation with home-style Indian food. 2 minutes walk from Beta 1 market and auto stand. Ideal for college students looking for quiet study atmosphere.",
        type: "PG",
        price: 6500,
        location: {
          city: "Greater Noida",
          area: "Beta 1",
          fullAddress: "C-Block, Beta 1, Near Shopping Complex, Greater Noida, UP 201308",
          coordinates: { lat: 28.4812, lng: 77.5094 }
        },
        amenities: [
          "Homely 3 Meals Daily",
          "Desert Cooler / Optional AC",
          "WiFi Connection",
          "Daily Room Cleaning",
          "Personal Locker & Study Desk",
          "Washing Machine Access",
          "24/7 Running Water & Geyser"
        ],
        images: [
          "https://images.unsplash.com/photo-1540518614846-7ede433c4550?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Skyline Residency 2BHK Furnished Apartment",
        description: "Spacious 2BHK flat in a premium high-rise society in Gamma 2 near City Park. Features 2 large bedrooms with attached bathrooms, fully equipped modular kitchen, swimming pool, clubhouse, and 24/7 security.",
        type: "Flat",
        price: 22000,
        location: {
          city: "Greater Noida",
          area: "Gamma 2",
          fullAddress: "Tower 4, Skyline Enclave, Near City Park, Gamma 2, Greater Noida, UP 201308",
          coordinates: { lat: 28.4891, lng: 77.5142 }
        },
        amenities: [
          "Fully Furnished 2 Bedrooms",
          "Modular Kitchen with Chimney & RO",
          "2 Split AC Units",
          "Swimming Pool & Gymnasium",
          "Gated Society with 24/7 Guards",
          "Dual Balconies with Green View",
          "Full Power Backup"
        ],
        images: [
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Campus Edge Premium Girls PG & Rooms",
        description: "Safe and secure PG for female students of Gautam Buddha University and Bennett University. Offers hygienic food, air-conditioned rooms, CCTV coverage, study hall, and regular bus connectivity.",
        type: "PG",
        price: 7800,
        location: {
          city: "Greater Noida",
          area: "Delta 1",
          fullAddress: "B-Block, Delta 1, Near Delta 1 Metro Station, Greater Noida, UP 201308",
          coordinates: { lat: 28.4952, lng: 77.5081 }
        },
        amenities: [
          "AC & Geyser in all rooms",
          "Nutritious Vegetarian Meals",
          "High-Speed Fiber WiFi",
          "CCTV Surveillance & Female Warden",
          "Washing Machine on Every Floor",
          "Dedicated Study Tables",
          "Power Backup"
        ],
        images: [
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "TechZone Executive Single Private Room",
        description: "Tailored for IT professionals working in TechZone 4 and Noida Extension. High-speed 300 Mbps fiber connection, ergonomic work desk, silent AC, and housekeeping. No restrictions, 100% privacy.",
        type: "Room",
        price: 12000,
        location: {
          city: "Greater Noida",
          area: "TechZone 4",
          fullAddress: "Opposite Tech Park Cluster, TechZone 4, Greater Noida West, UP 201306",
          coordinates: { lat: 28.5921, lng: 77.4382 }
        },
        amenities: [
          "Private Attached Room & Washroom",
          "Ergonomic Work Desk & Chair",
          "300 Mbps Fiber WiFi",
          "Silent Inverter AC",
          "100% Power Backup",
          "Smart TV with OTT Apps",
          "Covered Two-Wheeler & Car Parking"
        ],
        images: [
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Grand Oak Student Hostel & Residency (Boys)",
        description: "One of the most trusted student hostels in Knowledge Park I. Located right behind NIET and ITS College. Includes mess food, recreation room with pool and table tennis, laundry, and round-the-clock warden support.",
        type: "Hostel",
        price: 8800,
        location: {
          city: "Greater Noida",
          area: "Knowledge Park I",
          fullAddress: "Behind NIET Campus, Knowledge Park I, Greater Noida, UP 201306",
          coordinates: { lat: 28.4682, lng: 77.4912 }
        },
        amenities: [
          "Mess Food (Breakfast, Lunch, Dinner)",
          "High-Speed WiFi Access",
          "Table Tennis & Indoor Games Room",
          "Laundry & Ironing Support",
          "24/7 Security Guards & CCTV",
          "Geyser & RO Drinking Water",
          "Heavy Generator Power Backup"
        ],
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      },
      {
        ownerId: owner._id,
        title: "Avenue Palm 1BHK Serviced Apartment",
        description: "Move-in ready 1BHK serviced apartment in AVJ Heights, Sector Zeta 1. Premium high floor with scenic balcony, modular kitchen, high-speed lift, swimming pool, gym, and 24/7 security.",
        type: "Flat",
        price: 16500,
        location: {
          city: "Greater Noida",
          area: "Zeta 1",
          fullAddress: "Tower B, AVJ Heights, Sector Zeta 1, Greater Noida, UP 201306",
          coordinates: { lat: 28.4867, lng: 77.5312 }
        },
        amenities: [
          "Fully Furnished Bedroom & Living Room",
          "Modern Kitchen with Gas Pipeline & RO",
          "Split AC & Water Heater",
          "High Floor Scenic Balcony",
          "Society Swimming Pool & Gym",
          "High-Speed Elevators",
          "Reserved Covered Parking"
        ],
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format&fit=crop&q=80"
        ],
        status: "Active"
      }
    ];

    const createdProperties = await Property.insertMany(sampleProperties);

    return NextResponse.json({
      success: true,
      message: "Successfully seeded test owner and 10 Greater Noida properties with photos and full details.",
      owner: {
        id: owner._id,
        name: owner.name,
        phone: owner.phone,
        email: owner.email,
        role: owner.role,
        city: owner.city
      },
      propertiesCount: createdProperties.length,
      properties: createdProperties.map((p) => ({
        id: p._id,
        title: p.title,
        type: p.type,
        price: p.price,
        location: `${p.location.area}, ${p.location.city}`,
        imagesCount: p.images.length
      }))
    });
  } catch (error: any) {
    console.error("Error seeding properties:", error);
    return NextResponse.json({ error: "Failed to seed properties", details: error.message }, { status: 500 });
  }
}
