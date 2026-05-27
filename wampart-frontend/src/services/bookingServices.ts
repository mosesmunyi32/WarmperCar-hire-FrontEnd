import axiosInstance from "@/lib/axios";
import { AdminBooking, AdminBookingRequest, AdminDirectBookingRequest, ApproveBookingExtensionRequest, Booking, BookingExtensionRequest, BookingExtensionResponse, BookingHistoryResponse, BookingRequest } from "@/types";

export const bookingService = {
  createBooking: async (data: BookingRequest): Promise<Booking> => {
    const response = await axiosInstance.post("/bookings", data);
    return response.data;
  },
  getMyBookings: async (): Promise<Booking[]> => {
    const response = await axiosInstance.get("/bookings/my-bookings");
    return response.data;
  },
  getBookingById: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.get(`/bookings/${id}`);
    return response.data;
  },
  cancelBooking: async (id: string): Promise<Booking> => {
    const response = await axiosInstance.patch(`/bookings/${id}/cancel`);
    return response.data;
  },
  getAllBookings: async (): Promise<AdminBooking[]> => {
    const response = await axiosInstance.get("/admin/bookings");
    return response.data;
  },
  getBookingByIdForAdmin: async (id: string): Promise<AdminBooking> => {
    const response = await axiosInstance.get(`/admin/bookings/${id}`);
    return response.data;
  },
  createBookingForCustomer: async (data: AdminBookingRequest): Promise<AdminBooking> => {
    const response = await axiosInstance.post("/admin/bookings/create-for-customer", data);
    return response.data;
  },
  createDirectBookingForCustomer: async (
    data: AdminDirectBookingRequest,
  ): Promise<AdminBooking> => {
    const response = await axiosInstance.post(
      "/admin/bookings/create-for-customer",
      data,
    );
    return response.data;
  },
  approveOrRejectBooking: async (
    id: string,
    data: { bookingStatus: string; adminNote?: string },
  ): Promise<AdminBooking> => {
    const response = await axiosInstance.patch(`/admin/bookings/${id}/approve`, data);
    return response.data;
  },
  recordMileageStart: async (
    id: string,
    data: { mileageStart: number },
  ): Promise<AdminBooking> => {
    const response = await axiosInstance.patch(`/admin/bookings/${id}/mileage-start`, data);
    return response.data;
  },
  recordMileageEnd: async (
    id: string,
    data: { mileageEnd: number },
  ): Promise<AdminBooking> => {
    const response = await axiosInstance.patch(`/admin/bookings/${id}/mileage-end`, data);
    return response.data;
  },
  completeTrip: async (
    id: string,
    data: { mileageEnd: number },
  ): Promise<AdminBooking> => {
    const response = await axiosInstance.patch(`/admin/bookings/${id}/complete`, data);
    return response.data;
  },
  getCustomerBookings: async (userId: string): Promise<AdminBooking[]> => {
    const response = await axiosInstance.get(`/admin/bookings/customer/${userId}`);
    return response.data;
  },
  getCarBookings: async (carId: string): Promise<AdminBooking[]> => {
    const response = await axiosInstance.get(`/admin/bookings/car/${carId}`);
    return response.data;
  },
  reassignCar: async (bookingId: string, numberPlate: string, adminNote?: string): Promise<AdminBooking> => {
    const response = await axiosInstance.patch(`/admin/bookings/${bookingId}/reassign`, { newCarNumberPlate: numberPlate, ...(adminNote ? { adminNote } : {}) });
    return response.data;
  },
  getMyBookingHistory: async (): Promise<BookingHistoryResponse[]> => {
    const response = await axiosInstance.get("/bookings/my-booking-history");
    return response.data;
  },
  getCarBookingHistory: async (carId: string): Promise<BookingHistoryResponse[]> => {
    const response = await axiosInstance.get(`/admin/cars/${carId}/booking-history`);
    return response.data;
  },
  getUserBookingHistory: async (userId: string): Promise<BookingHistoryResponse[]> => {
    const response = await axiosInstance.get(`/admin/customers/${userId}/booking-history`);
    return response.data;
  },

  generateReceipt: async (bookingId: string): Promise<string> => {
    const response = await axiosInstance.post(`/admin/bookings/${bookingId}/generate-receipt`);
    return response.data;
  },

  getReceiptUrl: async (bookingId: string): Promise<string> => {
    const response = await axiosInstance.get(`/bookings/${bookingId}/receipt`);
    return response.data;
  },

  // ── Extensions ──────────────────────────────────────────────────────────────
  createExtension: async (data: BookingExtensionRequest): Promise<BookingExtensionResponse> => {
    const response = await axiosInstance.post("/bookings/extensions", data);
    return response.data;
  },
  getMyExtensions: async (): Promise<BookingExtensionResponse[]> => {
    const response = await axiosInstance.get("/bookings/extensions/my-extensions");
    return response.data;
  },
  getExtensionsByBookingId: async (bookingId: string): Promise<BookingExtensionResponse[]> => {
    const response = await axiosInstance.get(`/admin/bookings/${bookingId}/extensions`);
    return response.data;
  },
  getAllExtensions: async (): Promise<BookingExtensionResponse[]> => {
    const response = await axiosInstance.get("/admin/extensions");
    return response.data;
  },
  approveOrRejectExtension: async (data: ApproveBookingExtensionRequest): Promise<BookingExtensionResponse> => {
    const response = await axiosInstance.patch("/admin/extensions/approve", data);
    return response.data;
  },
};
