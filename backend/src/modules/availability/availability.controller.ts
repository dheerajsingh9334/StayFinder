import { Request, Response } from "express";
import {
  AuthRequest,
  AvaiabilityParams,
  AvaiabilityQuery,
} from "../auth/auth.types";
import { BookingStatus, PropertyStatus, Role } from "@prisma/client";
import prisma from "../../utils/dbconnect";
import { BlockTimeBody } from "./availability.types";

export default class availabilityController {
  static blockTime = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ msg: "Unauthorized" });
      }

      const { propertyId, startTime, endTime } = req.body as BlockTimeBody;

      if (!propertyId || !startTime || !endTime) {
        return res.status(400).json({ msg: "Missing fields" });
      }

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });

      if (!property) {
        return res.status(404).json({
          msg: "Properties not found",
        });
      }
      const isOwner = req.user.userId === property.ownerId;
      const isAdmin = req.user.role === Role.ADMIN;

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ msg: "Not allowed" });
      }

      if (property.status !== PropertyStatus.ACTIVE) {
        return res.status(400).json({
          msg: "Only ACTIVE properties can block availability",
        });
      }

      const blocked = await prisma.propertyAvailability.create({
        data: {
          propertyId,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isBlocked: true,
        },
      });

      return res.status(200).json({
        msg: "Property blocked for selected date/time",
        blocked,
      });
    } catch (error) {
      console.error("Block time error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static unblockTime = async (req: AuthRequest, res: Response) => {
    try {
      const { blockId } = req.params;
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const block = await prisma.propertyAvailability.findUnique({
        where: { id: blockId },
      });

      if (!block) {
        return res.status(404).json({
          msg: "Not Found",
        });
      }

      await prisma.propertyAvailability.delete({
        where: { id: blockId },
      });
      return res.status(200).json({
        msg: "Avaiability unblocked",
      });
    } catch (error) {
      console.error("UnBlock time error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static getHostBlock = async (req: AuthRequest, res: Response) => {
    try {
      const { propertyId } = req.params;

      const blocks = await prisma.propertyAvailability.findMany({
        where: { propertyId },
        orderBy: { startTime: "asc" },
      });

      return res.status(200).json({ blocks });
    } catch (error) {
      console.error("Get availability error", error);
      return res.status(500).json({ msg: "Server error" });
    }
  };

  static getCalenderView = async (
    req: Request<AvaiabilityParams, {}, {}, AvaiabilityQuery>,
    res: Response
  ) => {
    try {
      const { propertyId } = req.params;
      const { startDate, endDate } = req.query;

      if (!propertyId) {
        return res.status(400).json({ msg: "Mising params" });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ msg: "Missing Dates " });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return res.status(400).json({ msg: "Invalid date range" });
      }

      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { capacity: true, status: true },
      });

      if (
        !property ||
        property.status === PropertyStatus.DELETED ||
        property.status !== PropertyStatus.ACTIVE
      ) {
        return res.json({ calender: [] });
      }

      const blocks = await prisma.propertyAvailability.findMany({
        where: {
          propertyId,
          // startTime: { lt: end },
          // endTime: { gt: start },
        },
      });

      const booking = await prisma.booking.findMany({
        where: {
          propertyId,
          status: BookingStatus.CONFIRMED,
          startDate: { lt: end },
          endDate: { gt: start },
        },
        select: { startDate: true, endDate: true, capacity: true },
      });

      const calender = [];

      let cursor = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate()
        )
      );

      while (cursor <= end) {
        const dayStart = new Date(cursor);
        const dayEnd = new Date(cursor);
        dayEnd.setUTCDate(dayEnd.getDate() + 1);

        const blocked = blocks.some(
          (b) => b.startTime < dayEnd && b.endTime > dayStart
        );

        if (blocked) {
          calender.push({
            date: dayStart.toISOString(),
            status: "UNAVAILABLE",
            remainingCapacity: 0,
          });
          cursor = dayEnd;
          continue;
        }
        const usedCapacity = booking.reduce((sum, b) => {
          return b.startDate < dayEnd && b.endDate > dayStart
            ? sum + b.capacity
            : sum;
        }, 0);

        const remaining = Math.max(property.capacity - usedCapacity, 0);
        calender.push({
          date: dayStart.toISOString(),
          status:
            remaining === 0
              ? "SOLD_OUT"
              : remaining < property.capacity
              ? "LIMITED"
              : "AVAILABLE",
          remainingCapacity: remaining,
        });
        cursor = dayEnd;
      }
      return res.json({
        propertyId,
        calender,
      });
    } catch (error) {
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static bookingAvailability = async (
    req: Request<AvaiabilityParams, {}, {}, AvaiabilityQuery>,
    res: Response
  ) => {
    try {
      const { propertyId } = req.params;
      const { startDate, endDate } = req.query;
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return res.status(400).json({
          msg: "Invalid date range",
        });
      }
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { capacity: true, status: true },
      });

      if (
        !property ||
        property.status === PropertyStatus.DELETED ||
        property.status !== PropertyStatus.ACTIVE
      ) {
        return res.json({
          msg: "UNAVAILABLE",
        });
      }

      const blocked = await prisma.propertyAvailability.findFirst({
        where: {
          propertyId,
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });
      if (blocked) {
        return res.json({
          msg: "UNAVAILABLE",
        });
      }

      const booking = await prisma.booking.findMany({
        where: {
          propertyId,
          status: BookingStatus.CONFIRMED,
          startDate: { lt: end },
          endDate: { gt: start },
        },
        select: { startDate: true, endDate: true, capacity: true },
      });

      let remaining = property.capacity;
      let cursor = new Date(
        Date.UTC(
          start.getUTCFullYear(),
          start.getUTCMonth(),
          start.getUTCDate()
        )
      );
      while (cursor < end) {
        const dayStart = new Date(cursor);
        const dayEnd = new Date(cursor);
        dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);

        const usedCapacity = booking.reduce((sum, b) => {
          return b.startDate < dayEnd && b.endDate > dayStart
            ? sum + b.capacity
            : sum;
        }, 0);

        remaining = Math.min(remaining, property.capacity - usedCapacity);
        cursor = dayEnd;
        // let status: "AVAILABLE" | "LIMITED" | "SOLD_OUT";
        // if (remaining === 0) status = "SOLD_OUT";
        // else if (remaining < property.capacity) status = "LIMITED";
        // else status = "AVAILABLE";

        return res.status(200).json({
          status:
            remaining === 0
              ? "SOLD_OUT"
              : remaining < property.capacity
              ? "LIMITED"
              : "AVAILABLE",
          maxBookingCapacity: Math.max(remaining, 0),
        });
      }
    } catch (error) {
      console.error("Availability error", error);
      return res.status(500).json({
        msg: "Server error",
      });
    }
  };
}
