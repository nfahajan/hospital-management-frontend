import { z } from "zod";

// Appointment type validation
export const appointmentTypeSchema = z.enum([
  "consultation",
  "follow_up",
  "emergency",
  "routine_checkup",
  "specialist_referral",
]);

// Time validation (HH:MM format)
export const timeSchema = z
  .string()
  .regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
    "Please enter a valid time in HH:MM format"
  )
  .min(1, "Time is required");

// Date validation (YYYY-MM-DD format)
export const dateSchema = z
  .string()
  .min(1, "Date is required")
  .refine(
    (date) => {
      if (!date) return false;
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    {
      message: "Appointment date cannot be in the past",
    }
  );

// Create appointment schema
export const createAppointmentSchema = z
  .object({
    patientId: z.string().min(1, "Patient ID is required"),
    doctorId: z.string().min(1, "Please select a doctor"),
    appointmentDate: dateSchema,
    startTime: timeSchema,
    endTime: timeSchema,
    type: appointmentTypeSchema,
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters long")
      .max(500, "Reason cannot exceed 500 characters"),
    symptoms: z
      .string()
      .max(1000, "Symptoms cannot exceed 1000 characters")
      .optional(),
    isUrgent: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;

      const start = new Date(`2000-01-01T${data.startTime}:00`);
      const end = new Date(`2000-01-01T${data.endTime}:00`);

      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Update appointment schema
export const updateAppointmentSchema = z
  .object({
    appointmentDate: dateSchema.optional(),
    startTime: timeSchema.optional(),
    endTime: timeSchema.optional(),
    status: z
      .enum([
        "scheduled",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ])
      .optional(),
    type: appointmentTypeSchema.optional(),
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters long")
      .max(500, "Reason cannot exceed 500 characters")
      .optional(),
    symptoms: z
      .string()
      .max(1000, "Symptoms cannot exceed 1000 characters")
      .optional(),
    notes: z
      .string()
      .max(1000, "Notes cannot exceed 1000 characters")
      .optional(),
    isUrgent: z.boolean().optional(),
    paymentStatus: z.enum(["pending", "paid", "refunded"]).optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;

      const start = new Date(`2000-01-01T${data.startTime}:00`);
      const end = new Date(`2000-01-01T${data.endTime}:00`);

      return end > start;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

// Cancel appointment schema
export const cancelAppointmentSchema = z.object({
  cancellationReason: z
    .string()
    .min(10, "Cancellation reason must be at least 10 characters long")
    .max(500, "Cancellation reason cannot exceed 500 characters"),
  cancelledBy: z.enum(["patient", "doctor", "admin"]),
});

// Appointment filters schema
export const appointmentFiltersSchema = z.object({
  patientId: z.string().optional(),
  doctorId: z.string().optional(),
  status: z
    .enum([
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .optional(),
  type: appointmentTypeSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isUrgent: z.boolean().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

// Quick appointment booking schema (simplified for quick booking)
export const quickAppointmentSchema = z.object({
  doctorId: z.string().min(1, "Please select a doctor"),
  appointmentDate: dateSchema,
  startTime: timeSchema,
  type: appointmentTypeSchema,
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters long")
    .max(200, "Reason cannot exceed 200 characters"),
  isUrgent: z.boolean().optional().default(false),
});

// Appointment search schema
export const appointmentSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  filters: appointmentFiltersSchema.optional(),
});

// Recurring appointment schema
export const recurringAppointmentSchema = z
  .object({
    doctorId: z.string().min(1, "Please select a doctor"),
    startDate: dateSchema,
    endDate: z
      .string()
      .min(1, "End date is required")
      .refine(
        (date) => {
          if (!date) return false;
          const selectedDate = new Date(date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return selectedDate >= today;
        },
        {
          message: "End date cannot be in the past",
        }
      ),
    startTime: timeSchema,
    endTime: timeSchema,
    type: appointmentTypeSchema,
    reason: z
      .string()
      .min(10, "Reason must be at least 10 characters long")
      .max(500, "Reason cannot exceed 500 characters"),
    frequency: z.enum(["weekly", "biweekly", "monthly"]),
    daysOfWeek: z
      .array(
        z.enum([
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ])
      )
      .min(1, "Please select at least one day of the week"),
    isUrgent: z.boolean().optional().default(false),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  );

// Export types
export type CreateAppointmentFormData = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>;
export type CancelAppointmentFormData = z.infer<typeof cancelAppointmentSchema>;
export type AppointmentFiltersFormData = z.infer<
  typeof appointmentFiltersSchema
>;
export type QuickAppointmentFormData = z.infer<typeof quickAppointmentSchema>;
export type AppointmentSearchFormData = z.infer<typeof appointmentSearchSchema>;
export type RecurringAppointmentFormData = z.infer<
  typeof recurringAppointmentSchema
>;
