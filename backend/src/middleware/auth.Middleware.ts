import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { AuthRequest, AuthTokenPayload } from "../modules/auth/auth.types";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken as string | undefined;

    if (!token) {
      return res.status(401).json({
        msg: "Access token missing",
      });
    }

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET!
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
