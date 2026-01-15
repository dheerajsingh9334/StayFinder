import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import { BookintParams, CreateBookingBody } from "./booking.types";
import prisma from "../../utils/dbconnect";
import { BookingStatus, PropertyStatus, Role } from "@prisma/client";
import { autoCompleteBooking } from "../../utils/autocomplete";

export default class bookingController {
  static createBooking = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(400).json({
          msg: "Unauthorized",
        });
      }
      const { propertyId, startDate, endDate, capacity } =
        req.body as CreateBookingBody;
      if (!propertyId || !startDate || !endDate || capacity == null) {
        return res.status(400).json({
          msg: "missing credentials",
        });
      }
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          msg: "Invalid date Formate",
        });
      }
      if (start < new Date()) {
        return res.status(400).json({
          msg: "Cannot book date in the past",
        });
      }

      if (start >= end) {
        return res.status(400).json({
          msg: "End date must be after Start date",
        });
      }

      if (capacity < 1) {
        return res.status(400).json({
          msg: "Capacity must be at least 1",
        });
      }

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return res.status(404).json({
          msg: "Property not found",
        });
      }

      if (capacity > property.capacity) {
        return res.status(400).json({
          msg: "Not enough capacity",
        });
      }

      if (property.status !== PropertyStatus.ACTIVE) {
        return res.status(404).json({
          msg: "this is Property is not active ",
        });
      }
      if (property.ownerId === req.user.userId) {
        return res.status(403).json({
          msg: "Property owner cannot book their own property",
        });
      }
      const blocked = await prisma.propertyAvailability.findFirst({
        where: {
          propertyId,
          AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
        },
      });

      if (blocked) {
        return res.status(409).json({
          msg: "Property is blocked for selected dates",
        });
      }

      const capacitySum = await prisma.booking.aggregate({
        where: {
          propertyId,
          status: BookingStatus.CONFIRMED,
          AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
        },
        _sum: {
          capacity: true,
        },
      });

      const usedCapacity = capacitySum._sum.capacity ?? 0;
      const remaingCapacity = property.capacity - usedCapacity;

      if (capacity > remaingCapacity) {
        return res.status(409).json({
          msg: "No enough rooms Available for selected dates",
        });
      }

      const price = property.price;
      const diffMs = end.getTime() - start.getTime();
      const days = Math.ceil(diffMs / (1000 * 3600 * 24));
      const totalPrice = price * days * capacity;

      const booking = await prisma.booking.create({
        data: {
          userId: req.user.userId,
          propertyId,
          startDate: start,
          endDate: end,
          capacity,
          totalPrice,
          status: BookingStatus.PENDING,
        },
      });
      return res.status(201).json({
        msg: "Booking created successfully",
        booking,
      });
    } catch (error) {
      console.error("Create booking error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static getPropertyaBooking = async (req: AuthRequest, res: Response) => {
    try {
      await autoCompleteBooking();
      if (!req.user) {
        return res.status(400).json({
          msg: "Unauthorized",
        });
      }
      const { propertyId } = req.params;
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: {
          ownerId: true,
        },
      });

      if (!property) {
        return res.status(404).json({
          msg: "Property not found",
        });
      }

      const isOwner = req.user.userId === property.ownerId;
      const isAdmin = req.user.role === Role.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(400).json({
          msg: "You are not allowed ",
        });
      }

      const getBooking = await prisma.booking.findMany({
        where: {
          propertyId,
          status: {
            in: [
              BookingStatus.PENDING,
              BookingStatus.CONFIRMED,
              BookingStatus.COMPLETED,
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          capacity: true,
          totalPrice: true,
          status: true,
          paymentId: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return res.status(200).json({
        msg: "Property booking fetch successfully",
        getBooking,
      });
    } catch (error) {
      console.error("error in GetBooking", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  // static toggleBooking = async (req: AuthRequest, res: Response) => {
  //   try {
  //     const { bookingId } = req.params as BookintParams;

  //     if (!req.user) {
  //       return res.status(400).json({
  //         msg: "Unauthorized",
  //       });
  //     }

  //     const booking = await prisma.booking.findUnique({
  //       where: { id: bookingId },
  //     });
  //     if (!booking) {
  //       return res.status(404).json({
  //         msg: "Booking not Exist",
  //       });
  //     }

  //     if (booking.status !== BookingStatus.PENDING) {
  //       return res.status(400).json({
  //         msg: "Only PENDING bookings can be confirmed or cancelled",
  //       });
  //     }
  //     const property = await prisma.property.findUnique({
  //       where: { id: booking.propertyId },
  //     });

  //     if (!property) {
  //       return res.status(404).json({
  //         msg: "Property not found",
  //       });
  //     }
  //     const isOwner = req.user.userId === property.ownerId;
  //     const isAdmin = req.user.role === Role.ADMIN;

  //     if (!isOwner && !isAdmin) {
  //       return res.status(400).json({
  //         msg: "You are not allowed ",
  //       });
  //     }

  //     const capacitySum = await prisma.booking.aggregate({
  //       where: {
  //         propertyId: booking.propertyId,
  //         status: BookingStatus.CONFIRMED,
  //         AND: [
  //           { startDate: { lt: booking.endDate } },
  //           { endDate: { gt: booking.startDate } },
  //         ],
  //       },
  //       _sum: { capacity: true },
  //     });

  //     const usedCapacity = capacitySum._sum.capacity ?? 0;

  //     const remaingCapacity = property.capacity - usedCapacity;
  //     const cap = property.capacity - booking.capacity;
  //     if (booking.capacity <= remaingCapacity) {
  //       const confirmBooking = await prisma.booking.update({
  //         where: { id: bookingId },
  //         data: { status: BookingStatus.CONFIRMED },
  //       });
  //       await prisma.property.update({
  //         where: { id: booking.propertyId },
  //         data: {
  //           capacity: cap,
  //         },
  //       });
  //       return res.status(200).json({
  //         msg: "Booking confirmed successfully",
  //         booking: confirmBooking,
  //       });
  //     } else {
  //       const cancleBooking = await prisma.booking.update({
  //         where: { id: bookingId },
  //         data: { status: BookingStatus.CANCELLED },
  //       });
  //       return res.status(200).json({
  //         msg: "Booking cancled due to capacity is alreadt full ",
  //         booking: cancleBooking,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Toggle booking error", error);
  //     return res.status(500).json({ msg: "Server error" });
  //   }
  // };

  static toggleBooking = async (req: AuthRequest, res: Response) => {
    try {
      const { bookingId } = req.params;

      if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return res.status(404).json({ msg: "Booking not found" });
      }

      if (booking.status !== BookingStatus.PENDING) {
        return res.status(400).json({
          msg: "Only PENDING bookings can be processed",
        });
      }

      const property = await prisma.property.findUnique({
        where: { id: booking.propertyId },
      });

      if (!property) {
        return res.status(404).json({ msg: "Property not found" });
      }

      const isOwner = property.ownerId === req.user.userId;
      const isAdmin = req.user.role === Role.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      const capacityAgg = await prisma.booking.aggregate({
        where: {
          propertyId: booking.propertyId,
          status: BookingStatus.CONFIRMED,
          AND: [
            { startDate: { lt: booking.endDate } },
            { endDate: { gt: booking.startDate } },
          ],
        },
        _sum: { capacity: true },
      });

      const usedCapacity = capacityAgg._sum.capacity ?? 0;
      const remainingCapacity = property.capacity - usedCapacity;

      if (booking.capacity <= remainingCapacity) {
        const confirmed = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CONFIRMED },
        });

        return res.status(200).json({
          msg: "Booking confirmed successfully",
          booking: confirmed,
        });
      } else {
        const cancelled = await prisma.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED },
        });

        return res.status(200).json({
          msg: "Booking cancelled due to insufficient capacity",
          booking: cancelled,
        });
      }
    } catch (error) {
      console.error("Toggle booking error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static getUserBooking = async (req: AuthRequest, res: Response) => {
    try {
      await autoCompleteBooking();
      if (!req.user) {
        return res.status(400).json({
          msg: "Unauthorized",
        });
      }

      const booking = await prisma.booking.findMany({
        where: {
          userId: req.user.userId,
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          totalPrice: true,
          capacity: true,
          status: true,
          createdAt: true,
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              images: true,
              address: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      if (booking.length === 0) {
        return res.status(404).json({
          msg: "Booking not found",
        });
      }

      return res.status(200).json({
        msg: "Booking",
        booking,
      });
    } catch (error) {
      console.error("Get Userbooking error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static cancelBooking = async (req: AuthRequest, res: Response) => {
    try {
      const { bookingId } = req.params;

      if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return res.status(404).json({ msg: "Booking not found" });
      }
      const properties = await prisma.property.findUnique({
        where: { id: booking.propertyId },
        select: { ownerId: true },
      });

      const isOwner = properties?.ownerId === req.user.userId;
      const isAdmin = req.user.role === Role.ADMIN;
      const isUser = req.user.userId === booking.userId;
      if (!isAdmin && !isOwner && !isUser) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      if (
        booking.status === BookingStatus.CANCELLED ||
        booking.status === BookingStatus.COMPLETED
      ) {
        return res.status(400).json({ msg: "Booking cannot be cancelled" });
      }

      const cancelled = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });

      return res.status(200).json({
        msg: "Booking cancelled successfully",
        booking: cancelled,
      });
    } catch (error) {
      console.error("Cancel booking error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static completeBooking = async (req: AuthRequest, res: Response) => {
    try {
      const { bookingId } = req.params;
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
      });
      if (!booking) {
        return res.status(404).json({
          msg: "Booking not Found",
        });
      }
      if (booking.status === BookingStatus.COMPLETED) {
        return res.status(400).json({
          msg: "booking is already complete",
        });
      }

      if (booking.status !== BookingStatus.CONFIRMED) {
        return res.status(400).json({
          msg: "only comfiremed booking is  completed",
        });
      }

      if (booking.endDate > new Date()) {
        return res.status(400).json({
          msg: "Booking cannot be completed before end Date",
        });
      }

      const properties = await prisma.property.findUnique({
        where: { id: booking.propertyId },
        select: { ownerId: true },
      });
      if (!properties) {
        return res.status(403).json({ msg: "Property Not found" });
      }

      const isOwner = properties.ownerId === req.user.userId;
      const isAdmin = req.user.role === Role.ADMIN;
      if (!isAdmin && !isOwner) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      const completeBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.COMPLETED },
      });

      return res
        .status(200)
        .json({ msg: "Booking COmpleted", completeBooking });
    } catch (error) {
      console.error("Booking COmpleted error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };
  // static cancleBooking = async (req: AuthRequest, res: Response) => {
  //   try {
  //     const { bookingId } = req.params;
  //     if (!req.user) {
  //       return res.status(404).json({
  //         msg: "Unauthorized",
  //       });
  //     }
  //     const booking = await prisma.booking.findUnique({
  //       where: { id: bookingId },
  //     });
  //     if (!booking) {
  //       return res.status(404).json({
  //         msg: "not Found",
  //       });
  //     }

  //     if (booking.userId !== req.user.userId) {
  //       return res.status(400).json({
  //         msg: "Unauthorized",
  //       });
  //     }

  //     if (booking.status === BookingStatus.CANCELLED) {
  //       return res.status(400).json({
  //         msg: " booking  is already  cancle",
  //       });
  //     }

  //     if (booking.status === BookingStatus.COMPLETED) {
  //       return res.status(400).json({
  //         msg: "Completed booking  not  cancle",
  //       });
  //     }
  //     if (booking.status === BookingStatus.CONFIRMED) {
  //       try {
  //         const property = await prisma.property.findUnique({
  //           where: { id: booking.propertyId },
  //         });
  //         if (!property) {
  //           return res.status(400).json({
  //             msg: "Property not Found",
  //           });
  //         }
  //         const capacity = property.capacity + booking.capacity;
  //         const update = await prisma.property.update({
  //           where: { id: booking.propertyId },
  //           data: { capacity: capacity },
  //         });

  //         const updateBooking = await prisma.booking.update({
  //           where: { id: bookingId },
  //           data: {
  //             status: BookingStatus.CANCELLED,
  //           },
  //         });
  //         return res.status(200).json({
  //           msg: "Confirmed booking is cancled",
  //           updateBooking,
  //         });
  //       } catch (error) {
  //         console.error("cancle booking error", error);
  //         return res.status(500).json({ msg: "Server error" });
  //       }
  //     }
  //     const cancleBooking = await prisma.booking.update({
  //       where: { id: bookingId },
  //       data: {
  //         status: BookingStatus.CANCELLED,
  //       },
  //     });

  //     return res.status(404).json({
  //       msg: "Booking Cancled SuccessFully",
  //       cancleBooking,
  //     });
  //   } catch (error) {
  //     console.error("cancle booking error", error);
  //     return res.status(500).json({ msg: "Server error" });
  //   }
  // };
}
