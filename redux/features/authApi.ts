import { ApiResponse } from "@/types";
import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import { User } from "@/types/user";

interface ChangePasswordData {
  oldpassword: string;
  newpassword: string;
}

interface UpdateUserData {
  email?: string;
  phoneNumber?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
}

interface CurrentUserResponse {
  user: User;
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get current user info
    getCurrentUser: builder.query<ApiResponse<CurrentUserResponse>, void>({
      query: () => "/auth/me",
      providesTags: [{ type: tagTypes.user, id: "CURRENT" }],
    }),

    // Update current user profile
    updateCurrentUser: builder.mutation<ApiResponse<User>, UpdateUserData>({
      query: (data) => ({
        url: "/auth/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.user, id: "CURRENT" },
        { type: tagTypes.user, id: "LIST" },
      ],
    }),

    // Change password
    changePassword: builder.mutation<
      ApiResponse<{ message: string }>,
      ChangePasswordData
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: tagTypes.user, id: "CURRENT" }],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
} = authApi;
