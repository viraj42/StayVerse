import { apiRequest } from "./apiClient";

export const saveSearch = (data) =>
  apiRequest("/search-history", "POST", data, true);

export const getSearchHistory = () =>
  apiRequest("/search-history", "GET", null, true);
