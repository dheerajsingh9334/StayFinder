import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthTokenPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: Role;
  };
}
export interface AvaiabilityParams {
  propertyId: string;
}

export interface AvaiabilityQuery {
  startDate: string;
  endDate: string;
}

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  role?: Role;
  phone?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UpdateProfileBody {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface ChangePassword {
  oldPassword: string;
  newPassword: string;
}
