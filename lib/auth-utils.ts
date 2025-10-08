import { jwtDecode } from "jwt-decode";

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface DecodedToken {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

// Token management utilities
export const TOKEN_KEY = "accessToken";

export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
};

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    return jwtDecode<DecodedToken>(token);
  } catch {
    return null;
  }
};

export const getUserFromToken = (token: string): any | null => {
  const decoded = decodeToken(token);
  if (!decoded) return null;

  return {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
  };
};

// Get token from cookies (for server-side)
export const getTokenFromCookies = (
  cookieHeader: string | null,
  tokenKey: string
): string | null => {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies[tokenKey] || null;
};
