import axiosInstance from "@/lib/axios";
import {
  AdminInspectionResponse,
  CustomerInspectionResponse,
  CreateInspectionRequest,
  UpdateInspectionRequest,
  InspectionRespondRequest,
} from "@/types";

export const inspectionService = {
  createPreInspection: async (data: CreateInspectionRequest): Promise<AdminInspectionResponse> => {
    const response = await axiosInstance.post("/admin/inspections/pre-inspection", data);
    return response.data;
  },
  createPostInspection: async (data: CreateInspectionRequest): Promise<AdminInspectionResponse> => {
    const response = await axiosInstance.post("/admin/inspections/post-inspection", data);
    return response.data;
  },
  updateInspection: async (inspectionId: string, data: UpdateInspectionRequest): Promise<AdminInspectionResponse> => {
    const response = await axiosInstance.patch(`/admin/inspections/${inspectionId}/update`, data);
    return response.data;
  },
  getBookingInspectionsForAdmin: async (bookingId: string): Promise<AdminInspectionResponse[]> => {
    const response = await axiosInstance.get(`/admin/bookings/${bookingId}/inspections`);
    return response.data;
  },
  respondToInspection: async (inspectionId: string, data: InspectionRespondRequest): Promise<CustomerInspectionResponse> => {
    const response = await axiosInstance.patch(`/inspections/${inspectionId}/respond`, data);
    return response.data;
  },
  getBookingInspectionsForCustomer: async (bookingId: string): Promise<CustomerInspectionResponse[]> => {
    const response = await axiosInstance.get(`/bookings/${bookingId}/inspections`);
    return response.data;
  },
  uploadDamagePhotos: async (bookingId: string, files: File[]): Promise<string[]> => {
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    const response = await axiosInstance.post(`/admin/${bookingId}/damage-photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
