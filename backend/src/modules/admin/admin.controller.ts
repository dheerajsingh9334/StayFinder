import { Response } from "express";
import { AuthRequest } from "../auth/auth.types";
import prisma from "../../utils/dbconnect";
import { Role } from "@prisma/client";

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
}
