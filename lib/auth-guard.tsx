"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

// Mock auth hook - replace with actual auth implementation
const useAuth = () => ({
  user: { id: "1", roles: ["patient"] },
  isLoading: false,
  isAuthenticated: true,
});

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = "/login",
  fallback,
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // If role is required, check if user has the required role
      if (requiredRole && user) {
        const userRoles = user.roles || [];
        const requiredRoles = Array.isArray(requiredRole)
          ? requiredRole
          : [requiredRole];

        const hasRequiredRole = requiredRoles.some((role) =>
          userRoles.includes(role)
        );

        if (!hasRequiredRole) {
          // Redirect to unauthorized page or dashboard
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // If not authenticated, don't render children (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // If role is required and user doesn't have it, don't render children
  if (requiredRole && user) {
    const userRoles = user.roles || [];
    const requiredRoles = Array.isArray(requiredRole)
      ? requiredRole
      : [requiredRole];

    const hasRequiredRole = requiredRoles.some((role: string) =>
      userRoles.includes(role)
    );

    if (!hasRequiredRole) {
      return null;
    }
  }

  return <>{children}</>;
}

// Specific guards for different user types
export function PatientGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="patient" redirectTo="/login" fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function DoctorGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AuthGuard requiredRole="doctor" redirectTo="/login" fallback={fallback}>
      {children}
    </AuthGuard>
  );
}

export function AdminGuard({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <AuthGuard
      requiredRole={["admin", "superadmin"]}
      redirectTo="/login"
      fallback={fallback}
    >
      {children}
    </AuthGuard>
  );
}

// Hook to check authentication status
export function useAuthGuard(requiredRole?: string | string[]) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const checkAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return false;
    }

    if (requiredRole && user) {
      const userRoles = user.roles || [];
      const requiredRoles = Array.isArray(requiredRole)
        ? requiredRole
        : [requiredRole];

      const hasRequiredRole = requiredRoles.some((role) =>
        userRoles.includes(role)
      );

      if (!hasRequiredRole) {
        router.push("/unauthorized");
        return false;
      }
    }

    return true;
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    checkAuth,
    hasRequiredRole: requiredRole
      ? (user?.roles || []).some((role) =>
          Array.isArray(requiredRole)
            ? requiredRole.includes(role)
            : role === requiredRole
        )
      : true,
  };
}
