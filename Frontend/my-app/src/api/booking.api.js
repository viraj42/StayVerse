import { apiRequest } from "./apiClient";

export const createBooking = (data) =>
  apiRequest("/bookings", "POST", data, true);

export const getGuestBookings = () =>
  apiRequest("/bookings/guest", "GET", null, true);

export const getHostBookings = () =>
  apiRequest("/bookings/host", "GET", null, true);

export const performBookingAction = (bookingId, status) =>
  apiRequest(`/bookings/${bookingId}`, "PATCH", { status }, true);

export const cancelGuestBooking = (bookingId) =>
  apiRequest(`/bookings/cancel/${bookingId}`, "DELETE", null, true);
