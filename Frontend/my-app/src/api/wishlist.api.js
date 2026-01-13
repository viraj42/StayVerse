import { apiRequest } from "./apiClient";

export const getWishlist = () =>
  apiRequest("/wishlist", "GET", null, true);

export const addToWishlist = (listingId) =>
  apiRequest(`/wishlist/${listingId}`, "POST", null, true);

export const removeFromWishlist = (listingId) =>
  apiRequest(`/wishlist/${listingId}`, "DELETE", null, true);
