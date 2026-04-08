import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { normalizeApiError, handleApiError } from "../utils/errorHandler";
import {
  dedupRequest,
  getCachedRequest,
  setCachedRequest,
} from "../utils/requestDedup";
import { isUnderRateLimit, circuitBreaker } from "../utils/rateLimiter";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Add auth, rate limiting, circuit breaker check
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] =
      `${Date.now()}-${Math.random().toString(36)}`;

    // Add timestamp for debugging
    config.headers["X-Request-Time"] = new Date().toISOString();

    // Check rate limits (strict for sensitive endpoints)
    if (config.url?.includes("/payment") || config.url?.includes("/login")) {
      if (!isUnderRateLimit(config.url, 5, 60000)) {
        // 5 requests per minute
        const error = new Error("Too many requests. Please wait.");
        return Promise.reject(error);
      }
    }

    // Check circuit breaker
    if (!circuitBreaker.canExecute(config.url || "")) {
      const error = new Error(
        "Service temporarily unavailable. Please try again.",
      );
      return Promise.reject(error);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401, retry failed requests, circuit breaker
api.interceptors.response.use(
  (response) => {
    const endpoint = response.config.url || "";
    circuitBreaker.recordSuccess(endpoint);

    // Cache GET requests
    if (response.config.method === "get") {
      setCachedRequest("GET", endpoint, response.data, 30000);
    }

    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Record failure for circuit breaker
    if (error.response?.status && error.response.status >= 500) {
      circuitBreaker.recordFailure(originalRequest?.url || "");
    }

    // Don't retry refresh endpoint itself
    if (originalRequest?.url?.includes("/auth/refreshToken")) {
      handleApiError(error, "Token refresh failed");
      return Promise.reject(error);
    }

    // Handle 401 - try token refresh using httpOnly cookies
    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        // Backend stores refresh token in httpOnly cookie.
        // Calling refresh endpoint is enough to renew access cookie.
        await api.post("/auth/refreshToken");

        // Retry original request after cookie refresh.
        if (originalRequest) {
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");

        const authPages = ["/login", "/register", "/otp-verification"];
        const isAuthPage = authPages.includes(window.location.pathname);

        if (!isAuthPage) {
          toast.error("Session expired. Please login again.", {
            id: "session-expired",
          });
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"] || 60;
      toast.error(`Too many requests. Please try again in ${retryAfter}s`);
    }

    // Network error handling
    if (!error.response) {
      handleApiError(error, `Network error: ${originalRequest?.url}`);
    }

    return Promise.reject(error);
  },
);

/**
 * Safe wrapper for API calls with dedup + error handling
 */
export async function safeApiCall<T>(
  method: string,
  endpoint: string,
  data?: any,
  options?: { skipDedup?: boolean; skipCache?: boolean },
): Promise<T> {
  try {
    // Try cache for GET requests
    if (method === "GET" && !options?.skipCache) {
      const cached = getCachedRequest<T>(endpoint);
      if (cached) {
        console.log(`[Cache Hit] ${method} ${endpoint}`);
        return cached;
      }
    }

    // Dedup identical requests
    if (!options?.skipDedup) {
      return await dedupRequest<T>(
        method,
        endpoint,
        () => {
          return api
            .request<T>({
              method,
              url: endpoint,
              data,
            })
            .then((r) => r.data);
        },
        data,
      );
    }

    // Direct API call
    const response = await api.request<T>({
      method,
      url: endpoint,
      data,
    });

    return response.data;
  } catch (error) {
    const normalizedError = normalizeApiError(error);
    handleApiError(normalizedError);
    throw normalizedError;
  }
}

export default api;
