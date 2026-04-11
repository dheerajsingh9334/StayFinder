import { PropertyStatus } from "@prisma/client";
import { PropertySerachQuery } from "./search.types";
import prisma from "../../utils/dbconnect";

/**
 * Utility: safe number conversion
 */
const toNumber = (v: any): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
};

export const searchProperty = async (query: PropertySerachQuery) => {
  const {
    address,
    city,
    state,
    minPrice,
    maxPrice,
    search,
    capacity,
    startDate,
    endDate,
    amenities,
    bedrooms,
    bathrooms,
    sortBy,
  } = query;

  const filter: any = {
    status: PropertyStatus.ACTIVE,
  };

  // 🔹 Normalize numbers
  const capNum = toNumber(capacity);
  const minNum = toNumber(minPrice);
  const maxNum = toNumber(maxPrice);
  const bedNum = toNumber(bedrooms);
  const bathNum = toNumber(bathrooms);

  // 🔹 Location filters
  if (city) {
    filter.city = {
      equals: city.trim(),
      mode: "insensitive",
    };
  }

  if (amenities?.length) {
    filter.amenities = {
      hasSome: amenities,
    };
  }
  if (state) {
    filter.state = {
      equals: state.trim(),
      mode: "insensitive",
    };
  }

  if (address) {
    filter.address = {
      contains: address.trim(),
      mode: "insensitive",
    };
  }

  // 🔹 Capacity filter
  if (capNum !== undefined) {
    filter.capacity = { gte: capNum };
  }

  // 🔹 Rooms filter
  if (bedNum !== undefined) {
    filter.bedrooms = { gte: bedNum };
  }
  if (bathNum !== undefined) {
    filter.bathrooms = { gte: bathNum };
  }

  // 🔹 Price filter
  if (minNum !== undefined || maxNum !== undefined) {
    filter.price = {};
    if (minNum !== undefined) filter.price.gte = minNum;
    if (maxNum !== undefined) filter.price.lte = maxNum;
  }

  // 🔹 Keyword search (title / description / address)
  if (search && search.trim()) {
    filter.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  // 🔹 Availability filter
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

  // 🔹 Pagination
  const page = Math.max(1, toNumber(query.page) || 1);
  const limit = Math.min(50, Math.max(1, toNumber(query.limit) || 10));
  const skip = (page - 1) * limit;

  // 🔹 Parsing Sort By
  let orderByClause: any = { createdAt: "desc" };
  if (sortBy === "price_asc") orderByClause = { price: "asc" };
  else if (sortBy === "price_desc") orderByClause = { price: "desc" };
  else if (sortBy === "rating") orderByClause = { averageRating: "desc" };
  else if (sortBy === "newest") orderByClause = { createdAt: "desc" };

  // 🔹 Query DB
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where: filter,
      skip,
      take: limit,
      orderBy: orderByClause,
      select: {
        id: true,
        title: true,
        city: true,
        state: true,
        country: true,
        price: true,
        capacity: true,
        images: true,
        address: true,
        amenities: true,
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
