import { apiRequest } from "./apiClient";

export const createReview = (data) =>
  apiRequest("/reviews", "POST", data, true);

export const getListingReviews = (listingId) =>
  apiRequest(`/reviews/listing/${listingId}`, "GET", null, true);
