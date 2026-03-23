import { z } from "zod";

// ==================== AUTH VALIDATION ====================
export const authSchemas = {
  register: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be less than 50 characters"),
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain uppercase letter")
      .regex(/[0-9]/, "Password must contain number")
      .regex(/[!@#$%^&*]/, "Password must contain special character"),
    phone: z.string().regex(/^[0-9]{10}$/, "Phone must be 10 digits"),
    role: z.enum(["USER", "HOST", "ADMIN"]).optional(),
  }),

  login: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
    password: z.string().min(1, "Password required"),
  }),

  otpSend: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
  }),

  otpVerify: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
    code: z
      .string()
      .length(6, "OTP must be 6 digits")
      .regex(/^[0-9]+$/, "OTP must contain only numbers"),
  }),

  updateProfile: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone must be 10 digits")
      .optional(),
    avatarUrl: z.string().url("Invalid URL").optional(),
  }),

  changePassword: z
    .object({
      currentPassword: z.string().min(1, "Current password required"),
      newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain uppercase letter")
        .regex(/[0-9]/, "Password must contain number"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  forgotPassword: z.object({
    email: z.string().email("Invalid email address").toLowerCase(),
  }),

  resetPassword: z
    .object({
      token: z.string().min(1, "Reset token required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),
};

// ==================== PROPERTY VALIDATION ====================
export const propertySchemas = {
  create: z.object({
    title: z
      .string()
      .min(5, "Title must be at least 5 characters")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .min(20, "Description must be at least 20 characters")
      .max(5000, "Description too long"),
    price: z
      .number()
      .positive("Price must be positive")
      .max(999999, "Price too high"),
    country: z.string().default("India"),
    state: z.string().min(1, "State required"),
    city: z.string().min(1, "City required"),
    address: z.string().min(10, "Address must be at least 10 characters"),
    lat: z.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
    lng: z
      .number()
      .min(-180, "Invalid longitude")
      .max(180, "Invalid longitude"),
    capacity: z.number().positive("Capacity must be at least 1"),
    bedrooms: z.number().min(0, "Invalid bedrooms count"),
    bathrooms: z.number().min(0, "Invalid bathrooms count"),
    images: z
      .array(z.string().url("Invalid image URL"))
      .min(1, "At least 1 image required")
      .max(20, "Maximum 20 images allowed"),
    amenities: z.array(z.string()).optional(),
  }),

  update: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    price: z.number().positive().optional(),
    capacity: z.number().positive().optional(),
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    amenities: z.array(z.string()).optional(),
  }),

  search: z.object({
    query: z.string().min(1, "Search query required").optional(),
    city: z.string().optional(),
    priceMin: z.number().min(0).optional(),
    priceMax: z.number().min(0).optional(),
    capacity: z.number().min(1).optional(),
    bedrooms: z.number().min(0).optional(),
    amenities: z.array(z.string()).optional(),
  }),
};

// ==================== BOOKING VALIDATION ====================
export const bookingSchemas = {
  create: z
    .object({
      propertyId: z.string().min(1, "Property ID required"),
      startDate: z.string().min(1, "Start date required"),
      endDate: z.string().min(1, "End date required"),
      capacity: z.number().positive("Capacity must be at least 1"),
    })
    .refine(
      (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return !isNaN(start.getTime()) && !isNaN(end.getTime());
      },
      {
        message: "Invalid date format",
        path: ["startDate"],
      },
    )
    .refine(
      (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      },
      {
        message: "End date must be after start date",
        path: ["endDate"],
      },
    ),

  cancel: z.object({
    bookingId: z.string().min(1, "Booking ID required"),
    reason: z.string().optional(),
  }),
};

// ==================== REVIEW VALIDATION ====================
export const reviewSchemas = {
  create: z.object({
    propertyId: z.string().min(1, "Property ID required"),
    bookingId: z.string().min(1, "Booking ID required"),
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be 5 or less"),
    comment: z
      .string()
      .min(10, "Comment must be at least 10 characters")
      .max(1000, "Comment must be less than 1000 characters"),
  }),

  edit: z.object({
    rating: z
      .number()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be 5 or less")
      .optional(),
    comment: z
      .string()
      .min(10, "Comment must be at least 10 characters")
      .max(1000, "Comment must be less than 1000 characters")
      .optional(),
  }),
};

// ==================== PAYMENT VALIDATION ====================
export const paymentSchemas = {
  create: z.object({
    bookingId: z.string().min(1, "Booking ID required"),
    amount: z.number().positive("Amount must be positive"),
    currency: z.string().default("INR"),
  }),
};

// ==================== AVAILABILITY VALIDATION ====================
export const availabilitySchemas = {
  block: z
    .object({
      propertyId: z.string().min(1, "Property ID required"),
      startDate: z.string().datetime("Invalid date format"),
      endDate: z.string().datetime("Invalid date format"),
      reason: z.string().optional(),
    })
    .refine(
      (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
      },
      {
        message: "End date must be after start date",
        path: ["endDate"],
      },
    ),
};

// ==================== MESSAGE VALIDATION ====================
export const messageSchemas = {
  send: z.object({
    receiverId: z.string().min(1, "Receiver ID required"),
    content: z
      .string()
      .min(1, "Message cannot be empty")
      .max(5000, "Message too long"),
  }),
};

// Export all as single object for convenience
export const validationSchemas = {
  auth: authSchemas,
  property: propertySchemas,
  booking: bookingSchemas,
  review: reviewSchemas,
  payment: paymentSchemas,
  availability: availabilitySchemas,
  message: messageSchemas,
};

// Helper type inference
export type RegisterInput = z.infer<typeof authSchemas.register>;
export type LoginInput = z.infer<typeof authSchemas.login>;
export type CreatePropertyInput = z.infer<typeof propertySchemas.create>;
export type CreateBookingInput = z.infer<typeof bookingSchemas.create>;
export type CreateReviewInput = z.infer<typeof reviewSchemas.create>;
export type CreatePaymentInput = z.infer<typeof paymentSchemas.create>;
