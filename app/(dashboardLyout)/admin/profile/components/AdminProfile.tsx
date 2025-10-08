"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Phone,
  Calendar,
  Shield,
  X,
  Lock,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/hooks/useAuth";
import {
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
} from "@/redux/features/authApi";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import { USER_STATUSES } from "@/types/user";

export default function AdminProfile() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [showChangePassword, setShowChangePassword] = useState(false);

  // API hooks
  const {
    data: userResponse,
    isLoading: isLoadingUser,
    error: userError,
    refetch: refetchUser,
  } = useGetCurrentUserQuery();

  const [updateUser, { isLoading: isUpdating }] =
    useUpdateCurrentUserMutation();

  const currentUser = userResponse?.data?.user;

  // Authentication check
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      (!user.roles.includes("admin") && !user.roles.includes("superadmin"))
    ) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "blocked":
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = USER_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  // Loading state
  if (isLoadingUser) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (userError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Admin Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your administrator profile
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile data. Please try again.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchUser()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admin Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your administrator profile and settings
          </p>
        </div>
      </div>

      {/* Profile Overview */}
      {/* Profile Summary Card */}
      <div className="flex justify-center items-center w-full mx-auto pt-6 max-w-2xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {currentUser?.profile?.firstName &&
                    currentUser?.profile?.lastName
                      ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
                      : "Administrator"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {currentUser?.email}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {currentUser?.roles?.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowChangePassword(true)}
                  className="flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            </div>
            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <div className="flex items-center gap-1">
                  {getStatusIcon(currentUser?.status || "pending")}
                  <Badge
                    className={getStatusColor(currentUser?.status || "pending")}
                  >
                    {currentUser?.status || "pending"}
                  </Badge>
                </div>
              </div>

              {currentUser?.profile?.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{currentUser.profile.phoneNumber}</span>
                </div>
              )}

              {currentUser?.profile?.dateOfBirth && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(
                      new Date(currentUser.profile.dateOfBirth),
                      "MMM d, yyyy"
                    )}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  Last login:{" "}
                  {currentUser?.lastLoggedIn
                    ? format(
                        new Date(currentUser.lastLoggedIn),
                        "MMM d, yyyy 'at' h:mm a"
                      )
                    : "Never"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
}
