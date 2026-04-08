import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { AuthRequest, AuthTokenPayload } from "../modules/auth/auth.types";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? ("none" as const) : ("lax" as const),
};

const signAccessToken = (userId: string, role: Role) => {
  return jwt.sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = req.cookies?.accessToken as string | undefined;

    // If access token is missing, fall back to refresh token and rotate.
    if (!token) {
      const refreshToken = req.cookies?.refreshToken as string | undefined;
      if (!refreshToken) {
        return res.status(401).json({
          msg: "Access token missing",
        });
      }

      const refreshPayload = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET!,
      ) as AuthTokenPayload;

      token = signAccessToken(refreshPayload.userId, refreshPayload.role);

      res.cookie("accessToken", token, {
        ...cookieOptions,
        maxAge: 15 * 60 * 1000,
      });
    }

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!,
    ) as AuthTokenPayload;

    // 👇 cast once, use safely
    (req as AuthRequest).user = {
      userId: payload.userId,
      role: payload.role,
    };

    next();
  } catch {
    return res.status(401).json({
      msg: "Invalid or expired token",
    });
  }
};

export const verifyRole = (role: Role[], message: string = "Forbidden") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthRequest).user;

    if (!user) {
      return res.status(401).json({
        msg: "Unauthorized",
      });
    }

    if (!role.includes(user.role)) {
      return res.status(403).json({
        msg: message,
      });
    }

    next();
  };
};
