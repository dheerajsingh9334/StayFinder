import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";

export default class AdminController {
  static getUsers = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const users = await prisma.user.findMany({
        // @ts-ignore
        select: { id: true, name: true, email: true, role: true, isBanned: true, isEmailVerified: true, createdAt: true },
        orderBy: { createdAt: "desc" }
      });
      return res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static getProperties = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
      const skip = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const status = (req.query.status as string) || "";

      const where: Record<string, unknown> = {};
      if (status && status !== "ALL") where.status = status;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { owner: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      const [properties, total] = await Promise.all([
        prisma.property.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }),
        prisma.property.count({ where }),
      ]);
      return res.status(200).json({
        data: properties,
        total,
        page,
        limit,
        totalPage: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };


  static createUser = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const { name, email, password, role, phone } = req.body;
      const userRole: Role = (role as Role) || Role.USER;
      
      if (!name || !email || !password) {
        return res.status(400).json({ msg: "Name, email, and password are required" });
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ msg: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        // verify email automatically since created by admin
        data: { name, email, password: hashedPassword, role: userRole, phone, isEmailVerified: true },
        select: { id: true, name: true, email: true, role: true, isBanned: true, isEmailVerified: true, createdAt: true }
      });

      return res.status(201).json({ msg: "User created successfully", user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static toggleBan = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const { id } = req.params;
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return res.status(404).json({ msg: "User not found" });

      const updated = await prisma.user.update({
        where: { id },
        // @ts-ignore
        data: { isBanned: !user.isBanned }
      });
      return res.status(200).json({ msg: "User ban status updated", user: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static verifyUser = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const { id } = req.params;
      const updated = await prisma.user.update({
        where: { id },
        data: { isEmailVerified: true }
      });
      return res.status(200).json({ msg: "User verified", user: updated });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static updatePropertyStatus = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const { id } = req.params;
      const { status } = req.body;
      const updated = await prisma.property.update({
        where: { id },
        data: { status }
      });
      return res.status(200).json({ msg: "Property status updated", property: updated });
    } catch (error) {
      console.error(error);
       return res.status(500).json({ msg: "Server Error" });
    }
  };

  static getBookings = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const bookings = await prisma.booking.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, title: true, ownerId: true } }
        }
      });
      return res.status(200).json({ data: bookings });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static getPayments = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const payments = await prisma.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          booking: { select: { id: true, propertyId: true, status: true } }
        }
      });
      return res.status(200).json({ data: payments });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static getReviews = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const reviews = await prisma.review.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          property: { select: { id: true, title: true } }
        }
      });
      return res.status(200).json({ data: reviews });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };

  static deleteReview = async (req: AuthRequest, res: Response) => {
    try {
      if (req.user?.role !== Role.ADMIN) return res.status(403).json({ msg: "Forbidden" });
      const { id } = req.params;
      await prisma.review.delete({ where: { id } });
      return res.status(200).json({ msg: "Review deleted successfully" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };
}

