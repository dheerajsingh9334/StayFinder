import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("✅ MongoDB connected successfully via Prisma");
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

export default prisma;
