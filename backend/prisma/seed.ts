import { PrismaClient, Role, PropertyStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const cities = [
  { city: "Patna", state: "BIHAR", lat: 25.5941, lng: 85.1376 },
  { city: "Delhi", state: "DELHI", lat: 28.6139, lng: 77.209 },
  { city: "Bangalore", state: "KARNATAKA", lat: 12.9716, lng: 77.5946 },
  { city: "Mumbai", state: "MAHARASHTRA", lat: 19.076, lng: 72.8777 },
  { city: "Goa", state: "GOA", lat: 15.2993, lng: 74.124 },
  { city: "Jaipur", state: "RAJASTHAN", lat: 26.9124, lng: 75.7873 }
];

const amenitiesPool = [
  "Wifi", "Free Parking", "Air Conditioning", "Pool", 
  "Kitchen", "TV", "Gym", "Breakfast Included", "Dedicated Workspace"
];

const propertyImages = [
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb",
  "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09",
  "https://images.unsplash.com/photo-1449844908441-8829872d2607",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267"
];

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: { password: hashedPassword, role: Role.ADMIN },
    create: {
      name: "Admin User",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: Role.ADMIN,
      isEmailVerified: true
    }
  });

  // 2. Create Regular User
  const user = await prisma.user.upsert({
    where: { email: "dheerajkumarsingh9334@gmail.com" },
    update: { password: hashedPassword, role: Role.USER },
    create: {
      name: "Dheeraj Kumar Singh",
      email: "dheerajkumarsingh9334@gmail.com",
      password: hashedPassword,
      role: Role.USER,
      isEmailVerified: true
    }
  });

  // 3. Create Host (Owner)
  const host = await prisma.user.upsert({
    where: { email: "dheerajrock9334@gmail.com" },
    update: { password: hashedPassword, role: Role.HOST },
    create: {
      name: "Dheeraj Rock",
      email: "dheerajrock9334@gmail.com",
      password: hashedPassword,
      role: Role.HOST,
      isEmailVerified: true
    }
  });

  console.log("3 Users (Admin, User, Host) seeded successfully");

  // Clear existing properties for the host to strictly maintain exactly 50 properties for the run
  await prisma.property.deleteMany({
    where: { ownerId: host.id }
  });

  // 4. Create 50 Properties
  const propertiesData = Array.from({ length: 50 }).map((_, i) => {
    const location = cities[i % cities.length];
    
    // Select 3 images in a rotating manner
    const startImg = i % propertyImages.length;
    const images = [
      propertyImages[startImg],
      propertyImages[(startImg + 1) % propertyImages.length],
      propertyImages[(startImg + 2) % propertyImages.length]
    ];

    return {
      title: `Premium Stay ${location.city} - ${i + 1}`,
      description: `Experience luxury and comfort in the heart of ${location.city}. This beautiful property offers all modern amenities for a perfect stay.`,
      price: 1500 + Math.floor(Math.random() * 5000), // Random price from 1500 to 6500
      country: "India",
      state: location.state,
      city: location.city,
      lat: location.lat + (Math.random() - 0.5) * 0.05,
      lng: location.lng + (Math.random() - 0.5) * 0.05,
      capacity: 2 + (i % 6), // 2 to 7 people
      bedrooms: 1 + (i % 4), // 1 to 4 bedrooms
      bathrooms: 1 + (i % 3), // 1 to 3 bathrooms
      images,
      amenities: amenitiesPool.slice(0, 4 + (i % Math.min(5, amenitiesPool.length - 4))),
      status: PropertyStatus.ACTIVE,
      ownerId: host.id,
      averageRating: Number((3 + Math.random() * 2).toFixed(1)), // 3.0 to 5.0
      reviewCount: Math.floor(Math.random() * 100),
    };
  });

  await prisma.property.createMany({
    data: propertiesData,
  });

  console.log("50 Properties seeded for the Host successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
