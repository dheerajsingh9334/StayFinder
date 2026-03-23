import { api } from "./api";
import { validationSchemas } from "../utils/validationSchemas";
import { handleApiError } from "../utils/errorHandler";
import {
  canSubmit,
  recordSubmission,
  invalidateCache,
} from "../utils/requestDedup";

import type {
  LoginPayload,
  //   SignupPayload,
  AuthResponse,
  UpdateProfilePayload,
  SignupPayload,
  ChangePasswordPayload,
  ChangePasswordResponse,
} from "../features/auth/auth.types";

export const authService = {
  /**
   * Login with validation and duplicate submission prevention
   */
  login: async (data: LoginPayload) => {
    // Validate input
    const validated = validationSchemas.auth.login.parse(data);

    // Prevent duplicate submissions
    if (!canSubmit("auth-login")) {
      throw new Error("Please wait before trying again");
    }
    recordSubmission("auth-login");

    try {
      const response = await api.post<AuthResponse>("/auth/login", validated);
      invalidateCache(); // Clear cache on login
      return response;
    } catch (error) {
      handleApiError(error, "Login failed");
      throw error;
    }
  },

  /**
   * Get current user profile
   */
  getProfile: async () => {
    try {
      const response = await api.get<AuthResponse>("/auth/me");
      return response;
    } catch (error) {
      handleApiError(error, "Failed to fetch profile");
      throw error;
    }
  },

  /**
   * Logout and clear cache
   */
  logout: async () => {
    try {
      invalidateCache();
      const response = await api.post("/auth/logout");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      return response;
    } catch (error) {
      handleApiError(error, "Logout failed");
      throw error;
    }
  },

  /**
   * Update profile with validation and duplicate prevention
   */
  updateProfile: async (data: UpdateProfilePayload) => {
    // Validate input
    const validated = validationSchemas.auth.updateProfile.parse(data);

    // Prevent duplicate submissions
    if (!canSubmit("auth-profile")) {
      throw new Error("Please wait before updating again");
    }
    recordSubmission("auth-profile");

    try {
      const response = await api.patch<AuthResponse>(
        "/auth/updateProfile",
        validated,
      );
      invalidateCache("profile"); // Invalidate profile cache
      return response;
    } catch (error) {
      handleApiError(error, "Profile update failed");
      throw error;
    }
  },

  /**
   * Register new user with validation and duplicate prevention
   */
  register: async (data: SignupPayload) => {
    // Validate input
    const validated = validationSchemas.auth.register.parse(data);

    // Prevent duplicate submissions
    if (!canSubmit("auth-register")) {
      throw new Error("Please wait before trying again");
    }
    recordSubmission("auth-register");

    try {
      const response = await api.post<AuthResponse>(
        "/auth/register",
        validated,
      );
      return response;
    } catch (error) {
      handleApiError(error, "Registration failed");
      throw error;
    }
  },

  /**
   * Send OTP with validation and rate limiting
   */
  sendOtp: async (email: string) => {
    // Validate email
    const validated = validationSchemas.auth.otpSend.parse({ email });

    // Prevent duplicate OTP requests (5 min cooldown)
    if (!canSubmit("otp-send")) {
      throw new Error("Please wait before requesting another OTP");
    }
    recordSubmission("otp-send");

    try {
      const response = await api.post("/auth/otp/send", validated);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to send OTP");
      throw error;
    }
  },

  /**
   * Verify OTP with validation and duplicate prevention
   */
  verifyOtp: async (email: string, code: string) => {
    // Validate input
    const validated = validationSchemas.auth.otpVerify.parse({ email, code });

    // Prevent duplicate OTP verifications
    if (!canSubmit("otp-verify")) {
      throw new Error("Please wait before trying again");
    }
    recordSubmission("otp-verify");

    try {
      const response = await api.post("/auth/otp/verify", validated);
      return response;
    } catch (error) {
      handleApiError(error, "OTP verification failed");
      throw error;
    }
  },

  /**
   * Change password with validation and duplicate prevention
   */
  changePassword: async (data: ChangePasswordPayload) => {
    // Validate input
    const validated = validationSchemas.auth.changePassword.parse(data);

    // Prevent duplicate submissions
    if (!canSubmit("auth-password")) {
      throw new Error("Please wait before trying again");
    }
    recordSubmission("auth-password");

    try {
      const response = await api.patch<ChangePasswordResponse>(
        "/auth/password",
        validated,
      );
      return response;
    } catch (error) {
      handleApiError(error, "Password change failed");
      throw error;
    }
  },

  /**
   * Forgot password request
   */
  forgotPassword: async (email: string) => {
    // Validate email
    const validated = validationSchemas.auth.forgotPassword.parse({ email });

    // Prevent duplicate requests (5 min cooldown)
    if (!canSubmit("forgot-password")) {
      throw new Error("Please wait before requesting another reset email");
    }
    recordSubmission("forgot-password");

    try {
      const response = await api.post("/auth/otp/send", validated);
      return response;
    } catch (error) {
      handleApiError(error, "Failed to send reset email");
      throw error;
    }
  },

  /**
   * Reset password with validation
   */
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string,
  ) => {
    // Validate input
    validationSchemas.auth.resetPassword.parse({
      token,
      newPassword,
      confirmPassword,
    });

    const error = new Error("Password reset endpoint is unavailable");
    handleApiError(error, "Password reset failed");
    throw error;
  },
};
