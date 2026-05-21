import axiosInstance from "@/lib/axios";
import {
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  passwordChangeReqest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from "@/types";

export const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
  },
  requestPasswordChange: async (
    data: passwordChangeReqest,
  ): Promise<AuthResponse> => {
    const response = await axiosInstance.post(
      "/auth/security/change-password",
      data,
    );
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<string> => {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<string> => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
  },
};
