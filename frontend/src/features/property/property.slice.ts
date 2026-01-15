import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  CreatePropertyPayload,
  PropertyListResponse,
  PropertyPayload,
  UpdatePropertyPayload,
} from "./property.types";
import {
  CreatePropertyApi,
  GetAllApi,
  getOwnerPropertyApi,
  getSingleApi,
  updatePropertyApi,
} from "./property.api";

type PropertyState = {
  all: {
    items: PropertyPayload[];
    current: PropertyPayload | null;
    page: number;
    total: number;
    totalPage: number;
  };
  owner: {
    items: PropertyPayload[];
    current: PropertyPayload | null;
    page: number;
    total: number;
    totalPage: number;
  };
  // selectedProperty: string | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
};

const initialState: PropertyState = {
  all: {
    items: [],
    current: null,
    page: 1,
    total: 0,
    totalPage: 0,
  },
  owner: {
    items: [],
    current: null,
    page: 1,
    total: 0,
    totalPage: 0,
  },
  isLoading: false,
  error: null,
  isSuccess: false,
};

export const createProperty = createAsyncThunk<
  PropertyPayload,
  CreatePropertyPayload
>("property/create", async (payload, { rejectWithValue }) => {
  try {
    return await CreatePropertyApi(payload);
  } catch (error) {
    return rejectWithValue(error.response?.data.msg || "Create Property Error");
  }
});

export const getAllProperteis = createAsyncThunk<PropertyListResponse, number>(
  "property/getAll",
  async (page: number, { rejectWithValue }) => {
    try {
      return await GetAllApi(page);
    } catch (error) {
      return rejectWithValue(
        error.response?.data.msg || "Failed to fetch Property "
      );
    }
  }
);

export const getSingleProperteis = createAsyncThunk<PropertyPayload, string>(
  "property/getSingle",
  async (id, { rejectWithValue }) => {
    try {
      return await getSingleApi(id);
    } catch (error) {
      return rejectWithValue(
        error.response.data.msg || "Failed to fetch Property"
      );
    }
  }
);

export const getOwnerProperty = createAsyncThunk<PropertyListResponse, number>(
  "property/owner/me",
  async (page: number, { rejectWithValue }) => {
    try {
      return await getOwnerPropertyApi(page);
    } catch (error) {
      return rejectWithValue(
        error.response?.data.msg || "failed to fetch Property"
      );
    }
  }
);

export const updateProperty = createAsyncThunk<
  PropertyPayload,
  { id: string; data: UpdatePropertyPayload }
>("property/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await updatePropertyApi(id, data);
  } catch (error) {
    return rejectWithValue(
      error.response.data?.msg || "failed update property "
    );
  }
});
const propertieSlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    clearCurrentProperty: (state) => {
      state.all.current = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.owner.items.unshift(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getAllProperteis.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllProperteis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.all.items = action.payload.data;
        state.all.page = action.payload.page;
        state.all.total = action.payload.total;
        state.all.totalPage = action.payload.totalPage;
      })
      .addCase(getAllProperteis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getSingleProperteis.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSingleProperteis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.all.current = action.payload;
      })
      .addCase(getSingleProperteis.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(getOwnerProperty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOwnerProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.owner.items = action.payload.data;
        state.owner.page = action.payload.page;
        state.owner.total = action.payload.total;
        state.owner.totalPage = action.payload.totalPage;
      })
      .addCase(getOwnerProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("UPDATE PAYLOAD:", action.payload);
        state.all.current = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentProperty } = propertieSlice.actions;
export default propertieSlice.reducer;
