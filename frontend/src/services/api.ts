import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Agar refresh endpoint khud fail ho gaya
    if (originalRequest.url?.includes("/auth/refreshToken")) {
      return Promise.reject(error);
    }

    // Agar 401 aur retry nahi hua
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.post("/auth/refreshToken");
        return api(originalRequest);
      } catch (refreshError) {
        // Agar refresh bhi fail ho gaya → user not logged in
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
