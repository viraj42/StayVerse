import { apiRequest } from "./apiClient";

export const trackActivity = (data) =>
  apiRequest("/activity", "POST", data, true);

export const getRecentActivity = () =>
  apiRequest("/activity", "GET", null, true);

export const clearHistory = () =>
  apiRequest("/activity", "DELETE", null, true);
