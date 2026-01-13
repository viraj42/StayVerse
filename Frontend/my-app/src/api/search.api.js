import {apiRequest} from "./apiClient"

// Location autocomplete (guest only)
export const locationAutocomplete = (query) =>
  apiRequest(`/search/locations?q=${query}`);

// Destination suggestions (guest only)
export const getDestinationSuggestions = () =>
  apiRequest("/search/suggestions");

export const getSearchListing=(params)=>{
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/search/listing?${query}`);
}