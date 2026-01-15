import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/auth.slice";
import propertyReducer from "../features/property/property.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
