import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../../utils/dbconnect";
import bcrypt from "bcrypt";
import { Request, Response } from "express";

import {
  AuthRequest,
  AuthTokenPayload,
  ChangePassword,
  LoginBody,
  RegisterBody,
  UpdateProfileBody,
} from "./auth.types";
import { Role } from "@prisma/client";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
// !generateAccessToken
const generateAccessToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};
// !generateRefreshToken
const generateRefreshToken = (userId: string, role: Role) => {
  return jwt.sign(
    {
      userId,
      role,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
// !verifyRefreshToken
const verifyRefreshToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, REFRESH_TOKEN_SECRET) as AuthTokenPayload;
};

export default class AuthController {
  // !registerd
  static register = async (
    req: Request<{}, {}, RegisterBody>,
    res: Response
  ) => {
    try {
      const { name, email, password, role, phone } = req.body;
      const userRole: Role = (role as Role) || Role.USER;
      if (!name || !email || !password) {
        return res.status(400).json({ msg: "All fields required" });
      }

      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return res.status(400).json({ msg: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: userRole, phone },
      });

      const accessToken = generateAccessToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id, user.role);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(201).json({
        msg: "Registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("Register Error", error);
      return res.status(500).json({ msg: "Server Error" });
    }
  };
  // !login
  static login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          msg: "Email and Password is required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });
      if (!user) {
        return res.status(400).json({
          msg: "user not found ",
        });
      }

      const Ismatch = await bcrypt.compare(password, user.password);
      if (!Ismatch) {
        return res.status(400).json({
          msg: "Password does not match",
        });
      }

      const userRole: Role = user.role as Role;

      const accessToken = generateAccessToken(user.id, userRole);
      const refreshToken = generateRefreshToken(user.id, userRole);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({
        msg: "Login Successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      });
    } catch (error) {
      console.error("Login Error", error);
      return res.status(500).json({
        msg: "Server Error",
      });
    }
  };
  // !refreshToken
  static refreshToken = async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      // console.log(refreshToken);

      if (!refreshToken) {
        return res.status(401).json({
          msg: "Refresh Token Missing",
        });
      }

      const payload = verifyRefreshToken(refreshToken);
      const newAccessTOken = generateAccessToken(payload.userId, payload.role);

      res.cookie("accessToken", newAccessTOken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });

      return res.status(200).json({
        msg: "Access Token refreshed",
      });
    } catch (error) {
      console.error("Refresh Error", error);
      return res.status(401).json({
        msg: "INvalid or expired refresh TOken Login Again",
      });
    }
  };
  // !getProfile
  static getProfile = async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const profile = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          createdAt: true,
        },
      });
      if (!profile) {
        return res.status(404).json({
          msg: "User not found",
        });
      }

      return res.status(200).json({
        user: profile,
      });
    } catch (error) {
      console.error("get user Profile error", error);
      return res.status(500).json({
        msg: "Server error",
      });
    }
  };
  // !logout
  static logout = async (req: Request, res: Response) => {
    try {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      return res.status(200).json({
        msg: "Logout SuccessFUlly",
      });
    } catch (error) {
      console.error("Logout", error);
      return res.status(500).json({
        msg: "Logout faild",
      });
    }
  };
  // !updateProfile
  static updateProfile = async (req: AuthRequest, res: Response) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({
          msg: "Unautorized",
        });
      }

      const { name, phone, avatarUrl } = req.body as UpdateProfileBody;
      if (!name && !phone && !avatarUrl) {
        return res.status(401).json({
          msg: "Nothing to update",
        });
      }
      const updateProfile = await prisma.user.update({
        where: { id: user.userId },
        data: {
          name,
          phone,
          avatarUrl,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          avatarUrl: true,
        },
      });
      return res.status(200).json({
        msg: "Profile updated",
        user: updateProfile,
      });
    } catch (error) {
      console.error("updateProfile Error", error);
      return res.status(500).json({
        msg: "Server error",
      });
    }
  };
  // !changedPassword
  static changePassword = async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          msg: "Unauthorized",
        });
      }
      const { oldPassword, newPassword } = req.body as ChangePassword;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          msg: "old password and new password is req",
        });
      }
      // console.log("oldpass", oldPassword, "newpass", newPassword);

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        return res.status(404).json({
          msg: "User not Found",
        });
      }

      const Ismatch = await bcrypt.compare(oldPassword, user.password);
      if (!Ismatch) {
        return res.status(400).json({
          msg: "Old password is incorrect",
        });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
        },
      });

      return res.status(200).json({
        msg: "Password changed successfully",
      });
    } catch (error) {
      console.error("Password Error", error);
      return res.status(500).json({
        msg: "server Error",
        error: error,
      });
    }
  };
}
