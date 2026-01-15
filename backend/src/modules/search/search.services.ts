import { PropertyStatus } from "@prisma/client";
import { PropertySerachQuery } from "./search.types";
import prisma from "../../utils/dbconnect";

export const searchProperty = async (query: PropertySerachQuery) => {
  const { city, minPrice, maxPrice, search, capacity, startDate, endDate } =
    query;

  const filter: any = {
    status: PropertyStatus.ACTIVE,
  };

  if (city) {
    filter.city = city;
  }

  if (capacity) {
    filter.capacity = { gte: capacity };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.gte = minPrice;
    if (maxPrice) filter.price.lte = maxPrice;
  }

  if (search?.trim()) {
    filter.OR = [
      {
        title: { contains: search, mode: "insensitive" },
      },
      {
        discription: { contains: search, mode: "insensitive" },
      },
      {
        address: { contains: search, mode: "insensitive" },
      },
    ];
  }

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    filter.NOT = {
      PropertAvailabilirt: {
        some: {
          AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
        },
      },
    };
  }

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const skip = (page - 1) * limit;

  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where: filter,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        city: true,
        country: true,
        price: true,
        capacity: true,
        images: true,
        address: true,
      },
    }),
    prisma.property.count({ where: filter }),
  ]);
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: properties.length,
    data: properties,
  };
};

// give me full folder structure for frontend read stayfinder project and use things that make more useful also fully state management
//  that handle large amount of user like 100k+ and i want to use both redux and context letter add some libary
