import { apiRequest } from "./apiClient";

export const getHostDashboard = () =>
  apiRequest("/host/dashboard", "GET", null, true);
