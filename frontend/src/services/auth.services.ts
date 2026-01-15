import { api } from "./api";

import type {
  LoginPayload,
  //   SignupPayload,
  AuthResponse,
  UpdateProfilePayload,
} from "../features/auth/auth.types";

export const authService = {
  login: (data: LoginPayload) => api.post<AuthResponse>("/auth/login", data),
  getProfile: () => api.get<AuthResponse>("/auth/me"),
  logout: () => api.post("/auth/logout"),

  updateProfile: (data: UpdateProfilePayload) =>
    api.patch<AuthResponse>("/auth/updateProfile", data),
};
