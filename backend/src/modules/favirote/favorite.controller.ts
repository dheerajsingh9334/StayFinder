import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";

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

      const existedfavorites = await prisma.favorite.findFirst({
        where: { userId: req.user.userId, propertyId },
      });

      if (existedfavorites) {
        return res.status(200).json({
          msg: " property is already Favorite",
        });
      }
      const addReviews = await prisma.favorite.create({
        data: {
          propertyId,
          userId: req.user.userId,
        },
      });

      return res.status(200).json({
        msg: "Property added in  Favorite",
        addReviews,
      });
    } catch (error) {
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

      const myFavorites = await prisma.favorite.findMany({
        where: { userId: req.user.userId },
        include: {
          property: {
            select: {
              _count: true,
              id: true,
              price: true,
              city: true,
              country: true,
              averageRating: true,
              images: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return res.status(200).json({
        msg: "Favirote fetch SuccessfullyS",
        myFavorites,
      });
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

      const favirote = await prisma.favorite.findFirst({
        where: { propertyId, userId: req.user.userId },
      });
      if (!favirote) {
        return res.status(404).json({
          msg: "property not exist in favorites",
        });
      }

      const deletefavorites = await prisma.favorite.delete({
        where: { id: favirote.id },
      });

      return res.status(200).json({
        msg: "property removed from   Favorite",
        deletefavorites,
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
