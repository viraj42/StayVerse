import { apiRequest } from "./apiClient";

export const getAllListings = () =>
  apiRequest("/listings");

export const getListingById = (id) =>
  apiRequest(`/listings/${id}`);

export const getHostListings = () =>
  apiRequest("/listings/host/my-listings", "GET", null, true);

export const createListing = (data) =>
  apiRequest("/listings", "POST", data, true);

export const updateListing = (id, data) =>
  apiRequest(`/listings/${id}`, "PUT", data, true);

export const deleteListing = (id) =>
  apiRequest(`/listings/${id}`, "DELETE", null, true);

export const browseByPropertyType = (propertyType) =>
  apiRequest(`/listings/browse/type/${propertyType}`);

// Explore by location (city > state > country)
export const exploreByLocation = (params) => {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/listings/explore?${query}`);
};

export const ratedListings=()=>{
  return  apiRequest("/listings/highly-rated")
}
// Global trending listings (public)
export const getTrendingListings = () =>
  apiRequest("/listings/trending");

// Hot deals
export const getHotDeals = () =>
  apiRequest("/listings/hot-deals");

// Related listings
export const getRelatedListings = (listingId) =>
  apiRequest(`/listings/${listingId}/related`);