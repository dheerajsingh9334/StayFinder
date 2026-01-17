import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AuthResponse,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
} from "./auth.types";
import {
  ChangePasswordApi,
  loginApi,
  logoutApi,
  profileApi,
  registerApi,
  updateProfileApi,
} from "./auth.api";
import axios from "axios";

type AuthState = {
  user: AuthUser | null;
  isloading: boolean;
  isSuccess: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isSuccess: false,
  isloading: true,
  error: null,
};

export const login = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    try {
      return await loginApi(payload);
    } catch (err: any) {
      return rejectWithValue(err.response.data?.msg || "login Failed");
    }
  }
);

export const register = createAsyncThunk<AuthResponse, SignupPayload>(
  "auth/register",
  async (payload, { rejectWithValue }) => {
    try {
      return await registerApi(payload);
    } catch (error: any) {
      console.log("er", error);

      if (axios.isAxiosError(error)) {
        return rejectWithValue(
          error.response?.data?.msg || "Registration failed"
        );
      }
      return rejectWithValue(error.response.data?.msg);
    }
  }
);

export const getProfile = createAsyncThunk<AuthResponse>(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      return await profileApi();
    } catch (err: any) {
      return rejectWithValue("unauthorized");
    }
  }
);
export const updateProfile = createAsyncThunk<
  AuthResponse,
  UpdateProfilePayload
>("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    return await updateProfileApi(payload);
  } catch (error) {
    return rejectWithValue(error.response.data?.msg || "Update profile error");
  }
});
export const logout = createAsyncThunk("auth/logout", async () => {
  await logoutApi();
});
export const changePassword = createAsyncThunk<
  { msg: string },
  ChangePasswordPayload
>("auth/password", async (payload, { rejectWithValue }) => {
  try {
    return await ChangePasswordApi(payload);
  } catch (error) {
    return rejectWithValue(
      error.response?.data?.msg || "Password change Failed"
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthFlags: (state) => {
      state.isSuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isloading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isloading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.pending, (state) => {
        state.isloading = true;
      })

      .addCase(login.rejected, (state, action) => {
        state.isloading = false;
        state.error = action.payload as string;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.isloading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })

      .addCase(getProfile.rejected, (state) => {
        state.isloading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(updateProfile.pending, (state) => {
        state.isloading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isloading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
        state.isloading = false;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isloading = false;
        state.error = action.payload as string;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(register.pending, (state) => {
        state.isloading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isloading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isSuccess = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.isloading = false;
        state.isSuccess = false;
        state.error = action.payload as string;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isSuccess = true;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(changePassword.pending, (state) => {
        state.isloading = true;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.isloading = false;
        state.isSuccess = false;
        state.error = action.payload as string;
      });
  },
});

export default authSlice.reducer;
export const { resetAuthFlags } = authSlice.actions;
