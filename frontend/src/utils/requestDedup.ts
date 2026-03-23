/**
 * Request Deduplication & Submission Prevention
 * Prevents duplicate API calls and payment double-charging
 */

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const requestCache = new Map<string, { data: any; timestamp: number }>();

const CACHE_TTL = 30000; // 30 seconds
const REQUEST_TIMEOUT = 45000; // 45 seconds - remove if no response

/**
 * Generate request key for deduplication
 * @param method HTTP method (GET, POST, PATCH, DELETE)
 * @param endpoint API endpoint path
 * @param data Request body/params
 */
function generateRequestKey(
  method: string,
  endpoint: string,
  data?: any,
): string {
  const dataString = data ? JSON.stringify(data) : "";
  return `${method}:${endpoint}:${dataString}`;
}

/**
 * Check if request is already pending
 * If yes, return the pending promise (deduplication)
 */
export function getPendingRequest<T>(key: string): Promise<T> | null {
  const pending = pendingRequests.get(key);

  if (pending) {
    // Check if request has timed out
    if (Date.now() - pending.timestamp > REQUEST_TIMEOUT) {
      pendingRequests.delete(key);
      return null;
    }

    return pending.promise;
  }

  return null;
}

/**
 * Register a pending request
 * Used before making API calls to track in-flight requests
 */
export function registerPendingRequest<T>(
  key: string,
  promise: Promise<T>,
): Promise<T> {
  pendingRequests.set(key, {
    promise,
    timestamp: Date.now(),
  });

  // Auto-cleanup after timeout
  setTimeout(() => {
    pendingRequests.delete(key);
  }, REQUEST_TIMEOUT);

  // Cleanup on promise settlement
  promise.finally(() => {
    pendingRequests.delete(key);
  });

  return promise;
}

/**
 * Deduplicated API request wrapper
 * Prevents duplicate simultaneous requests for same endpoint+data
 */
export async function dedupRequest<T>(
  method: string,
  endpoint: string,
  apiCall: () => Promise<T>,
  data?: any,
): Promise<T> {
  const key = generateRequestKey(method, endpoint, data);

  // Check if request already pending
  const pending = getPendingRequest<T>(key);
  if (pending) {
    console.warn(`[Dedup] Request already in flight: ${key}`);
    return pending;
  }

  // Make request and track it
  const promise = apiCall().finally(() => {
    // Check cache on success
    const cache = requestCache.get(key);
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }
  });

  return registerPendingRequest(key, promise);
}

/**
 * Cache GET request results
 * Reduces unnecessary API calls
 */
export function getCachedRequest<T>(key: string): T | null {
  const cache = requestCache.get(key);

  if (!cache) return null;

  // Check if cache expired
  if (Date.now() - cache.timestamp > CACHE_TTL) {
    requestCache.delete(key);
    return null;
  }

  return cache.data;
}

export function setCachedRequest<T>(
  method: string,
  endpoint: string,
  data: T,
  customTTL?: number,
): void {
  const key = generateRequestKey(method, endpoint);

  requestCache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Auto-clear cache after TTL
  if (customTTL) {
    setTimeout(() => {
      requestCache.delete(key);
    }, customTTL);
  } else {
    setTimeout(() => {
      requestCache.delete(key);
    }, CACHE_TTL);
  }
}

export function clearCache(): void {
  requestCache.clear();
}

export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    clearCache();
    return;
  }

  // Invalidate matching cache keys
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
}

/**
 * Anti-spam for form submissions
 * Prevents user from submitting same form multiple times rapidly
 */
const lastSubmissionTime = new Map<string, number>();
const SUBMISSION_COOLDOWN = 1000; // 1 second between submissions

export function canSubmit(formId: string): boolean {
  const lastTime = lastSubmissionTime.get(formId);

  if (!lastTime) {
    lastSubmissionTime.set(formId, Date.now());
    return true;
  }

  if (Date.now() - lastTime < SUBMISSION_COOLDOWN) {
    console.warn(`[Anti-Spam] Form submission too fast: ${formId}`);
    return false;
  }

  lastSubmissionTime.set(formId, Date.now());
  return true;
}

export function recordSubmission(formId: string): void {
  lastSubmissionTime.set(formId, Date.now());
}

/**
 * Payment-specific deduplication
 * Critical for preventing double charges
 * Uses both in-memory and localStorage for extra safety
 */
interface PaymentDedup {
  bookingId: string;
  amount: number;
  timestamp: number;
}

const PAYMENT_DEDUP_KEY = "stayfinder_pending_payments";

export function isPendingPayment(bookingId: string, amount: number): boolean {
  // Check in-memory
  const key = `payment:${bookingId}:${amount}`;
  const pending = getPendingRequest(key);
  if (pending) return true;

  // Check localStorage (persists across page refreshes)
  const stored = localStorage.getItem(PAYMENT_DEDUP_KEY);
  if (stored) {
    try {
      const payments: PaymentDedup[] = JSON.parse(stored);
      const found = payments.find(
        (p) => p.bookingId === bookingId && p.amount === amount,
      );

      if (found && Date.now() - found.timestamp < 60000) {
        // 60 second window
        return true;
      }
    } catch (e) {
      console.error("Failed to parse payment dedup:", e);
    }
  }

  return false;
}

export function markPaymentPending(bookingId: string, amount: number): void {
  const payment: PaymentDedup = {
    bookingId,
    amount,
    timestamp: Date.now(),
  };

  const stored = localStorage.getItem(PAYMENT_DEDUP_KEY);
  const payments: PaymentDedup[] = stored ? JSON.parse(stored) : [];

  // Remove old entries (>5 minutes old)
  const fresh = payments.filter((p) => Date.now() - p.timestamp < 300000);

  fresh.push(payment);
  localStorage.setItem(PAYMENT_DEDUP_KEY, JSON.stringify(fresh));
}

export function clearPaymentPending(bookingId: string, amount: number): void {
  const stored = localStorage.getItem(PAYMENT_DEDUP_KEY);
  if (!stored) return;

  try {
    const payments: PaymentDedup[] = JSON.parse(stored);
    const filtered = payments.filter(
      (p) => !(p.bookingId === bookingId && p.amount === amount),
    );

    if (filtered.length === 0) {
      localStorage.removeItem(PAYMENT_DEDUP_KEY);
    } else {
      localStorage.setItem(PAYMENT_DEDUP_KEY, JSON.stringify(filtered));
    }
  } catch (e) {
    console.error("Failed to clear payment dedup:", e);
  }
}
