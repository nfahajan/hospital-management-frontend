export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
export interface User {
  _id: any;
  email: string;
  password: string;
  auth_type: "standard" | "google" | "facebook";
  email_verified: Date | null;
  onboarding: Date | null;
  roles: string[];
  permissions: string[];
  status: "pending" | "approved" | "blocked" | "declined" | "hold";
  passwordChangedAt?: Date;
  lastLoggedIn: Date;
  createdAt: Date;
  updatedAt: Date;
}
