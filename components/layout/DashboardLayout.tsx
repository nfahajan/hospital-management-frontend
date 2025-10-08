"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            Please log in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return router.push("/login");
  }

  // Validate user role
  if (
    !user.roles ||
    (!user.roles.includes("patient") &&
      !user.roles.includes("doctor") &&
      !user.roles.includes("admin"))
  ) {
    return (
      <div className="flex min-h-screen bg-gray-50 items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid User Role
          </h1>
          <p className="text-gray-600">
            Your account role ({user.roles?.[0] || "undefined"}) is not
            recognized. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen relative z-0 bg-gray-50">
      {/* Desktop Sidebar */}
      <Sidebar
        role={user.roles?.[0] as "patient" | "doctor" | "admin"}
        expanded={sidebarExpanded}
        onExpandToggle={() => {}}
      />
      {/* Mobile/Tablet Sidebar Sheet */}
      <Sheet open={isSidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar
            role={user.roles?.[0] as "patient" | "doctor" | "admin"}
            expanded={true}
            onExpandToggle={() => {}}
            forceShow={true}
          />
        </SheetContent>
      </Sheet>
      <div
        className={`flex-1 transition-all ${
          sidebarExpanded ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          expanded={sidebarExpanded}
          onExpandToggle={() => setSidebarExpanded((v) => !v)}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
