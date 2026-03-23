import { api } from "./api";

export const reviewsService = {
  // Get current user's reviews
  getReviews: () => api.get("/reviews/me"),

  // Get reviews for a specific property
  getPropertyReviews: (propertyId: string, page = 1) =>
    api.get(`/reviews/property/${propertyId}`, { params: { page } }),

  // Create a review
  createReview: (data: {
    bookingId: string;
    rating: number;
    comment: string;
  }) => api.post("/reviews/add", data),

  // Update a review
  updateReview: (
    reviewId: string,
    data: { rating?: number; comment?: string },
  ) => api.patch(`/reviews/edit/${reviewId}`, data),

  // Delete a review
  deleteReview: (reviewId: string) => api.patch(`/reviews/delete/${reviewId}`),

  // Get user's reviews
  getUserReviews: () => api.get("/reviews/me"),
};
