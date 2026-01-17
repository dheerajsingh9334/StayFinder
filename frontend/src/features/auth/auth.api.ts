import { data } from "react-router-dom";
import { authService } from "../../services/auth.services";

import type {
  AuthResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "./auth.types";

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await authService.login(data);
  return res.data;
};

export const registerApi = async (
  data: SignupPayload
): Promise<AuthResponse> => {
  const res = await authService.registred(data);
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

export const ChangePasswordApi = async (
  data: ChangePasswordPayload
): Promise<ChangePasswordResponse> => {
  const res = await authService.changePassword(data);
  return res.data;
};
