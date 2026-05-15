import axiosInstance from "@/lib/axios";
import { AdminCar, Car, CarRequest } from "@/types";

export const carService = {
  getAllAvailableCars: async (): Promise<Car[]> => {
    const response = await axiosInstance.get("/cars");
    return response.data;
  },
  getAllCarsForAdmin: async (): Promise<AdminCar[]> => {
    const response = await axiosInstance.get("/admin/cars");
    return response.data;
  },
  getCarById: async (id: string): Promise<Car> => {
    const response = await axiosInstance.get(`/cars/${id}`);
    return response.data;
  },
  addCar: async (data: CarRequest): Promise<AdminCar> => {
    const response = await axiosInstance.post("/admin/addcars", data);
    return response.data;
  },
  updateCar: async (id: string, data: CarRequest): Promise<AdminCar> => {
    const response = await axiosInstance.patch(`/admin/cars/${id}`, data);
    return response.data;
  },
  deleteCar: async (id: string): Promise<string> => {
    const response = await axiosInstance.delete(`/admin/cars/${id}`);
    return response.data;
  },
  toggleAvailability: async (
    id: string,
  ): Promise<{ id: string; available: boolean }> => {
    const response = await axiosInstance.patch(
      `/admin/cars/${id}/availability`,
    );
    return response.data;
  },
  getAdminCarById: async (id: string): Promise<AdminCar> => {
    const response = await axiosInstance.get(`/admin/cars/${id}`);
    return response.data;
  },
  uploadCarImages: async (
    id: string,
    formData: FormData,
  ): Promise<AdminCar> => {
    const response = await axiosInstance.put(
      `/admin/cars/${id}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  postCarImages: async (id: string, formData: FormData) => {
    const response = await axiosInstance.post(
      `/admin/cars/${id}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // /admin/cars/{carId}/images

  deleteCarImage: async (id: string, imageUrl: string): Promise<AdminCar> => {
    const response = await axiosInstance.delete(`/admin/cars/${id}/images`, {
      params: {
        imageUrl,
      },
    });

    return response.data;
  },
};
