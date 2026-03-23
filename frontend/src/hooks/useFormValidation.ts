import { useState, useCallback } from "react";
import { z } from "zod";
import { handleApiError, extractValidationErrors } from "../utils/errorHandler";
import { canSubmit, recordSubmission } from "../utils/requestDedup";

/**
 * Custom hook for handling form submission with:
 * - Input validation (Zod)
 * - Duplicate submission prevention
 * - Error handling (field-level + global)
 * - Loading state management
 */
export function useValidatedForm<T extends z.ZodSchema>(
  schema: T,
  onSubmit: (data: z.infer<T>) => Promise<any>,
  formId?: string,
) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  const validate = useCallback(
    (data: any) => {
      try {
        const validated = schema.parse(data);
        setErrors({});
        return { valid: true, data: validated };
      } catch (error: unknown) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Record<string, string> = {};
          error.issues.forEach((err: z.ZodIssue) => {
            const path = err.path.join(".");
            fieldErrors[path] = err.message;
          });
          setErrors(fieldErrors);
        }
        return { valid: false, data: null };
      }
    },
    [schema],
  );

  const handleSubmit = useCallback(
    async (formData: any) => {
      // Reset state
      setErrors({});
      setGlobalError("");
      setSuccess(false);

      // Validate input
      const { valid, data } = validate(formData);
      if (!valid || data === null) {
        return { success: false, data: null };
      }

      // Check duplicate submission
      const submissionId = formId || "form-submission";
      if (!canSubmit(submissionId)) {
        const msg = "Please wait before submitting again";
        setGlobalError(msg);
        return { success: false, data: null };
      }

      setLoading(true);
      recordSubmission(submissionId);

      try {
        const result = await onSubmit(data);
        setSuccess(true);
        return { success: true, data: result };
      } catch (error: any) {
        if (error.statusCode === 422) {
          // Validation errors from backend
          const fieldErrors = extractValidationErrors(error);
          setErrors(fieldErrors);
        } else {
          // Generic error
          const message =
            error.message || "An error occurred. Please try again.";
          setGlobalError(message);
          handleApiError(error);
        }
        return { success: false, data: null };
      } finally {
        setLoading(false);
      }
    },
    [validate, formId],
  );

  const clearErrors = useCallback(() => {
    setErrors({});
    setGlobalError("");
  }, []);

  return {
    loading,
    errors,
    globalError,
    success,
    handleSubmit,
    validate,
    clearErrors,
  };
}

/**
 * Hook for managing form field state with validation
 */
export function useFormField(
  initialValue: any = "",
  validate?: (value: any) => string | undefined,
) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | undefined>();
  const [touched, setTouched] = useState(false);

  const handleChange = useCallback(
    (newValue: any) => {
      setValue(newValue);

      // Validate on change if validator provided
      if (validate && touched) {
        const validationError = validate(newValue);
        setError(validationError);
      }
    },
    [validate, touched],
  );

  const handleBlur = useCallback(() => {
    setTouched(true);

    // Validate on blur
    if (validate) {
      const validationError = validate(value);
      setError(validationError);
    }
  }, [validate, value]);

  const reset = useCallback(() => {
    setValue(initialValue);
    setError(undefined);
    setTouched(false);
  }, [initialValue]);

  return {
    value,
    error,
    touched,
    setValue,
    handleChange,
    handleBlur,
    reset,
    isValid: !error && touched,
  };
}

/**
 * Hook for async operations with loading + error states
 */
export function useAsyncOperation<T>(operation: () => Promise<T>) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await operation();
      setData(result);
      return { success: true, data: result };
    } catch (err: any) {
      const message = err.message || "An error occurred";
      setError(message);
      handleApiError(err);
      return { success: false, data: null };
    } finally {
      setLoading(false);
    }
  }, [operation]);

  const reset = useCallback(() => {
    setLoading(false);
    setError("");
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
    isError: !!error,
    isSuccess: !error && data !== null,
  };
}

/**
 * Hook for managing API paginated data
 */
export function usePaginatedData<T>(
  fetchFn: (
    page: number,
    limit: number,
  ) => Promise<{ data: T[]; total: number }>,
  initialLimit: number = 10,
) {
  const [page, setPage] = useState(1);
  const [limit] = useState(initialLimit);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const loadPage = useCallback(
    async (pageNum: number) => {
      setLoading(true);
      setError("");

      try {
        const result = await fetchFn(pageNum, limit);
        setData(result.data);
        setTotal(result.total);
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, limit],
  );

  return {
    data,
    page,
    limit,
    total,
    loading,
    error,
    loadPage,
    nextPage: () => loadPage(page + 1),
    prevPage: () => loadPage(page - 1),
    hasNextPage: page * limit < total,
    hasPrevPage: page > 1,
    pageCount: Math.ceil(total / limit),
  };
}
