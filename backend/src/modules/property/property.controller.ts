import { Response, Request } from "express";
import { AuthRequest } from "../auth/auth.types";
import { PropertyStatus, Role } from "@prisma/client";
import {
  CreatePropertyBody,
  PropertyResponse,
  updatePropertyBody,
} from "./property.types";
import prisma from "../../utils/dbconnect";
import { redisClient } from "../../config/redis";
import { z } from "zod";

const createPropertySchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  country: z.string().optional(),
  state: z.string(),
  city: z.string(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  capacity: z.number().positive(),
  bedrooms: z.number().positive(),
  bathrooms: z.number().positive(),
  images: z.array(z.string()).optional(),
  amenities: z.array(z.string()).min(1),
});

export default class PropertyController {
  // ! CreateProperty
  static createProperty = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const parsed = createPropertySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ msg: "Validation Error", errors: parsed.error.issues });
      }

      const {
        title, description, price, country, state, city,
        lat, lng, capacity, bedrooms, bathrooms, images, amenities
      } = parsed.data;

      const property = await prisma.property.create({
        data: {
          title,
          description,
          price,
          country,
          state,
          city,
          lat,
          lng,
          capacity,
          bedrooms,
          bathrooms,
          images,
          amenities,
          status: PropertyStatus.PENDING,
          ownerId: req.user.userId,
        },
      });

      await redisClient.incr("property:version");

      return res.status(201).json({
        msg: "Property Create Successfully",
        property,
      });
    } catch (error) {
      console.error("create Property Error", error);
      return res.status(500).json({
        msg: "server error",
      });
    }
  };
  // ! GetAll
  static getProperty = async (req: Request, res: Response) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
      const skip = (page - 1) * limit;

      const version = (await redisClient.get("property:version")) || "1";
      const key = `property:v${version}:list:${page}:${limit}`;
      const cache = await redisClient.get(key);
      if (cache) {
        console.log(" get All cache hit");
        return res.status(200).json(JSON.parse(cache));
      }
      console.log(" get All cache miss - db hit");

      const [property, total] = await Promise.all([
        prisma.property.findMany({
          where: { status: PropertyStatus.ACTIVE },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            title: true,
            state: true,
            price: true,
            images: true,

            // owner: {
            //   select: {
            //     name: true,
            //     avatarUrl: true,
            //   },
            // },
          },
        }),
        prisma.property.count({ where: { status: PropertyStatus.ACTIVE } }),
      ]);
      const formate = property.map((p) => ({
        ...p,
        images: p.images?.slice(0, 1),
      }));
      const responseData = {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        data: formate,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 60);
      return res.status(200).json(responseData);
    } catch (error) {
      return res.status(400).json({
        msg: "Server error",
      });
    }
  };
  // ! GetSingle
  static getSingleProperty = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(404).json({
          msg: "Id is missing",
        });
      }
      const version = (await redisClient.get("property:version")) || "1";
      const key = `property:v${version}:details:${id}`;
      const cache = await redisClient.get(key);
      if (cache) {
        console.log("property details cache hit");
        return res.status(200).json(JSON.parse(cache));
      }
      console.log("property details cache miss");
      const property = await prisma.property.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              phone: true,
            },
          },
          // availability: true,
        },
      });

      if (!property) {
        return res.status(404).json({
          msg: "Property not found",
        });
      }

      if (property.status !== PropertyStatus.ACTIVE) {
        return res.status(200).json({
          property: property as PropertyResponse,
        });
      }
      const responseData = {
        property: property as PropertyResponse,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 60);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Get single property error", error);
      return res.status(500).json({
        msg: "Server error",
      });
    }
  };
  // ! Update
  static updateProperty = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      if (!id) {
        return res.status(400).json({
          msg: "Property id is missing",
        });
      }

      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        return res.status(404).json({
          msg: "Property not found",
        });
      }

      if (req.user.userId !== property.ownerId) {
        return res.status(403).json({
          msg: "You are not allowed to update this property",
        });
      }

      const {
        title,
        description,
        price,
        country,
        state,
        city,
        lat,
        lng,
        capacity,
        bedrooms,
        bathrooms,
        images,
        amenities,
      } = req.body as updatePropertyBody;

      const updatedProperty = await prisma.property.update({
        where: { id },
        data: {
          title,
          description,
          price,
          country,
          state,
          city,
          lat,
          lng,
          capacity,
          bedrooms,
          bathrooms,
          images,
          amenities,
        },
      });

      await redisClient.incr("property:version");

      return res.status(200).json({
        msg: "Property updated successfully",
        property: updatedProperty,
      });
    } catch (error) {
      console.error("updateProperty Error", error);
      return res.status(500).json({
        msg: "Server error",
      });
    }
  };

  // ! Delete
  static deleteProperty = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({
          msg: "property Id  is Missing",
        });
      }
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const property = await prisma.property.findUnique({
        where: { id },
      });
      if (!property) {
        return res.status(404).json({
          msg: "property id not found",
        });
      }
      const isOwner = req.user.userId === property.ownerId;
      const isAdmin = req.user.role === Role.ADMIN;
      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          msg: "Only admin and Host can delete the property",
        });
      }

      if (property.status === PropertyStatus.DELETED) {
        return res.status(200).json({
          msg: "Property alreadt deleted",
          property,
        });
      }

      const updateProperty = await prisma.property.update({
        where: { id },
        data: {
          status: PropertyStatus.DELETED,
        },
      });

      await redisClient.incr("property:version");
      return res.status(200).json({
        msg: "Property deleted successsfully",
        property: updateProperty,
      });
    } catch (error) {
      console.error("deleted Property Errror", error);
      return res.status(500).json({
        msg: "Server Error",
      });
    }
  };

  // ! get ownerProperty
  static ownerProperty = async (req: AuthRequest, res: Response) => {
    try {
      console.log("ownwe controller called");
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
      const skip = (page - 1) * limit;
      console.log(req.user.userId);
      const version = (await redisClient.get("property:version")) || "1";
      const key = `property:v${version}:owner:${req.user.userId}:${page}:${limit}`;
      const cache = await redisClient.get(key);

      if (cache) {
        console.log("ownerProperty cache hit");
        return res.status(200).json(JSON.parse(cache));
      }
      console.log("OwnerProperty cache miss");

      const [properties, total, groupedCounts] = await Promise.all([
        prisma.property.findMany({
          where: {
            ownerId: req.user.userId,

            status: {
              in: [
                PropertyStatus.ACTIVE,
                PropertyStatus.INACTIVE,
                PropertyStatus.PENDING,
                // PropertyStatus.DELETED,
                PropertyStatus.REJECTED,
              ],
            },
          },
          skip,
          take: limit,
          select: {
            id: true,
            title: true,
            state: true,
            price: true,
            images: true,
            lat: true,
            lng: true,
            status: true,
            availability: true,
            owner: {
              select: {
                name: true,
                avatarUrl: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.property.count({
          where: {
            ownerId: req.user.userId,
            status: {
              in: [
                PropertyStatus.ACTIVE,
                PropertyStatus.INACTIVE,
                PropertyStatus.PENDING,
                PropertyStatus.REJECTED,
              ],
            },
          },
        }),
        prisma.property.groupBy({
          by: ["status"],
          where: {
            ownerId: req.user.userId,
            status: {
              in: [
                PropertyStatus.ACTIVE,
                PropertyStatus.INACTIVE,
                PropertyStatus.PENDING,
                PropertyStatus.REJECTED,
              ],
            },
          },
          _count: {
            status: true,
          },
        }),
      ]);
      const counts = {
        total: 0,
        active: 0,
        inactive: 0,
        pending: 0,
        rejected: 0,
      };

      for (const item of groupedCounts) {
        const value = item._count.status;
        counts.total += value;

        if (item.status === PropertyStatus.ACTIVE) counts.active = value;
        if (item.status === PropertyStatus.INACTIVE) counts.inactive = value;
        if (item.status === PropertyStatus.PENDING) counts.pending = value;
        if (item.status === PropertyStatus.REJECTED) counts.rejected = value;
      }

      // if (!properties) {
      //   return res.status(404).json({
      //     msg: "property id not found",
      //   });
      // }

      const responseData = {
        msg: "My Property",
        counts,
        total,
        totalPage: Math.ceil(total / limit),
        page,
        limit,
        data: properties,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 45);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("owner Property error", error);
      return res.status(500).json({
        msg: "Server error",
      });
    }
  };

  // ! InActive-Active toggel property
  static ToggleStatus = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          msg: "Property Id is Missing",
        });
      }

      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const property = await prisma.property.findUnique({
        where: { id },
      });

      if (!property) {
        return res.status(404).json({
          msg: "property not found",
        });
      }

      const isOwner = req.user.userId === property.ownerId;
      const isAdmin = req.user.role === Role.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({
          msg: "Only admin and Host can Activate the property",
        });
      }

      if (property.status === PropertyStatus.PENDING && !isAdmin) {
        return res.status(404).json({
          msg: `Property cannot be Activated from status ${property.status} only Admin can activate Pending Propertes`,
        });
      }

      if (property.status === PropertyStatus.REJECTED) {
        return res.status(404).json({
          msg: `Rejected property cannot be activated without re-approval`,
        });
      }

      if (property.status === PropertyStatus.DELETED) {
        return res.status(404).json({
          msg: `Deleted Property cannot be Activated  `,
        });
      }
      const newStatus =
        property.status === PropertyStatus.ACTIVE
          ? PropertyStatus.INACTIVE
          : PropertyStatus.ACTIVE;

      const updateProperty = await prisma.property.update({
        where: { id },
        data: { status: newStatus },
      });
      await redisClient.incr("property:version");
      return res.status(200).json({
        msg: `Property Marked as a ${newStatus}`,
        property: updateProperty,
      });
    } catch (error) {
      console.error("Active Controller Error", error);
      return res.status(500).json({
        msg: "Server Error",
      });
    }
  };

  // ! use Location

  static getNearby = async (req: Request, res: Response) => {
    console.log("get map");

    try {
      const lat = Number(req.query.lat);
      const lng = Number(req.query.lng);
      const radius = Number(req.query.radius) || 0.1;
      const limit = Math.min(50, Number(req.query.limit)) || 20;
      const version = (await redisClient.get("property:version")) || "1";
      const key = `property:v${version}:nearby:${lat}:${lng}:${radius}:${limit}`;
      const cache = await redisClient.get(key);
      if (cache) {
        console.log("useLocation cache hit");
        return res.status(200).json(JSON.parse(cache));
      }
      console.log("useLocation cache miss");

      if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({
          msg: "Latitude and Longitude are required",
        });
      }
      const maxLat = lat + radius;
      const minLat = lat - radius;
      const minLng = lng - radius;
      const maxLng = lng + radius;

      const properties = await prisma.property.findMany({
        where: {
          status: PropertyStatus.ACTIVE,
          lat: {
            gte: minLat,
            lte: maxLat,
          },
          lng: {
            gte: minLng,
            lte: maxLng,
          },
        },
        select: {
          id: true,
          title: true,
          price: true,
          images: true,
          lat: true,
          lng: true,
          city: true,
          state: true,
        },
      });

      // Haversine formula
      const R = 6371; // Earth's radius in km
      const filteredProperties = properties.filter((p) => {
        if (p.lat === null || p.lng === null) return false;
        const dLat = ((p.lat - lat) * Math.PI) / 180;
        const dLng = ((p.lng - lng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((lat * Math.PI) / 180) *
            Math.cos((p.lat * Math.PI) / 180) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km
        return distance <= radius * 111; // if radius was in degrees originally; if radius was km, then just distance <= radius. Assuming radius was passed as degrees (0.1 ~ 11.1km). So distance <= radius * 111
      }).slice(0, limit);

      const responseData = {
        count: filteredProperties.length,
        data: filteredProperties,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 60);
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("getNearby error", error);
      return res.status(500).json({
        msg: "Server Error",
      });
    }
  };
}
