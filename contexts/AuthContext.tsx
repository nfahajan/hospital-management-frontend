"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { AuthTokens, getAccessToken, isTokenExpired } from "@/lib/auth-utils";
import { getBaseUrl } from "@/helper/config";
import { User } from "@/types";
import { clearTokens, setTokens } from "@/lib/set-token";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user;

  const refreshAuth = async () => {
    try {
      const accessToken = getAccessToken();

      if (!accessToken) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Check if access token is expired
      if (isTokenExpired(accessToken)) {
        // Try to refresh the token
        try {
          const response = await axios.post(`${getBaseUrl()}/auth/refresh`, {
            accessToken,
          });

          const newTokens: AuthTokens = response.data.data;
          await setTokens(newTokens.accessToken);

          // Get user data with new token
          const userResponse = await axios.get(`${getBaseUrl()}/auth/me`, {
            headers: {
              Authorization: `Bearer ${newTokens.accessToken}`,
            },
          });

          setUser(userResponse?.data?.data?.user);
        } catch (refreshError) {
          // Refresh failed, clear tokens and logout
          await clearTokens();
          setUser(null);
        }
      } else {
        // Token is still valid, get user data
        try {
          const userResponse = await axios.get(`${getBaseUrl()}/auth/me`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setUser(userResponse?.data?.data?.user);
        } catch (error) {
          // Token might be invalid, clear and logout
          await clearTokens();
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Auth refresh error:", error);
      await clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);

      const response = await axios.post(`${getBaseUrl()}/auth/login`, {
        email,
        password,
      });
      const { accessToken, user: loginUser } = response.data.data;
      const tokens: AuthTokens = { accessToken };

      // Store tokens
      await setTokens(tokens.accessToken);
      setUser(loginUser);
      // Redirect based on role
      if (loginUser.roles.includes("admin")) {
        router.push("/admin/dashboard");
      }
      if (loginUser.roles.includes("doctor")) {
        router.push("/doctor/dashboard");
      }
      if (loginUser.roles.includes("patient")) {
        router.push("/patient/dashboard");
      } else {
        router.push("/");
      }

      return { success: true };
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message || "Login failed. Please try again.";
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await clearTokens();
    setUser(null);
    router.push("/");
  };

  // Initialize auth on mount
  useEffect(() => {
    refreshAuth();
  }, []);

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && user) {
          // Token expired, try to refresh
          try {
            const accessToken = getAccessToken();
            if (accessToken) {
              const response = await axios.post(
                `${getBaseUrl()}/auth/refresh`,
                { accessToken }
              );

              const newTokens: AuthTokens = response.data.data;
              await setTokens(newTokens.accessToken);

              // Retry the original request with new token
              error.config.headers.Authorization = `Bearer ${newTokens.accessToken}`;
              return axios.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, logout
            await logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
