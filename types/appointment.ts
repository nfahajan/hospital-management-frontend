export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type AppointmentType =
  | "consultation"
  | "follow_up"
  | "emergency"
  | "routine_checkup"
  | "specialist_referral";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimeSlot {
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  maxAppointments?: number;
  currentAppointments?: number;
}

export interface DaySchedule {
  dayOfWeek: DayOfWeek;
  isWorkingDay: boolean;
  timeSlots: TimeSlot[];
}

export interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  consultationFee: number;
  isAvailable: boolean;
  yearsOfExperience: number;
  user?: {
    email: string;
    status: string;
  };
}

export interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  user?: {
    email: string;
    status: string;
  };
}

export interface Appointment {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  schedule: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  symptoms?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  isUrgent: boolean;
  paymentStatus: "pending" | "paid" | "refunded";
  cancellationReason?: string;
  cancelledBy?: "patient" | "doctor" | "admin";
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId: string;
  appointmentDate: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  type: AppointmentType;
  reason: string;
  symptoms?: string;
  notes?: string;
  isUrgent?: boolean;
}

export interface UpdateAppointmentData {
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  reason?: string;
  symptoms?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  isUrgent?: boolean;
  actualDuration?: number;
  paymentStatus?: "pending" | "paid" | "refunded";
}

export interface CancelAppointmentData {
  cancellationReason: string;
  cancelledBy: "patient" | "doctor" | "admin";
}

export interface AppointmentFilters {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  type?: AppointmentType;
  dateFrom?: string;
  dateTo?: string;
  isUrgent?: boolean;
  page?: number;
  limit?: number;
}

export interface AppointmentStats {
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  todayAppointments: number;
  upcomingAppointments: number;
  revenue: number;
}

export interface AvailableSlot {
  date: string;
  dayOfWeek: DayOfWeek;
  timeSlot: TimeSlot;
  availableSpots: number;
}

export interface AppointmentResponse {
  appointments: Appointment[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalAppointments: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export interface AppointmentsApiResponse
  extends ApiResponse<AppointmentResponse> {}

export interface AppointmentApiResponse extends ApiResponse<Appointment> {}

export interface AvailableSlotsApiResponse
  extends ApiResponse<AvailableSlot[]> {}

export interface AppointmentStatsApiResponse
  extends ApiResponse<AppointmentStats> {}

// Constants for UI
export const APPOINTMENT_STATUSES: {
  value: AppointmentStatus;
  label: string;
  color: string;
  description: string;
}[] = [
  {
    value: "scheduled",
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800",
    description: "Appointment is scheduled",
  },
  {
    value: "confirmed",
    label: "Confirmed",
    color: "bg-green-100 text-green-800",
    description: "Appointment is confirmed",
  },
  {
    value: "in_progress",
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800",
    description: "Appointment is currently in progress",
  },
  {
    value: "completed",
    label: "Completed",
    color: "bg-gray-100 text-gray-800",
    description: "Appointment has been completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
    color: "bg-red-100 text-red-800",
    description: "Appointment has been cancelled",
  },
  {
    value: "no_show",
    label: "No Show",
    color: "bg-orange-100 text-orange-800",
    description: "Patient did not show up",
  },
];

export const APPOINTMENT_TYPES: {
  value: AppointmentType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "consultation",
    label: "Consultation",
    description: "General medical consultation",
    icon: "🩺",
  },
  {
    value: "follow_up",
    label: "Follow-up",
    description: "Follow-up appointment",
    icon: "📋",
  },
  {
    value: "emergency",
    label: "Emergency",
    description: "Emergency medical care",
    icon: "🚨",
  },
  {
    value: "routine_checkup",
    label: "Routine Checkup",
    description: "Regular health checkup",
    icon: "💊",
  },
  {
    value: "specialist_referral",
    label: "Specialist Referral",
    description: "Referral to specialist",
    icon: "👨‍⚕️",
  },
];

export const DAYS_OF_WEEK: {
  value: DayOfWeek;
  label: string;
  short: string;
}[] = [
  { value: "monday", label: "Monday", short: "Mon" },
  { value: "tuesday", label: "Tuesday", short: "Tue" },
  { value: "wednesday", label: "Wednesday", short: "Wed" },
  { value: "thursday", label: "Thursday", short: "Thu" },
  { value: "friday", label: "Friday", short: "Fri" },
  { value: "saturday", label: "Saturday", short: "Sat" },
  { value: "sunday", label: "Sunday", short: "Sun" },
];

export const TIME_SLOTS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
];

export const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
];
