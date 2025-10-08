"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    // Redirect based on user role
    switch (user.roles?.[0]) {
      case "patient":
        router.push("/patient/dashboard");
        break;
      case "doctor":
        router.push("/doctor/dashboard");
        break;
      case "admin":
        router.push("/admin/dashboard");
        break;
      default:
        router.push("/login");
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">
          Redirecting to your dashboard...
        </p>
      </div>
    </div>
  );
}
