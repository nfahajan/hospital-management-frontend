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
  profile?: UserProfile;
}

export interface UserProfile {
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
}

// Legacy type for backward compatibility
export interface UserWithProfile extends User {}

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

// Constants for UI
export const USER_STATUSES = [
  {
    value: "pending",
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "approved",
    label: "Approved",
    color: "bg-green-100 text-green-800",
  },
  { value: "blocked", label: "Blocked", color: "bg-red-100 text-red-800" },
  { value: "declined", label: "Declined", color: "bg-gray-100 text-gray-800" },
  { value: "hold", label: "On Hold", color: "bg-orange-100 text-orange-800" },
];

export const USER_ROLES = [
  { value: "patient", label: "Patient" },
  { value: "doctor", label: "Doctor" },
  { value: "admin", label: "Admin" },
  { value: "superadmin", label: "Super Admin" },
];

export const AUTH_TYPES = [
  { value: "standard", label: "Standard" },
  { value: "google", label: "Google" },
  { value: "facebook", label: "Facebook" },
];

export const USER_PERMISSIONS = [
  { value: "view_patients", label: "View Patients" },
  { value: "create_appointments", label: "Create Appointments" },
  { value: "manage_users", label: "Manage Users" },
  { value: "view_reports", label: "View Reports" },
  { value: "system_config", label: "System Configuration" },
  { value: "manage_doctors", label: "Manage Doctors" },
  { value: "manage_schedules", label: "Manage Schedules" },
];
