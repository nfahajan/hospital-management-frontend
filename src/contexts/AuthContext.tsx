"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthState, LoginRequest, User } from "@/types";
import { apiClient } from "@/lib/api";
import Cookies from "js-cookie";
import { toast } from "sonner";

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const accessToken = Cookies.get("accessToken");
      const refreshToken = Cookies.get("refreshToken");
      const userData = Cookies.get("user");

      if (accessToken && refreshToken && userData) {
        const user = JSON.parse(userData);
        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const response = await apiClient.login(
        credentials.email,
        credentials.password
      );

      if (response.success && response.data) {
        const { user, accessToken, refreshToken } = response.data as {
          user: User;
          accessToken: string;
          refreshToken: string;
        };

        // Set cookies
        Cookies.set("accessToken", accessToken, { expires: 7 });
        Cookies.set("refreshToken", refreshToken, { expires: 30 });
        Cookies.set("user", JSON.stringify(user), { expires: 7 });

        setAuthState({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });

        toast.success("Login successful!");
      } else {
        throw new Error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      const errorMessage =
        (
          error as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "Login failed";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear cookies and state regardless of API call success
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user");

      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });

      toast.success("Logged out successfully");
    }
  };

  const refreshAuth = async () => {
    try {
      const refreshToken = Cookies.get("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await apiClient.refreshToken(refreshToken);

      if (response.success && response.data) {
        const { accessToken } = response.data as { accessToken: string };

        Cookies.set("accessToken", accessToken, { expires: 7 });

        setAuthState((prev) => ({
          ...prev,
          accessToken,
        }));
      }
    } catch (error) {
      console.error("Failed to refresh auth:", error);
      await logout();
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
