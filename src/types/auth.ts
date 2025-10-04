export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface User {
  _id: string;
  email: string;
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

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
