import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import { redisClient } from "../../config/redis";

export default class FavoriteController {
  static addFavorite = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const { propertyId } = req.params;

      if (!propertyId) {
        return res.status(400).json({
          msg: "missing propertyId",
        });
      }

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { ownerId: true },
      });
      if (!property) {
        return res.status(404).json({
          msg: "property not Found",
        });
      }
      if (req.user.userId === property.ownerId) {
        return res.status(403).json({
          msg: "Owner not allowed",
        });
      }
      let favirote;
      try {
        favirote = await prisma.favorite.create({
          data: {
            propertyId,
            userId: req.user.userId,
          },
        });
      } catch (error: any) {
        if (error.code === "P2002") {
          return res.status(200).json({
            msg: "Already in Favorites",
          });
        }
        throw error;
      }
      redisClient
        .incr(`favorite:user:${req.user.userId}:version`)
        .catch(console.error);

      return res.status(200).json({
        msg: "Property added in  Favorite",
        data: favirote,
      });
    } catch (error: any) {
      console.log(" add favorite controller Error", error);
      return res.status(500).json({
        msg: "server Error",
        error,
      });
    }
  };

  static myFavorite = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));
      const skip = (page - 1) * limit;

      const version =
        (await redisClient.get(`favorite:user:${req.user.userId}:version`)) ||
        "1";
      const key = `favorite:user:${req.user.userId}:v${version}:page:${page}:limit:${limit}`;
      const cache = await redisClient.get(key);
      if (cache) {
        return res.status(200).json(JSON.parse(cache));
      }
      const [myFavorites, total] = await Promise.all([
        prisma.favorite.findMany({
          where: { userId: req.user.userId },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            property: {
              select: {
                id: true,
                price: true,
                city: true,
                country: true,
                averageRating: true,
                images: true,
              },
            },
          },
        }),
        prisma.favorite.count({
          where: { userId: req.user.userId },
        }),
      ]);

      const responseData = {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
        msg: "Favirote fetch SuccessfullyS",
        myFavorites,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 45);

      return res.status(200).json(responseData);
    } catch (error) {
      console.log(" my favorite controller Error", error);
      return res.status(500).json({
        msg: "server Error",
        error,
      });
    }
  };

  static removeFavorite = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const { propertyId } = req.params;

      if (!propertyId) {
        return res.status(400).json({
          msg: "Property id is missing",
        });
      }

      const deleted = await prisma.favorite.deleteMany({
        where: { id: req.user.userId },
      });
      if (deleted.count === 0) {
        return res.status(404).json({
          msg: "Favortite not found",
        });
      }
      redisClient
        .incr(`favorite:user:${req.user.userId}:version`)
        .catch(console.error);

      return res.status(200).json({
        msg: "property removed from   Favorite",
      });
    } catch (error) {
      console.log(" delete favorite controller Error", error);
      return res.status(500).json({
        msg: "server Error",
        error,
      });
    }
  };
}
