import { Response, Request } from "express";
import { AuthRequest } from "../auth/auth.types";
import { PropertyStatus, Role } from "@prisma/client";
import {
  CreatePropertyBody,
  PropertyResponse,
  updatePropertyBody,
} from "./property.types";
import prisma from "../../utils/dbconnect";

export default class PropertyController {
  // ! CreateProperty
  static createProperty = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
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
      } = req.body as CreatePropertyBody;

      if (!title) {
        return res.status(400).json({ msg: "Title is required" });
      }

      if (!description) {
        return res.status(400).json({ msg: "Description is required" });
      }

      if (!price) {
        return res.status(400).json({ msg: "Price is required" });
      }

      if (!state) {
        return res.status(400).json({ msg: "State is required" });
      }

      if (!city) {
        return res.status(400).json({ msg: "City is required" });
      }

      if (!capacity) {
        return res.status(400).json({ msg: "Capacity is required" });
      }

      if (!bedrooms) {
        return res.status(400).json({ msg: "Bedrooms is required" });
      }

      if (!bathrooms) {
        return res.status(400).json({ msg: "Bathrooms is required" });
      }

      if (!amenities || amenities.length === 0) {
        return res
          .status(400)
          .json({ msg: "At least one amenity is required" });
      }

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
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
      const skip = (page - 1) * limit;
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

      return res.status(200).json({
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        data: property,
      });
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
          availability: true,
        },
      });

      if (!property) {
        return res.status(404).json({
          msg: "Property not found",
        });
      }

      if (property.status === PropertyStatus.ACTIVE) {
        return res.status(200).json({
          property: property as PropertyResponse,
        });
      }

      return res.status(200).json({
        property: property as PropertyResponse,
      });
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
      return res.status(200).json({
        msg: "My Property",
        counts,
        total,
        totalPage: Math.ceil(total / limit),
        page,
        limit,
        data: properties,
      });
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
}
