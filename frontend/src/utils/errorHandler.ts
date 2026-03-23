import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";

/**
 * Comprehensive API error handler
 * Handles all types of backend errors and returns consistent error format
 */

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: Record<string, string[]>;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  statusCode: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Normalize backend errors into consistent format
 * Handles various error response structures from inconsistent backend
 */
export function normalizeApiError(error: unknown): ApiErrorResponse {
  const timestamp = new Date().toISOString();

  // Network error (no response from server)
  if (axios.isAxiosError(error) && !error.response) {
    return {
      success: false,
      statusCode: 0,
      message: error.message || "Network error. Please check your connection.",
      timestamp,
    };
  }

  // Axios error with response
  if (axios.isAxiosError(error) && error.response) {
    const status = error.response.status;
    const data = error.response.data as any;

    // Handle different response structures
    const message =
      data?.message ||
      data?.error ||
      data?.msg ||
      error.message ||
      `Server error: ${status}`;

    const errors = data?.errors || data?.validationErrors;

    return {
      success: false,
      statusCode: status,
      message,
      ...(errors && { errors }),
      timestamp,
    };
  }

  // Generic errors
  if (error instanceof Error) {
    return {
      success: false,
      statusCode: 500,
      message: error.message,
      timestamp,
    };
  }

  // Unknown error
  return {
    success: false,
    statusCode: 500,
    message: "An unexpected error occurred",
    timestamp,
  };
}

/**
 * Format error message for user display
 * Converts technical errors into user-friendly messages
 */
export function formatErrorForUser(error: ApiErrorResponse | unknown): string {
  if (typeof error === "string") return error;
  if (!error || typeof error !== "object") return "An error occurred";

  const apiError =
    "statusCode" in error
      ? (error as ApiErrorResponse)
      : normalizeApiError(error);

  // Map status codes to user-friendly messages
  const statusMessages: Record<number, string> = {
    0: "Connection failed. Please check your internet.",
    400: "Invalid request. Please check your input.",
    401: "Session expired. Please login again.",
    403: "You do not have permission for this action.",
    404: "Resource not found.",
    409: "This action conflicts with existing data.",
    422: "Please check your input and try again.",
    429: "Too many requests. Please wait a moment.",
    500: "Server error. Please try again later.",
    503: "Service unavailable. Please try again later.",
  };

  return (
    statusMessages[apiError.statusCode] ||
    apiError.message ||
    "An error occurred"
  );
}

/**
 * Extract validation errors from API response
 * Returns field-level errors for form validation
 */
export function extractValidationErrors(
  error: ApiErrorResponse,
): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  if (error.errors) {
    Object.entries(error.errors).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
    });
  }

  return fieldErrors;
}

/**
 * Global error handler for API calls
 * Logs errors, shows notifications, tracks analytics
 */
export function handleApiError(error: unknown, context?: string) {
  const normalizedError = normalizeApiError(error);
  const userMessage = formatErrorForUser(normalizedError);

  // Log error for debugging (with context)
  console.error(`[API Error]${context ? ` ${context}` : ""}:`, {
    statusCode: normalizedError.statusCode,
    message: normalizedError.message,
    timestamp: normalizedError.timestamp,
  });

  // Don't show toast for validation errors (handled per-field)
  if (normalizedError.statusCode !== 422) {
    toast.error(userMessage, {
      duration: 5000,
      position: "top-right",
    });
  }

  return normalizedError;
}

/**
 * Create axios instance with defensive middleware
 * Adds retry, timeout, and error handling
 */
export function createApiClient(baseURL: string): AxiosInstance {
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 second timeout
    withCredentials: true, // Include cookies
  });

  // Request interceptor: Add auth token and request ID
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracking
      config.headers["X-Request-ID"] = `${Date.now()}-${Math.random()}`;

      return config;
    },
    (error) => Promise.reject(error),
  );

  // Response interceptor: Handle 401 and auto-refresh token
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      // If 401, try to refresh token
      if (error.response?.status === 401) {
        try {
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            const { data } = await axios.post(`${baseURL}/auth/refreshToken`, {
              refreshToken,
            });

            if (data.token) {
              localStorage.setItem("auth_token", data.token);

              // Retry original request with new token
              if (error.config) {
                error.config.headers.Authorization = `Bearer ${data.token}`;
                return client(error.config);
              }
            }
          }
        } catch (refreshError) {
          // Refresh failed, logout user
          localStorage.removeItem("auth_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

/**
 * Retry logic with exponential backoff
 * Prevents rate limiting and temporary failures
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delay = 1000,
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;

      // Don't retry on 4xx errors (except 429 rate limit)
      const statusCode = (error as AxiosError)?.response?.status;
      if (statusCode && statusCode < 500 && statusCode !== 429) {
        throw error;
      }

      if (isLastAttempt) throw error;

      // Exponential backoff: wait before retry
      const waitTime = delay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, waitTime));
    }
  }

  throw new Error("Max retries exceeded");
}
