import { api } from "../api/api";
import { tagTypes } from "../tabTypesList";
import {
  type AvailableSlot,
  type AvailableSlotsApiResponse,
  type DaySchedule,
  type TimeSlot,
} from "@/types/appointment";

export const scheduleApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Get available slots for a doctor on a specific date (public endpoint)
    getAvailableSlots: builder.query<
      AvailableSlotsApiResponse,
      { doctorId: string; date: string }
    >({
      query: ({ doctorId, date }) => ({
        url: `/schedules/doctor/${doctorId}/available-slots/${date}`,
      }),
      providesTags: [{ type: tagTypes.schedule, id: "AVAILABLE_SLOTS" }],
    }),

    // Get current doctor's schedules
    getMySchedules: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => "/schedules/my-schedules",
      providesTags: [{ type: tagTypes.schedule, id: "MY_SCHEDULES" }],
    }),

    // Get current doctor's available slots for a specific date
    getMyAvailableSlots: builder.query<AvailableSlotsApiResponse, string>({
      query: (date) => `/schedules/my-available-slots/${date}`,
      providesTags: [{ type: tagTypes.schedule, id: "MY_AVAILABLE_SLOTS" }],
    }),

    // Get current doctor's schedule analytics
    getMyScheduleAnalytics: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          period: {
            startDate: string;
            endDate: string;
            days: number;
          };
          schedules: {
            total: number;
            active: number;
            totalSlots: number;
            availableSlots: number;
          };
          appointments: {
            total: number;
            completed: number;
            cancelled: number;
            scheduled: number;
            confirmed: number;
            noShow: number;
          };
          utilization: {
            overall: number;
            completionRate: number;
            cancellationRate: number;
            noShowRate: number;
          };
          dailyStats: Array<{
            date: string;
            day: string;
            totalSlots: number;
            bookedSlots: number;
            utilization: number;
            completed: number;
            cancelled: number;
          }>;
          timeSlotStats: Array<{
            time: string;
            appointments: number;
            completed: number;
            cancelled: number;
            revenue: number;
          }>;
          dayOfWeekStats: Array<{
            day: string;
            appointments: number;
            completed: number;
            cancelled: number;
          }>;
        };
      },
      { period?: string; dateFrom?: string; dateTo?: string }
    >({
      query: (params = {}) => ({
        url: "/schedules/my-analytics",
        params,
      }),
      providesTags: [{ type: tagTypes.schedule, id: "ANALYTICS" }],
    }),

    // Check if schedule exists for a specific date
    checkScheduleExists: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          exists: boolean;
          schedule: any | null;
          date: string;
          doctorId: string;
        };
      },
      string
    >({
      query: (date) => `/schedules/my-schedule/check/${date}`,
      providesTags: [{ type: tagTypes.schedule, id: "SCHEDULE_CHECK" }],
    }),

    // Trigger schedule check (for manual checking)
    triggerScheduleCheck: builder.mutation<
      {
        success: boolean;
        message: string;
        data: {
          exists: boolean;
          schedule: any | null;
          date: string;
          doctorId: string;
        };
      },
      string
    >({
      query: (date) => ({
        url: `/schedules/my-schedule/check/${date}`,
        method: "GET",
      }),
      invalidatesTags: [{ type: tagTypes.schedule, id: "SCHEDULE_CHECK" }],
    }),

    // Create my schedule (doctor only)
    createSchedule: builder.mutation<{ success: boolean; data: any }, any>({
      query: (data) => ({
        url: "/schedules/my-schedule",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.schedule, id: "LIST" },
        { type: tagTypes.schedule, id: "MY_SCHEDULES" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
      ],
    }),

    // Update my schedule (doctor only - own schedules)
    updateSchedule: builder.mutation<
      { success: boolean; data: any },
      { id: string; data: any }
    >({
      query: ({ id, data }) => ({
        url: `/schedules/my-schedule/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.schedule, id: "LIST" },
        { type: tagTypes.schedule, id: "MY_SCHEDULES" },
        { type: tagTypes.schedule, id: "DETAIL" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
      ],
    }),

    // Update specific day schedule
    updateDaySchedule: builder.mutation<
      { success: boolean; data: any },
      { id: string; dayOfWeek: string; data: any }
    >({
      query: ({ id, dayOfWeek, data }) => ({
        url: `/schedules/${id}/day/${dayOfWeek}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [
        { type: tagTypes.schedule, id: "LIST" },
        { type: tagTypes.schedule, id: "MY_SCHEDULES" },
        { type: tagTypes.schedule, id: "DETAIL" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
      ],
    }),

    // Get schedule by ID
    getScheduleById: builder.query<{ success: boolean; data: any }, string>({
      query: (id) => `/schedules/${id}`,
      providesTags: [{ type: tagTypes.schedule, id: "DETAIL" }],
    }),

    // Delete my schedule (doctor only - own schedules)
    deleteSchedule: builder.mutation<
      { success: boolean; message: string },
      string
    >({
      query: (id) => ({
        url: `/schedules/my-schedule/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: tagTypes.schedule, id: "LIST" },
        { type: tagTypes.schedule, id: "MY_SCHEDULES" },
        { type: tagTypes.schedule, id: "AVAILABLE_SLOTS" },
      ],
    }),

    // Get all schedules (admin only)
    getAllSchedules: builder.query<{ success: boolean; data: any[] }, void>({
      query: () => "/schedules",
      providesTags: [{ type: tagTypes.schedule, id: "LIST" }],
    }),

    // Get available slots for multiple doctors on a specific date
    getMultipleDoctorsAvailableSlots: builder.query<
      AvailableSlotsApiResponse,
      { doctorIds: string[]; date: string }
    >({
      queryFn: async (
        { doctorIds, date },
        _queryApi,
        _extraOptions,
        baseQuery
      ) => {
        try {
          const promises = doctorIds.map((doctorId) =>
            baseQuery({
              url: `/schedules/doctor/${doctorId}/available-slots/${date}`,
            })
          );

          const results = await Promise.all(promises);
          const allSlots: AvailableSlot[] = [];

          results.forEach((result: any) => {
            if (result.data?.success && result.data?.data) {
              allSlots.push(...result.data.data);
            }
          });

          return {
            data: {
              success: true,
              message: "Available slots retrieved successfully",
              data: allSlots,
            },
          };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to fetch available slots",
            },
          };
        }
      },
      providesTags: [
        { type: tagTypes.schedule, id: "MULTIPLE_AVAILABLE_SLOTS" },
      ],
    }),

    // Get available slots for a date range
    getAvailableSlotsForDateRange: builder.query<
      AvailableSlotsApiResponse,
      { doctorId: string; startDate: string; endDate: string }
    >({
      queryFn: async (
        { doctorId, startDate, endDate },
        _queryApi,
        _extraOptions,
        baseQuery
      ) => {
        try {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const promises = [];

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0];
            promises.push(
              baseQuery({
                url: `/schedules/doctor/${doctorId}/available-slots/${dateStr}`,
              })
            );
          }

          const results = await Promise.all(promises);
          const allSlots: AvailableSlot[] = [];

          results.forEach((result: any) => {
            if (result.data?.success && result.data?.data) {
              allSlots.push(...result.data.data);
            }
          });

          return {
            data: {
              success: true,
              message: "Available slots for date range retrieved successfully",
              data: allSlots,
            },
          };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              error: "Failed to fetch available slots for date range",
            },
          };
        }
      },
      providesTags: [
        { type: tagTypes.schedule, id: "DATE_RANGE_AVAILABLE_SLOTS" },
      ],
    }),
  }),
});

export const {
  useGetAvailableSlotsQuery,
  useGetMySchedulesQuery,
  useGetMyAvailableSlotsQuery,
  useGetMyScheduleAnalyticsQuery,
  useCheckScheduleExistsQuery,
  useTriggerScheduleCheckMutation,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useUpdateDayScheduleMutation,
  useGetScheduleByIdQuery,
  useDeleteScheduleMutation,
  useGetAllSchedulesQuery,
  useGetMultipleDoctorsAvailableSlotsQuery,
  useGetAvailableSlotsForDateRangeQuery,
} = scheduleApi;
