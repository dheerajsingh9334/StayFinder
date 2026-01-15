import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  UpdateProfilePayload,
} from "./auth.types";
import { loginApi, logoutApi, profileApi, updateProfileApi } from "./auth.api";

type AuthState = {
  user: AuthUser | null;
  isloading: boolean;
  isAuthenticated: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isloading: false,
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

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
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
      });
  },
});

export default authSlice.reducer;
