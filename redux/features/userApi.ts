import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import { ApiResponse } from "@/types";

// User types
export interface User {
  _id: string;
  email: string;
  auth_type: "standard" | "google" | "facebook";
  email_verified: string | null;
  onboarding: string | null;
  roles: string[];
  permissions: string[];
  status: "pending" | "approved" | "blocked" | "declined" | "hold";
  passwordChangedAt: string;
  lastLoggedIn: string;
  createdAt: string;
  updatedAt: string;
  profile?: {
    type: "patient" | "doctor";
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    dateOfBirth: string;
    gender: string;
    // Patient specific fields
    bloodGroup?: string;
    // Doctor specific fields
    specialization?: string;
    licenseNumber?: string;
    yearsOfExperience?: number;
    consultationFee?: number;
    isAvailable?: boolean;
  };
}

export interface UserFilters {
  search?: string;
  status?: string;
  roles?: string[];
  auth_type?: string;
  page?: number;
  limit?: number;
}

export interface UserStats {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  activeUsers: number;
  pendingUsers: number;
  blockedUsers: number;
}

export interface UserResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface UpdateUserStatusData {
  status: "pending" | "approved" | "blocked" | "declined" | "hold";
  reason?: string;
}

export interface UpdateUserRolesData {
  roles: string[];
  permissions?: string[];
}

export interface BulkUpdateStatusData {
  userIds: string[];
  status: "pending" | "approved" | "blocked" | "declined" | "hold";
  reason?: string;
}

export const userApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all users with filtering and pagination
    getAllUsers: builder.query<ApiResponse<UserResponse>, UserFilters>({
      query: (params) => ({
        url: "/users",
        params,
      }),
      providesTags: [
        { type: tagTypes.user, id: "LIST" },
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.doctor, id: "LIST" },
      ],
    }),

    // Get user by ID
    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
      providesTags: [{ type: tagTypes.user, id: "DETAIL" }],
    }),

    // Update user status
    updateUserStatus: builder.mutation<
      ApiResponse<User>,
      { id: string; data: UpdateUserStatusData }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "LIST" },
        { type: tagTypes.user, id: "DETAIL" },
        { type: tagTypes.user, id: "STATS" },
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.doctor, id: "LIST" },
      ],
    }),

    // Update user roles and permissions
    updateUserRoles: builder.mutation<
      ApiResponse<User>,
      { id: string; data: UpdateUserRolesData }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/roles`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "LIST" },
        { type: tagTypes.user, id: "DETAIL" },
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.doctor, id: "LIST" },
      ],
    }),

    // Delete user
    deleteUser: builder.mutation<ApiResponse<null>, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "LIST" },
        { type: tagTypes.user, id: "DETAIL" },
        { type: tagTypes.user, id: "STATS" },
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.doctor, id: "LIST" },
      ],
    }),

    // Get user statistics
    getUserStats: builder.query<ApiResponse<UserStats>, void>({
      query: () => "/users/stats",
      providesTags: [{ type: tagTypes.user, id: "STATS" }],
    }),

    // Bulk update user status
    bulkUpdateUserStatus: builder.mutation<
      ApiResponse<{ modifiedCount: number }>,
      BulkUpdateStatusData
    >({
      query: (data) => ({
        url: "/users/bulk/status",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "LIST" },
        { type: tagTypes.user, id: "STATS" },
        { type: tagTypes.patient, id: "LIST" },
        { type: tagTypes.doctor, id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRolesMutation,
  useDeleteUserMutation,
  useGetUserStatsQuery,
  useBulkUpdateUserStatusMutation,
} = userApi;
