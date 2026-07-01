import axiosInstance from "@/lib/axios";
import { AdminCreateCustomerRequest, AdminCreateCustomerResponse, AdminUpdateCustomerRequest, UserListResponse, UserResponse } from "@/types";

export const customerServices = {
  createCustomerAccount: async (
    data: AdminCreateCustomerRequest,
  ): Promise<AdminCreateCustomerResponse> => {
    const response = await axiosInstance.post(
      "/admin/users/create-account-for-customer",
      data,
    );
    return response.data;
  },
  getAllCustomers: async (): Promise<UserListResponse> => {
    const response = await axiosInstance.get("/admin/customers");
    return response.data;
  },
  getCustomer: async (id: string): Promise<UserResponse> => {
    const response = await axiosInstance.get(`/admin/customers/${id}`);
    return response.data;
  },
  activateUser: async (id: string): Promise<string> => {
    const response = await axiosInstance.patch(`/admin/users/${id}/activate`);
    return response.data;
  },
  deactivateUser: async (id: string): Promise<string> => {
    const response = await axiosInstance.patch(`/admin/users/${id}/deactivate`);
    return response.data;
  },
  verifyUser: async (id: string): Promise<string> => {
    const response = await axiosInstance.patch(`/admin/users/${id}/verify`);
    return response.data;
  },
  unverifyUser: async (id: string): Promise<string> => {
    const response = await axiosInstance.patch(`/admin/users/${id}/unverify`);
    return response.data;
  },
  updateCustomer: async (id: string, data: AdminUpdateCustomerRequest): Promise<UserResponse> => {
    const response = await axiosInstance.patch(`/admin/users/${id}`, data);
    return response.data;
  },
  adminUploadIdFront: async (userId: string, file: File): Promise<void> => {
    const form = new FormData();
    form.append("photo", file);
    await axiosInstance.post(`/admin/users/${userId}/id-photos/front`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  adminUploadIdBack: async (userId: string, file: File): Promise<void> => {
    const form = new FormData();
    form.append("photo", file);
    await axiosInstance.post(`/admin/users/${userId}/id-photos/back`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  adminUploadProfilePhoto: async (userId: string, file: File): Promise<void> => {
    const form = new FormData();
    form.append("photo", file);
    await axiosInstance.post(`/admin/users/${userId}/profile-photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteIdFrontPhoto: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/users/${userId}/id-photos/front`);
  },
  deleteIdBackPhoto: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/users/${userId}/id-photos/back`);
  },
  deleteProfilePhoto: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/users/${userId}/profile-photo`);
  },
};
