import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import {
  type AppointmentFilters,
  type CreateAppointmentData,
  type UpdateAppointmentData,
  type CancelAppointmentData,
  type AppointmentsApiResponse,
  type AppointmentApiResponse,
  type AppointmentStatsApiResponse,
} from "@/types/appointment";

export const appointmentApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get all appointments (admin only)
    getAllAppointments: builder.query<
      AppointmentsApiResponse,
      AppointmentFilters
    >({
      query: (params) => ({
        url: "/appointments",
        params,
      }),
      providesTags: [{ type: tagTypes.appointment, id: "LIST" }],
    }),

    // Get current patient's appointments
    getMyAppointments: builder.query<
      AppointmentsApiResponse,
      AppointmentFilters
    >({
      query: (params) => ({
        url: "/appointments/my-appointments",
        params,
      }),
      providesTags: [{ type: tagTypes.appointment, id: "MY_APPOINTMENTS" }],
    }),

    // Get current doctor's appointments
    getDoctorAppointments: builder.query<
      AppointmentsApiResponse,
      AppointmentFilters
    >({
      query: (params) => {
        // Filter out empty or "all" status values
        const cleanParams = { ...params } as any;
        if (cleanParams.status === "all" || cleanParams.status === "") {
          delete cleanParams.status;
        }
        return {
          url: "/appointments/doctor-appointments",
          params: cleanParams,
        };
      },
      providesTags: [{ type: tagTypes.appointment, id: "DOCTOR_APPOINTMENTS" }],
    }),

    // Get appointment by ID
    getAppointmentById: builder.query<AppointmentApiResponse, string>({
      query: (id) => `/appointments/${id}`,
      providesTags: [{ type: tagTypes.appointment, id: "DETAIL" }],
    }),

    // Create a new appointment
    createAppointment: builder.mutation<
      AppointmentApiResponse,
      CreateAppointmentData
    >({
      query: (data) => ({
        url: "/appointments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.appointment, id: "LIST" },
        { type: tagTypes.appointment, id: "MY_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "DOCTOR_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "STATS" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "MULTIPLE_AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "DATE_RANGE_AVAILABLE_SLOTS" },
      ],
    }),

    // Update appointment
    updateAppointment: builder.mutation<
      AppointmentApiResponse,
      { id: string; data: UpdateAppointmentData }
    >({
      query: ({ id, data }) => ({
        url: `/appointments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.appointment, id: "LIST" },
        { type: tagTypes.appointment, id: "MY_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "DOCTOR_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "DETAIL" },
        { type: tagTypes.appointment, id: "STATS" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "MULTIPLE_AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "DATE_RANGE_AVAILABLE_SLOTS" },
      ],
    }),

    // Cancel appointment
    cancelAppointment: builder.mutation<
      AppointmentApiResponse,
      { id: string; data: CancelAppointmentData }
    >({
      query: ({ id, data }) => ({
        url: `/appointments/${id}/cancel`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.appointment, id: "LIST" },
        { type: tagTypes.appointment, id: "MY_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "DOCTOR_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "DETAIL" },
        { type: tagTypes.appointment, id: "STATS" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "MULTIPLE_AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "DATE_RANGE_AVAILABLE_SLOTS" },
      ],
    }),

    // Delete appointment (admin only)
    deleteAppointment: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/appointments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: tagTypes.appointment, id: "LIST" },
        { type: tagTypes.appointment, id: "MY_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "DOCTOR_APPOINTMENTS" },
        { type: tagTypes.appointment, id: "STATS" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "MULTIPLE_AVAILABLE_SLOTS" },
        { type: tagTypes.schedule, id: "DATE_RANGE_AVAILABLE_SLOTS" },
      ],
    }),

    // Get appointment statistics
    getAppointmentStats: builder.query<AppointmentStatsApiResponse, void>({
      query: () => "/appointments/stats/overview",
      providesTags: [{ type: tagTypes.appointment, id: "STATS" }],
    }),

    // Get appointments by date range
    getAppointmentsByDateRange: builder.query<
      AppointmentsApiResponse,
      { startDate: string; endDate: string }
    >({
      query: ({ startDate, endDate }) => ({
        url: "/appointments",
        params: { dateFrom: startDate, dateTo: endDate },
      }),
      providesTags: [{ type: tagTypes.appointment, id: "BY_DATE_RANGE" }],
    }),

    // Get upcoming appointments
    getUpcomingAppointments: builder.query<
      AppointmentsApiResponse,
      { limit?: number }
    >({
      query: ({ limit = 5 } = {}) => ({
        url: "/appointments/my-appointments",
        params: {
          status: "scheduled,confirmed",
          dateFrom: new Date().toISOString().split("T")[0],
          limit,
        },
      }),
      providesTags: [{ type: tagTypes.appointment, id: "UPCOMING" }],
    }),

    // Get appointment history
    getAppointmentHistory: builder.query<
      AppointmentsApiResponse,
      AppointmentFilters
    >({
      query: (params) => ({
        url: "/appointments/my-appointments",
        params: {
          ...params,
          status: "completed,cancelled,no_show",
          dateTo: new Date().toISOString().split("T")[0],
        },
      }),
      providesTags: [{ type: tagTypes.appointment, id: "HISTORY" }],
    }),

    // Get patient's appointments for a specific date
    getPatientAppointmentsForDate: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          date: string;
          appointments: Array<{
            id: string;
            startTime: string;
            endTime: string;
            status: string;
            type: string;
            reason: string;
            doctor: {
              id: string;
              name: string;
              specialization: string;
              consultationFee: number;
            };
          }>;
        };
      },
      string
    >({
      query: (date) => `/appointments/my-appointments/date/${date}`,
      providesTags: [{ type: tagTypes.appointment, id: "BY_DATE" }],
    }),
  }),
});

export const {
  useGetAllAppointmentsQuery,
  useGetMyAppointmentsQuery,
  useGetDoctorAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
  useDeleteAppointmentMutation,
  useGetAppointmentStatsQuery,
  useGetAppointmentsByDateRangeQuery,
  useGetUpcomingAppointmentsQuery,
  useGetAppointmentHistoryQuery,
  useGetPatientAppointmentsForDateQuery,
} = appointmentApi;
