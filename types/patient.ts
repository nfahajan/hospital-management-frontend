export type Gender = "male" | "female" | "other";

export type BloodGroup =
  | "A+"
  | "A-"
  | "B+"
  | "B-"
  | "AB+"
  | "AB-"
  | "O+"
  | "O-";

export interface Patient {
  _id: string;
  user: {
    _id: string;
    email: string;
    status: string;
    roles: string[];
  };
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  bloodGroup?: BloodGroup;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  bloodGroup?: BloodGroup;
}

export interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  phoneNumber?: string;
  bloodGroup?: BloodGroup;
}

export interface PatientFilters {
  search?: string;
  gender?: Gender;
  bloodGroup?: BloodGroup;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
}

export interface PatientResponse {
  patients: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPatients: number;
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

export interface PatientApiResponse extends ApiResponse<Patient> {}
export interface PatientsApiResponse extends ApiResponse<PatientResponse> {}

// Constants for UI
export const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const BLOOD_GROUPS: { value: BloodGroup; label: string }[] = [
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
];

export const RELATIONSHIPS: { value: string; label: string }[] = [
  { value: "spouse", label: "Spouse" },
  { value: "parent", label: "Parent" },
  { value: "child", label: "Child" },
  { value: "sibling", label: "Sibling" },
  { value: "friend", label: "Friend" },
  { value: "other", label: "Other" },
];

export const COUNTRIES: { value: string; label: string }[] = [
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "UK", label: "United Kingdom" },
  { value: "AU", label: "Australia" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "JP", label: "Japan" },
  { value: "IN", label: "India" },
  { value: "BR", label: "Brazil" },
  { value: "MX", label: "Mexico" },
];
