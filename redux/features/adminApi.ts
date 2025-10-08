import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";

// Dashboard statistics interfaces
export interface DashboardStats {
  users: {
    total: number;
    patients: number;
    doctors: number;
    active: number;
    pending: number;
    blocked: number;
    engagementRate: number;
  };
  appointments: {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    today: number;
    upcoming: number;
    successRate: number;
    utilizationRate: number;
  };
  system: {
    health: "excellent" | "good" | "needs_attention";
    lastUpdated: string;
  };
}

export const adminApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get comprehensive dashboard statistics
    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => "/admin/dashboard/stats",
      providesTags: [{ type: tagTypes.user, id: "DASHBOARD_STATS" }],
    }),
  }),
});

export const { useGetDashboardStatsQuery } = adminApi;
