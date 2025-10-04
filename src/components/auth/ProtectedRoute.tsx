"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export function ProtectedRoute({
  children,
  requiredRoles = [],
  requiredPermissions = [],
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      // Check roles
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) =>
          user.roles.includes(role)
        );
        if (!hasRequiredRole) {
          router.push("/unauthorized");
          return;
        }
      }

      // Check permissions
      if (requiredPermissions.length > 0) {
        const hasRequiredPermission = requiredPermissions.some((permission) =>
          user.permissions.includes(permission)
        );
        if (!hasRequiredPermission) {
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    requiredRoles,
    requiredPermissions,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
