export interface AddReviewsBody {
  bookingId: string;
  rating: number;
  comment: string;
}

export interface EditReviewBody {
  rating: number;
  comment: string;
}

export const REVIEW_WINDOW_DAYS: number = 14;
export const EDIT_REVIEW_WINDOW_DAYS: number = 1;
