import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import {
  AddReviewsBody,
  EDIT_REVIEW_WINDOW_DAYS,
  EditReviewBody,
  REVIEW_WINDOW_DAYS,
} from "./reviews.type";
import prisma from "../../utils/dbconnect.ts";
import { BookingStatus, ReviewStatus, Role } from "@prisma/client";
import { error } from "console";

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
        include: { property: true },
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
      const existingreviews = await prisma.review.findUnique({
        where: { bookingId },
      });
      if (existingreviews) {
        return res.status(400).json({
          msg: "You have already Review this property",
        });
      }
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          msg: "Invalid rating value",
        });
      }

      const Emptycomment = comment ?? "";

      const review = await prisma.$transaction(async (tx) => {
        const property = await tx.property.findUnique({
          where: { id: booking.propertyId },
        });

        if (!property) {
          throw new Error("Property not Found");
        }
        const newReview = await tx.review.create({
          data: {
            rating,
            comment: Emptycomment,
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
          where: { id: property.id },
          data: {
            reviewCount: newReviewCount,
            averageRating: newAverageRating,
          },
        });
        return newReview;
      });

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
          include: {
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

      // if (review.length === 0) {
      return res.status(200).json({
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
        reviews: review,
        msg: "No reviews Yet",
      });

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

      return res.status(201).json({
        msg: "Review Fetch successfully",
        myReviews,
      });
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

      const updateReviews = await prisma.review.update({
        where: { id: reviewId },
        data: {
          status: ReviewStatus.HIDDEN,
        },
      });

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
        include: { property: true },
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
        reviewEditDeadLine.getDate() + EDIT_REVIEW_WINDOW_DAYS
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
        });

        if (!property) {
          return res.status(404).json({
            msg: " Reviews not Exist ",
          });
        }

        if (property.reviewCount === 0) {
          return res.status(404).json({
            msg: " Reviews not Exist ",
          });
        }

        const existReviews = await tx.review.findFirst({
          where: { id: reviewId, status: ReviewStatus.PUBLISHED },
        });

        if (!existReviews) {
          throw new Error("Reviews not Found");
        }

        const updateReviews = await tx.review.update({
          where: { id: reviewId },
          data: {
            comment: safeComment,
            rating: rating,
          },
        });
        if (rating !== existReviews.rating && property.reviewCount > 0) {
          const oldtotalRating = property.averageRating * property.reviewCount;
          const newAdjustedRating =
            oldtotalRating - existReviews.rating + rating;
          const newAverageRating = newAdjustedRating / property.reviewCount;

          await tx.property.update({
            where: { id: property.id },
            data: {
              averageRating: newAverageRating,
            },
          });
        }
        return updateReviews;
      });

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
