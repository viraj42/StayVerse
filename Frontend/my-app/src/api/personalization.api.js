import { apiRequest } from "./apiClient";

export const getHomeFeed = () =>
  apiRequest("/my/home","GET", null, true);

export const getPersonalizedTrending = () =>
  apiRequest("/my/trending", "GET", null, true);