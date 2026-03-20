import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import {
  AddReviewsBody,
  EDIT_REVIEW_WINDOW_DAYS,
  EditReviewBody,
  REVIEW_WINDOW_DAYS,
} from "./reviews.type";
import prisma from "../../utils/dbconnect";
import { BookingStatus, ReviewStatus, Role } from "@prisma/client";
import { error } from "console";
import { redisClient } from "../../config/redis";

export default class ReviewsControlller {
  static addReviews = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const { bookingId, rating, comment } = req.body as AddReviewsBody;
      if (!bookingId || rating == null) {
        return res.status(400).json({
          msg: "missing Required Fields",
        });
      }
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        select: {
          userId: true,
          status: true,
          endDate: true,
          propertyId: true,
        },
      });
      if (!booking) {
        return res.status(404).json({
          msg: "Booking not found",
        });
      }
      if (req.user.userId !== booking.userId) {
        return res.status(403).json({
          msg: "Not allowed to review this booking",
        });
      }

      if (booking.status !== BookingStatus.COMPLETED) {
        return res.status(400).json({
          msg: "Must checkout first",
        });
      }
      const reviewDeadLine = new Date(booking.endDate);
      reviewDeadLine.setDate(reviewDeadLine.getDate() + REVIEW_WINDOW_DAYS);
      if (new Date() > reviewDeadLine) {
        return res.status(400).json({
          msg: "Review period expired",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          msg: "Invalid rating value",
        });
      }

      const review = await prisma.$transaction(async (tx) => {
        const property = await tx.property.findUnique({
          where: { id: booking.propertyId },
          select: { reviewCount: true, averageRating: true },
        });

        if (!property) {
          throw new Error("Property not Found");
        }
        const newReview = await tx.review.create({
          data: {
            rating,
            comment: comment ?? "",
            userId: booking.userId,
            bookingId,
            propertyId: booking.propertyId,
          },
        });
        const newReviewCount = property.reviewCount + 1;
        const newAverageRating =
          (property.averageRating * property.reviewCount + rating) /
          newReviewCount;

        await tx.property.update({
          where: { id: booking.propertyId },
          data: {
            reviewCount: newReviewCount,
            averageRating: newAverageRating,
          },
        });
        return newReview;
      });
      redisClient.incr("reviews:version").catch(console.error);

      redisClient
        .incr(`review:user:${req.user.userId}:version`)
        .catch(console.error);
      return res.status(201).json({
        msg: "Review created successfully",
        review: review,
      });
    } catch (error) {
      console.error("Review created controller error", error);
      return res.status(500).json({
        msg: "server Error",
      });
    }
  };

  static propertyReviews = async (req: AuthRequest, res: Response) => {
    try {
      const { propertyId } = req.params;
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Number(req.query.limit) || 10);
      const skip = (page - 1) * limit;
      if (!propertyId) {
        return res.status(400).json({
          msg: "PropertyId is required",
        });
      }
      const version =
        (await redisClient.get(`reviews:property:${propertyId}:version`)) ||
        "1";
      const key = `reviews:property:${propertyId}:v:${version}:page:${page}:limit:${limit}`;
      const cache = await redisClient.get(key);
      if (cache) {
        return res.status(200).json(JSON.parse(cache));
      }
      const [review, total] = await Promise.all([
        prisma.review.findMany({
          where: {
            propertyId,
            status: ReviewStatus.PUBLISHED,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        }),
        prisma.review.count({
          where: { propertyId, status: ReviewStatus.PUBLISHED },
        }),
      ]);

      const responseData = {
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
        reviews: review,
        msg: "No reviews Yet",
      };

      await redisClient.set(key, JSON.stringify(responseData), "EX", 60);
      // if (review.length === 0) {
      return res.status(200).json(responseData);

      // }
    } catch (error) {
      console.error("propertyReviews", error);
      return res.status(500).json({
        msg: "Server Error",
        error,
      });
    }
  };

  static userReviews = async (req: AuthRequest, res: Response) => {
    try {
      // const { userId } = req.params;
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const version =
        (await redisClient.get(`review:user:${req.user.userId}:version`)) ||
        "1";
      const key = `review:user:${req.user.userId}:v:${version}`;
      const cache = await redisClient.get(key);
      if (cache) {
        return res.status(200).json(JSON.parse(cache));
      }
      const myReviews = await prisma.review.findMany({
        where: { userId: req.user.userId, status: ReviewStatus.PUBLISHED },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              country: true,
            },
          },
        },
      });
      const responseData = {
        msg: "Review Fetch successfully",
        myReviews,
      };
      await redisClient.set(key, JSON.stringify(responseData), "EX", 60);
      return res.status(201).json(responseData);
    } catch (error) {
      console.error("myReviews", error);
      return res.status(500).json({
        msg: "Server Error",
        error,
      });
    }
  };

  static deleteReviews = async (req: AuthRequest, res: Response) => {
    //     3️⃣ WHEN A REVIEW IS DELETED (SOFT DELETE)

    // You are not removing the row, but logically removing it from aggregation.

    // What changes

    // One rating must be removed

    // Count must decrease

    // Conceptual math

    // Reconstruct total score
    // TotalScore = oldAverage × oldCount

    // Subtract deleted rating
    // NewTotalScore = TotalScore − deletedRating

    // Decrement count
    // NewCount = oldCount − 1

    // Handle edge case
    // If NewCount == 0

    try {
      const { reviewId } = req.params;
      if (!req.user) {
        return res.status(400).json({
          msg: "Unauthorized",
        });
      }
      const myReviews = await prisma.review.findUnique({
        where: { id: reviewId },
        // include: { user: true },
      });

      if (!myReviews) {
        return res.status(400).json({
          msg: "Not found",
        });
      }

      if (req.user.userId !== myReviews.userId) {
        return res.status(403).json({
          msg: "Unauthorized",
        });
      }

      const updateReviews = await prisma.$transaction(async (tx) => {
        const property = await tx.property.findUnique({
          where: { id: myReviews.propertyId },
          select: { reviewCount: true, averageRating: true },
        });
        if (!property) throw new Error("property not found");
        const newCount = property.reviewCount - 1;
        const newAvg =
          newCount === 0
            ? 0
            : (property.averageRating * property.reviewCount -
                myReviews.rating) /
              newCount;
        await tx.property.update({
          where: { id: myReviews.propertyId },
          data: {
            reviewCount: newCount,
            averageRating: newAvg,
          },
        });
        await tx.review.update({
          where: { id: reviewId },
          data: { status: ReviewStatus.HIDDEN },
        });
      });
      redisClient
        .incr(`reviews:property:${myReviews.propertyId}:version`)
        .catch(console.error);
      redisClient
        .incr(`review:user:${req.user.userId}:version`)
        .catch(console.error);
      return res.status(200).json({
        msg: "Review deleted successfully",
        updateReviews,
      });
    } catch (error) {
      console.error("deleteReviews", error);
      return res.status(500).json({
        msg: "Server Error",
        error,
      });
    }
  };

  static editReviews = async (req: AuthRequest, res: Response) => {
    try {
      const { reviewId } = req.params;
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const { comment, rating } = req.body as EditReviewBody;

      if (rating == null) {
        return res.status(400).json({
          msg: "missing Required Fields",
        });
      }

      const safeComment = comment ?? "";

      const myReviews = await prisma.review.findFirst({
        where: { id: reviewId, status: ReviewStatus.PUBLISHED },
        // include: { property: true },
      });

      if (!myReviews) {
        return res.status(404).json({
          msg: " Reviews not Exist ",
        });
      }

      if (req.user.userId !== myReviews.userId) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const reviewEditDeadLine = new Date(myReviews.createdAt);
      reviewEditDeadLine.setDate(
        reviewEditDeadLine.getDate() + EDIT_REVIEW_WINDOW_DAYS,
      );

      if (new Date() > reviewEditDeadLine) {
        return res.status(400).json({
          msg: "Edit Reviews Period is Expired",
        });
      }

      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          msg: "Invalid rating value",
        });
      }

      const updatedreview = await prisma.$transaction(async (tx) => {
        const property = await tx.property.findUnique({
          where: { id: myReviews.propertyId },
          select: { reviewCount: true, averageRating: true },
        });

        if (!property) {
          return res.status(404).json({
            msg: " Reviews not Exist ",
          });
        }

        let newAvg = property.averageRating;
        if (rating !== myReviews.rating) {
          const total =
            property.averageRating * property.reviewCount -
            myReviews.rating +
            rating;
          newAvg = total / property.reviewCount;

          await tx.property.update({
            where: { id: myReviews.propertyId },
            data: { averageRating: newAvg },
          });
        }

        return tx.review.update({
          where: { id: reviewId },
          data: { rating, comment: comment ?? "" },
        });
      });

      redisClient
        .incr(`reviews:property:${myReviews.propertyId}:version`)
        .catch(console.error);
      redisClient
        .incr(`review:user:${req.user.userId}:version`)
        .catch(console.error);
      return res.status(200).json({
        msg: "Review edited successfully",
        review: updatedreview,
      });
    } catch (error) {
      console.error("Edit Reviews", error);
      return res.status(500).json({
        msg: "Server Error",
        error,
      });
    }
  };

  static toggleReviews = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }

      const { reviewId } = req.params;

      if (req.user.role !== Role.ADMIN) {
        return res.status(401).json({
          msg: "Unauthorized only admin have access",
        });
      }

      const review = await prisma.review.findUnique({
        where: { id: reviewId },
      });

      if (!review) {
        return res.status(400).json({
          msg: "Review is not exists",
        });
      }

      if (review.status === ReviewStatus.PUBLISHED) {
        const Hide = await prisma.review.update({
          where: { id: reviewId },
          data: { status: "HIDDEN" },
        });

        return res.status(202).json({
          msg: "Review Hide Successfully",
          Hide,
        });
      } else {
        const Published = await prisma.review.update({
          where: { id: reviewId },
          data: {
            status: "PUBLISHED",
          },
        });

        return res.status(200).json({
          msg: "Review Published SuccessFully ",
          Published,
        });
      }
    } catch (error) {
      console.error("Toggle Review error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static restorereview = async (req: AuthRequest, res: Response) => {
    try {
      const { reviewId } = req.params;

      if (!req.user) {
        return res.status(400).json({
          msg: "Unauthorized only admin have access",
        });
      }

      if (req.user.role !== Role.ADMIN) {
        return res.status(400).json({
          msg: "Unauthorized only admin have access",
        });
      }
      const reviews = await prisma.review.findFirst({
        where: { id: reviewId, status: "HIDDEN" },
        // include: { user: true },
      });

      if (!reviews) {
        return res.status(400).json({
          msg: "Not found",
        });
      }

      if (reviews.status === ReviewStatus.PUBLISHED) {
        return res.status(403).json({
          msg: "reviews is already PUBLISHED",
        });
      }

      const updateReviews = await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: ReviewStatus.PUBLISHED,
        },
      });

      return res.status(200).json({
        msg: "Review Restore successfully",
        updateReviews,
      });
    } catch (error) {
      console.error("Restore Review error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };
}
