import axiosInstance from "@/lib/axios";
import { UserListResponse } from "@/types";

export const superAdminService = {
  getAllAdmins: async (): Promise<UserListResponse> => {
    const response = await axiosInstance.get("/super-admin/admins");
    return response.data;
  },
  assignAdminRole: async (userId: string): Promise<string> => {
    const response = await axiosInstance.patch(`/super-admin/user/${userId}/assign-admin`);
    return response.data;
  },
  revokeAdminRole: async (userId: string): Promise<string> => {
    const response = await axiosInstance.patch(`/super-admin/user/${userId}`);
    return response.data;
  },
};
