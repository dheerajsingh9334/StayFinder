import { authService } from "../../services/auth.services";

import type {
  AuthResponse,
  LoginPayload,
  UpdateProfilePayload,
} from "./auth.types";

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await authService.login(data);
  return res.data;
};

export const profileApi = async (): Promise<AuthResponse> => {
  const res = await authService.getProfile();
  return res.data;
};

export const logoutApi = async (): Promise<void> => {
  await authService.logout();
};

export const updateProfileApi = async (
  data: UpdateProfilePayload
): Promise<AuthResponse> => {
  const res = await authService.updateProfile(data);
  return res.data;
};
