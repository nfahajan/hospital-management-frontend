import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import {
  type Doctor,
  type CreateDoctorData,
  type UpdateDoctorData,
  type DoctorFilters,
  type DoctorsResponse,
  type DoctorApiResponse,
  type DoctorsApiResponse,
} from "@/types/doctor";

export const doctorApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Public route - Get doctors by specialization (for booking)
    getDoctorsBySpecialization: builder.query({
      query: (specialization) => `/doctors/specialization/${specialization}`,
      providesTags: [{ type: tagTypes.doctor, id: "BY_SPECIALIZATION" }],
    }),

    // Protected routes - Authentication required
    getMyProfile: builder.query<DoctorApiResponse, void>({
      query: () => "/doctors/me",
      providesTags: [{ type: tagTypes.doctor, id: "MY_PROFILE" }],
    }),

    updateMyProfile: builder.mutation<DoctorApiResponse, UpdateDoctorData>({
      query: (data) => ({
        url: "/doctors/me",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.doctor, id: "MY_PROFILE" },
        { type: tagTypes.doctor, id: "LIST" },
        { type: tagTypes.doctor, id: "BY_SPECIALIZATION" },
      ],
    }),

    // Get doctor dashboard statistics
    getDoctorDashboardStats: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          overview: {
            totalAppointments: number;
            todayAppointments: number;
            upcomingAppointments: number;
            completedAppointments: number;
            cancelledAppointments: number;
            uniquePatients: number;
            completionRate: number;
            cancellationRate: number;
          };
          trends: {
            weekly: number;
            monthly: number;
            dailyTrends: Array<{
              _id: string;
              count: number;
              completed: number;
              cancelled: number;
            }>;
          };
          recentAppointments: Array<any>;
        };
      },
      void
    >({
      query: () => "/doctors/dashboard/stats",
      providesTags: [{ type: tagTypes.doctor, id: "DASHBOARD_STATS" }],
    }),

    // Admin only routes
    createDoctor: builder.mutation({
      query: (data) => ({
        url: "/doctors",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.doctor, id: "LIST" },
        { type: tagTypes.doctor, id: "BY_SPECIALIZATION" },
      ],
    }),

    // Public route - Get all doctors (for booking)
    getAllDoctors: builder.query({
      query: (params) => ({
        url: "/doctors",
        params,
      }),
      providesTags: [{ type: tagTypes.doctor, id: "LIST" }],
    }),

    getDoctorById: builder.query({
      query: (id) => `/doctors/${id}`,
      providesTags: [{ type: tagTypes.doctor, id: "DETAIL" }],
    }),

    updateDoctor: builder.mutation({
      query: ({ id, data }) => ({
        url: `/doctors/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.doctor, id: "LIST" },
        { type: tagTypes.doctor, id: "DETAIL" },
        { type: tagTypes.doctor, id: "MY_PROFILE" },
        { type: tagTypes.doctor, id: "BY_SPECIALIZATION" },
      ],
    }),

    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `/doctors/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: tagTypes.doctor, id: "LIST" },
        { type: tagTypes.doctor, id: "DETAIL" },
        { type: tagTypes.doctor, id: "BY_SPECIALIZATION" },
      ],
    }),
  }),
});

export const {
  useGetDoctorsBySpecializationQuery,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useGetDoctorDashboardStatsQuery,
  useCreateDoctorMutation,
  useGetAllDoctorsQuery,
  useGetDoctorByIdQuery,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorApi;
