import { PrismaClient, PropertyStatus } from "@prisma/client";

const prisma = new PrismaClient();

const ownerId = "693f33e1f2ac5a4e889c4cff";

const cities = [
  { city: "Patna", state: "BIHAR", lat: 25.5941, lng: 85.1376 },
  { city: "Delhi", state: "DELHI", lat: 28.6139, lng: 77.209 },
  { city: "Bangalore", state: "KARNATAKA", lat: 12.9716, lng: 77.5946 },
  { city: "Mumbai", state: "MAHARASHTRA", lat: 19.076, lng: 72.8777 },
];

const amenitiesPool = ["Wifi", "Parking", "AC", "Pool", "Kitchen", "TV"];

async function main() {
  const properties = Array.from({ length: 100 }).map((_, i) => {
    const location = cities[i % cities.length];

    return {
      title: `Premium Stay ${i + 1}`,
      description: `Comfortable and modern stay number ${i + 1}`,
      price: 1500 + (i % 10) * 300,
      country: "India",
      state: location.state,
      city: location.city,
      lat: location.lat + Math.random() * 0.01,
      lng: location.lng + Math.random() * 0.01,
      capacity: 2 + (i % 4),
      bedrooms: 1 + (i % 3),
      bathrooms: 1 + (i % 2),
      images: ["https://img1.jpg", "https://img2.jpg"],
      amenities: amenitiesPool.slice(0, 3 + (i % 3)),
      status: PropertyStatus.ACTIVE,
      ownerId,
      averageRating: 0,
      reviewCount: 0,
    };
  });

  await prisma.property.createMany({
    data: properties,
  });

  console.log("100 ACTIVE properties seeded successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
