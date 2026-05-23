import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:9020/api/v1",
  // baseURL: "http://localhost:9020/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  async (config) => {
    // Let axios set Content-Type automatically for multipart uploads
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    let token: string | null = null;

    try {
      if (typeof window === "undefined") {
        // SERVER SIDE
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const raw = cookieStore.get("auth-storage")?.value;

        // 1. Decode URI component so JSON.parse doesn't fail
        if (raw) {
          const decoded = decodeURIComponent(raw);
          token = JSON.parse(decoded)?.state?.token;
        }
      } else {
        // CLIENT SIDE
        const raw = Cookies.get("auth-storage");
        if (raw) {
          token = JSON.parse(raw)?.state?.token;
        }
      }

      // 2. MOVE THIS HERE: Attach token regardless of if we are on server or client
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Axios Interceptor Error:", err);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 3. Only use window/Cookies.remove if we are in the browser
      if (typeof window !== "undefined") {
        Cookies.remove("auth-storage");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
