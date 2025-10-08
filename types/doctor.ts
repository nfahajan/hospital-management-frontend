export type Gender = "male" | "female" | "other";

export type Specialization =
  | "cardiology"
  | "dermatology"
  | "endocrinology"
  | "gastroenterology"
  | "general_medicine"
  | "neurology"
  | "oncology"
  | "orthopedics"
  | "pediatrics"
  | "psychiatry"
  | "radiology"
  | "surgery"
  | "urology"
  | "other";

export interface DoctorAvailableSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface CreateDoctorData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  specialization: Specialization;
  yearsOfExperience: number;
  bio?: string;
  consultationFee: number;
  availableSlots: DoctorAvailableSlot[];
  isAvailable?: boolean;
}

export interface Doctor {
  _id: string;
  user: {
    _id: string;
    email: string;
    roles: string[];
    status: string;
    createdAt: string;
  };
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  specialization: Specialization;
  yearsOfExperience: number;
  bio?: string;
  consultationFee: number;
  availableSlots: DoctorAvailableSlot[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
  fullName?: string;
  age?: number;
}

export interface UpdateDoctorData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phoneNumber?: string;
  specialization?: Specialization;
  yearsOfExperience?: number;
  bio?: string;
  consultationFee?: number;
  isAvailable?: boolean;
}

export interface DoctorApiResponse extends ApiResponse<Doctor> {}

export interface DoctorsResponse {
  doctors: Doctor[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalDoctors: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta: any;
  data: T;
}

export interface DoctorsApiResponse extends ApiResponse<DoctorsResponse> {}

export interface DoctorFilters {
  search?: string;
  specialization?: Specialization;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
}

export const SPECIALIZATIONS: { value: Specialization; label: string }[] = [
  { value: "cardiology", label: "Cardiology" },
  { value: "dermatology", label: "Dermatology" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "gastroenterology", label: "Gastroenterology" },
  { value: "general_medicine", label: "General Medicine" },
  { value: "neurology", label: "Neurology" },
  { value: "oncology", label: "Oncology" },
  { value: "orthopedics", label: "Orthopedics" },
  { value: "pediatrics", label: "Pediatrics" },
  { value: "psychiatry", label: "Psychiatry" },
  { value: "radiology", label: "Radiology" },
  { value: "surgery", label: "Surgery" },
  { value: "urology", label: "Urology" },
  { value: "other", label: "Other" },
];

export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const DAYS_OF_WEEK: { value: number; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];
