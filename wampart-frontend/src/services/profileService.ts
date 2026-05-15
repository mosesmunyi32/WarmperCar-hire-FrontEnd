import axiosInstance from "@/lib/axios";
import {
  ChangePasswordRequest,
  ProfileUpdateRequest,
  UserResponse,
} from "@/types";

export const profileService = {
  getMyProfile: async (id: string): Promise<UserResponse> => {
    const response = await axiosInstance.get(`/profile/${id}`);
    return response.data;
  },

  updateProfile: async (
    id: string,
    data: ProfileUpdateRequest,
  ): Promise<UserResponse> => {
    const response = await axiosInstance.patch(`/users/profile/${id}`, data);
    return response.data;
  },

  updateProfilePhoto: async (
    id: string,
    formData: FormData,
  ): Promise<string> => {
    const response = await axiosInstance.post(
      `/users/${id}/profile-photo`,
      formData,
    );
    return response.data;
  },

  updateIdPhotos: async (id: string, formData: FormData): Promise<string> => {
    const response = await axiosInstance.post(
      `/users/${id}/id-photos`,
      formData,
    );
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await axiosInstance.post("/users/password/change", data);
  },

  uploadProfilePhoto: async (file: File): Promise<UserResponse> => {
    const form = new FormData();
    form.append("photo", file);
    const response = await axiosInstance.post("/users/profile/photo", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  uploadIdFront: async (file: File): Promise<UserResponse> => {
    const form = new FormData();
    form.append("photo", file);
    const response = await axiosInstance.post(
      "/users/documents/id-front",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  uploadIdBack: async (file: File): Promise<UserResponse> => {
    const form = new FormData();
    form.append("photo", file);
    const response = await axiosInstance.post(
      "/users/documents/id-back",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  uploadDriversLicencePhoto: async (file: File): Promise<UserResponse> => {
    const form = new FormData();
    form.append("photo", file);
    const response = await axiosInstance.post(
      "/users/documents/drivers-licence",
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
