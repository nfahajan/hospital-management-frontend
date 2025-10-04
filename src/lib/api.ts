import axios, { AxiosInstance, AxiosResponse } from "axios";
import { env } from "@/config/env";
import { ApiResponse } from "@/types";
import Cookies from "js-cookie";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: env.API_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get("accessToken");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = Cookies.get("refreshToken");
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              const { accessToken } = response.data as { accessToken: string };

              Cookies.set("accessToken", accessToken);
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;

              return this.client(originalRequest);
            }
          } catch {
            // Refresh failed, redirect to login
            this.clearTokens();
            window.location.href = "/auth/login";
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const response = await this.client.post("/auth/refresh", { refreshToken });
    return response.data;
  }

  public clearTokens() {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("user");
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post("/auth/login", { email, password });
    return response.data;
  }

  async register(data: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.post("/auth/register", data);
    return response.data;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.client.post("/auth/logout");
    this.clearTokens();
    return response.data;
  }

  // Apartment endpoints
  async getApartments(params?: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.get("/apartments", { params });
    return response.data;
  }

  async getApartment(id: string): Promise<ApiResponse> {
    const response = await this.client.get(`/apartments/${id}`);
    return response.data;
  }

  async createApartment(data: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.post("/apartments", data);
    return response.data;
  }

  async updateApartment(
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    const response = await this.client.put(`/apartments/${id}`, data);
    return response.data;
  }

  async deleteApartment(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/apartments/${id}`);
    return response.data;
  }

  // Owner endpoints
  async getOwners(params?: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.get("/owners", { params });
    return response.data;
  }

  async getOwner(id: string): Promise<ApiResponse> {
    const response = await this.client.get(`/owners/${id}`);
    return response.data;
  }

  async createOwner(data: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.post("/owners", data);
    return response.data;
  }

  async updateOwner(
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    const response = await this.client.put(`/owners/${id}`, data);
    return response.data;
  }

  async deleteOwner(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/owners/${id}`);
    return response.data;
  }

  // Tenant endpoints
  async getTenants(params?: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.get("/tenants", { params });
    return response.data;
  }

  async getTenant(id: string): Promise<ApiResponse> {
    const response = await this.client.get(`/tenants/${id}`);
    return response.data;
  }

  async createTenant(data: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.post("/tenants", data);
    return response.data;
  }

  async updateTenant(
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    const response = await this.client.put(`/tenants/${id}`, data);
    return response.data;
  }

  async deleteTenant(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/tenants/${id}`);
    return response.data;
  }

  // Application endpoints
  async getApplications(
    params?: Record<string, unknown>
  ): Promise<ApiResponse> {
    const response = await this.client.get("/applications", { params });
    return response.data;
  }

  async getApplication(id: string): Promise<ApiResponse> {
    const response = await this.client.get(`/applications/${id}`);
    return response.data;
  }

  async createApplication(data: Record<string, unknown>): Promise<ApiResponse> {
    const response = await this.client.post("/applications", data);
    return response.data;
  }

  async updateApplication(
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    const response = await this.client.put(`/applications/${id}`, data);
    return response.data;
  }

  async deleteApplication(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/applications/${id}`);
    return response.data;
  }

  async reviewApplication(
    id: string,
    data: Record<string, unknown>
  ): Promise<ApiResponse> {
    const response = await this.client.post(`/applications/${id}/review`, data);
    return response.data;
  }
}

export const apiClient = new ApiClient();
