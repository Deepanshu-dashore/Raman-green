import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import toast from "react-hot-toast";

export interface ApiResult<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

const api = axios.create({
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("rg-token") || localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear session local states
      localStorage.removeItem("rg-token");
      localStorage.removeItem("rg-user");
      localStorage.removeItem("adminToken");
      document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
      
      const currentPath = window.location.pathname;
      const isAdminPage = currentPath.startsWith("/admin");
      
      // Only redirect on protected paths (admin panel or customer checkout/account)
      const protectedCustomerPaths = ["/checkout", "/account"];
      const isProtectedCustomerPage = protectedCustomerPaths.some(path => currentPath.startsWith(path));
      
      if (isAdminPage && currentPath !== "/admin/login") {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/admin/login";
      } else if (isProtectedCustomerPage && currentPath !== "/login") {
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
      }
    }
    const message =
      error.response?.data?.message || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

/** Unwrap `{ success, message, data }` and throw if not successful */
export function unwrap<T>(response: AxiosResponse<ApiResult<T>>): ApiResult<T> {
  const body = response.data;
  if (!body.success) {
    throw new Error(body.message || "Request failed");
  }
  return body;
}

export async function get<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap<T>(await api.get<ApiResult<T>>(url, config));
}

export async function post<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return unwrap<T>(await api.post<ApiResult<T>>(url, data, config));
}

export async function put<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig
) {
  return unwrap<T>(await api.put<ApiResult<T>>(url, data, config));
}

export async function del<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap<T>(await api.delete<ApiResult<T>>(url, config));
}

/** POST multipart FormData (e.g. file upload) */
export async function postForm<T>(
  url: string,
  formData: FormData,
  config?: AxiosRequestConfig
) {
  return unwrap<T>(
    await api.post<ApiResult<T>>(url, formData, {
      ...config,
      headers: { ...config?.headers, "Content-Type": "multipart/form-data" },
    })
  );
}

export default api;
