import { apiRequest } from "./apiClient";

export const getHostListings = () =>
  apiRequest("/meta/facilities", "GET");