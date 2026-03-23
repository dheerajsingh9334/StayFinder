import { authService } from "../../services/auth.services";

import type {
  AuthResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "./auth.types";

export const loginApi = async (
  loginData: LoginPayload,
): Promise<AuthResponse> => {
  const res = await authService.login(loginData);
  return res.data;
};

export const registerApi = async (
  signupData: SignupPayload,
): Promise<AuthResponse> => {
  const res = await authService.register(signupData);
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
  data: UpdateProfilePayload,
): Promise<AuthResponse> => {
  const res = await authService.updateProfile(data);
  return res.data;
};

export const ChangePasswordApi = async (
  data: ChangePasswordPayload,
): Promise<ChangePasswordResponse> => {
  const res = await authService.changePassword(data);
  return res.data;
};

export const sendOtpApi = async (email: string): Promise<{ msg: string }> => {
  const res = await authService.sendOtp(email);
  return res.data;
};

export const verifyOtpApi = async (
  email: string,
  code: string,
): Promise<AuthResponse> => {
  const res = await authService.verifyOtp(email, code);
  return res.data;
};
