/**
 * Rate Limiting & Request Throttling
 * Prevents abuse and respects backend rate limits
 */

interface RateLimit {
  maxRequests: number;
  windowMs: number;
  current: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();
const DEFAULT_RATE_LIMIT = 100; // requests per minute
const DEFAULT_WINDOW = 60000; // 60 seconds

/**
 * Check if request is within rate limit
 * @param endpoint API endpoint to rate limit
 * @param maxRequests Max requests allowed in window
 * @param windowMs Time window in milliseconds
 */
export function isUnderRateLimit(
  endpoint: string,
  maxRequests: number = DEFAULT_RATE_LIMIT,
  windowMs: number = DEFAULT_WINDOW,
): boolean {
  const now = Date.now();
  let limit = rateLimits.get(endpoint);

  if (!limit || now > limit.resetTime) {
    // Create or reset rate limit
    limit = {
      maxRequests,
      windowMs,
      current: 0,
      resetTime: now + windowMs,
    };
  }

  limit.current++;

  if (limit.current > maxRequests) {
    const waitTime = limit.resetTime - now;
    console.warn(
      `[Rate Limit] Exceeded for ${endpoint}. Wait ${Math.ceil(waitTime / 1000)}s`,
    );
    return false;
  }

  rateLimits.set(endpoint, limit);
  return true;
}

/**
 * Get remaining requests before hitting rate limit
 */
export function getRateLimitRemaining(endpoint: string): number {
  const limit = rateLimits.get(endpoint);
  if (!limit) return DEFAULT_RATE_LIMIT;

  if (Date.now() > limit.resetTime) {
    return limit.maxRequests;
  }

  return Math.max(0, limit.maxRequests - limit.current);
}

/**
 * Get time until rate limit resets (in ms)
 */
export function getRateLimitResetTime(endpoint: string): number {
  const limit = rateLimits.get(endpoint);
  if (!limit) return 0;

  const remaining = limit.resetTime - Date.now();
  return Math.max(0, remaining);
}

/**
 * Throttle function - execute at most once every N milliseconds
 */
export function createThrottledFunction<
  T extends (...args: any[]) => Promise<any>,
>(
  fn: T,
  delayMs: number = 1000,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let lastCall = 0;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let queuedArgs: Parameters<T> | null = null;

  return async (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delayMs) {
      // Execute immediately
      lastCall = now;
      return fn(...args);
    }

    // Queue for later execution
    queuedArgs = args;

    if (timeout) {
      clearTimeout(timeout);
    }

    return new Promise((resolve, reject) => {
      timeout = setTimeout(async () => {
        try {
          lastCall = Date.now();
          const result = await fn(...(queuedArgs || args));
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delayMs - timeSinceLastCall);
    });
  };
}

/**
 * Debounce function - execute only after N milliseconds of silence
 * Perfect for search, autocomplete, form validation
 */
export function createDebouncedFunction<
  T extends (...args: any[]) => Promise<any>,
>(
  fn: T,
  delayMs: number = 500,
): {
  execute: (...args: Parameters<T>) => Promise<ReturnType<T>>;
  cancel: () => void;
} {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return {
    execute: (...args: Parameters<T>) => {
      return new Promise((resolve, reject) => {
        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(async () => {
          try {
            const result = await fn(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, delayMs);
      });
    },

    cancel: () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    },
  };
}

/**
 * Priority-based request queue
 * Ensures critical requests (like payments) go first
 */
interface QueuedRequest {
  id: string;
  priority: number; // 0 = high, 10 = low
  execute: () => Promise<any>;
  retry: number;
}

class RequestQueue {
  private queue: QueuedRequest[] = [];
  private executing = false;
  private maxConcurrent = 3;
  private activeRequests = 0;

  enqueue(
    id: string,
    execute: () => Promise<any>,
    priority: number = 5,
    maxRetry: number = 3,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id,
        priority,
        execute: async () => {
          try {
            const result = await execute();
            resolve(result);
          } catch (error) {
            if (request.retry > 0) {
              request.retry--;
              this.queue.push(request); // Requeue with lower priority
              this.process();
            } else {
              reject(error);
            }
          }
        },
        retry: maxRetry,
      };

      this.queue.push(request);
      this.process();
    });
  }

  private process(): void {
    if (this.executing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    if (this.queue.length === 0) {
      this.executing = false;
      return;
    }

    this.executing = true;

    // Sort by priority (higher priority = lower number = first)
    this.queue.sort((a, b) => a.priority - b.priority);

    const request = this.queue.shift();
    if (request) {
      this.activeRequests++;

      request.execute().finally(() => {
        this.activeRequests--;
        this.process();
      });
    } else {
      this.executing = false;
    }
  }

  getPendingCount(): number {
    return this.queue.length + this.activeRequests;
  }

  clear(): void {
    this.queue = [];
  }
}

// Global request queue instance
export const globalRequestQueue = new RequestQueue();

/**
 * Helper to add request to queue
 */
export function queueRequest<T>(
  id: string,
  execute: () => Promise<T>,
  priority: number = 5,
  maxRetry: number = 3,
): Promise<T> {
  return globalRequestQueue.enqueue(id, execute, priority, maxRetry);
}

/**
 * Circuit breaker pattern
 * Stops sending requests to failing endpoint temporarily
 */
interface CircuitBreakerState {
  state: "CLOSED" | "OPEN" | "HALF_OPEN";
  failures: number;
  lastFailureTime: number;
  successCount: number;
}

class CircuitBreaker {
  private breakers = new Map<string, CircuitBreakerState>();
  private failureThreshold = 5;
  private successThreshold = 2;
  private timeout = 60000; // 1 minute

  canExecute(endpoint: string): boolean {
    const breaker = this.getBreaker(endpoint);

    if (breaker.state === "CLOSED") {
      return true;
    }

    if (breaker.state === "OPEN") {
      // Check if timeout expired, move to HALF_OPEN
      if (Date.now() - breaker.lastFailureTime > this.timeout) {
        breaker.state = "HALF_OPEN";
        breaker.successCount = 0;
        return true;
      }
      return false;
    }

    // HALF_OPEN - allow limited requests
    return breaker.successCount < this.successThreshold;
  }

  recordSuccess(endpoint: string): void {
    const breaker = this.getBreaker(endpoint);

    if (breaker.state === "CLOSED") {
      // Already good
      return;
    }

    if (breaker.state === "HALF_OPEN") {
      breaker.successCount++;
      if (breaker.successCount >= this.successThreshold) {
        breaker.state = "CLOSED";
        breaker.failures = 0;
      }
    }
  }

  recordFailure(endpoint: string): void {
    const breaker = this.getBreaker(endpoint);
    breaker.failures++;
    breaker.lastFailureTime = Date.now();

    if (breaker.state === "HALF_OPEN") {
      breaker.state = "OPEN";
      return;
    }

    if (breaker.failures >= this.failureThreshold) {
      breaker.state = "OPEN";
    }
  }

  private getBreaker(endpoint: string): CircuitBreakerState {
    if (!this.breakers.has(endpoint)) {
      this.breakers.set(endpoint, {
        state: "CLOSED",
        failures: 0,
        lastFailureTime: 0,
        successCount: 0,
      });
    }
    return this.breakers.get(endpoint)!;
  }

  getState(endpoint: string): string {
    return this.getBreaker(endpoint).state;
  }
}

export const circuitBreaker = new CircuitBreaker();
