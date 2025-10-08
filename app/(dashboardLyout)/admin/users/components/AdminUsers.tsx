"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { UsersTable } from "./UsersTable";
import { UserStatusDialog } from "./UserStatusDialog";
import { type User } from "@/redux/features/userApi";
import { useGetUserStatsQuery } from "@/redux/features/userApi";
import { USER_STATUSES } from "@/types/user";

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Get user statistics
  const { data: statsResponse, isLoading: isLoadingStats } =
    useGetUserStatsQuery();
  const stats = statsResponse?.data;

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    // TODO: Implement edit functionality
    console.log("Edit user:", user);
  };

  const handleUpdateStatus = (user: User) => {
    setSelectedUser(user);
    setIsStatusDialogOpen(true);
  };

  const handleUpdateRoles = (user: User) => {
    setSelectedUser(user);
    setIsRolesDialogOpen(true);
  };

  const handleStatusDialogSuccess = () => {
    setIsStatusDialogOpen(false);
    setSelectedUser(null);
  };

  const getProfileType = (roles: string[]) => {
    if (roles.includes("doctor")) return "Doctor";
    if (roles.includes("patient")) return "Patient";
    if (roles.includes("admin") || roles.includes("superadmin")) return "Admin";
    return "User";
  };

  const getStatusColor = (status: string) => {
    const statusConfig = USER_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Users Management
          </h1>
          <p className="text-muted-foreground">
            Manage all users including patients, doctors, and administrators
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  All registered users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalPatients || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered patients
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doctors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalDoctors || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Registered doctors
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.activeUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Approved and active
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <UsersTable
        onViewUser={handleViewUser}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Status Update Dialog */}
      <UserStatusDialog
        user={selectedUser}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onSuccess={handleStatusDialogSuccess}
      />

      {/* View User Dialog */}
      {selectedUser && (
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedUser.profile
                  ? `${selectedUser.profile.firstName} ${selectedUser.profile.lastName}`
                  : selectedUser.email}
              </DialogTitle>
              <DialogDescription>
                User profile details and account information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Account Information</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Email:
                      </span>
                      <span className="text-sm">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge className={getStatusColor(selectedUser.status)}>
                        {selectedUser.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Profile Type:
                      </span>
                      <Badge variant="outline">
                        {getProfileType(selectedUser.roles)}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last Login:
                      </span>
                      <span className="text-sm">
                        {new Date(
                          selectedUser.lastLoggedIn
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Created:
                      </span>
                      <span className="text-sm">
                        {new Date(selectedUser.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedUser.profile && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Profile Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Name:
                        </span>
                        <span className="text-sm">
                          {selectedUser.profile.firstName}{" "}
                          {selectedUser.profile.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Phone:
                        </span>
                        <span className="text-sm">
                          {selectedUser.profile.phoneNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Gender:
                        </span>
                        <span className="text-sm">
                          {selectedUser.profile.gender}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Date of Birth:
                        </span>
                        <span className="text-sm">
                          {new Date(
                            selectedUser.profile.dateOfBirth
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedUser.profile.specialization && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Specialization:
                          </span>
                          <span className="text-sm capitalize">
                            {selectedUser.profile.specialization.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                      )}
                      {selectedUser.profile.bloodGroup && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Blood Group:
                          </span>
                          <span className="text-sm">
                            {selectedUser.profile.bloodGroup}
                          </span>
                        </div>
                      )}
                      {selectedUser.profile.licenseNumber && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            License Number:
                          </span>
                          <span className="text-sm">
                            {selectedUser.profile.licenseNumber}
                          </span>
                        </div>
                      )}
                      {selectedUser.profile.yearsOfExperience && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">
                            Experience:
                          </span>
                          <span className="text-sm">
                            {selectedUser.profile.yearsOfExperience} years
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsViewDialogOpen(false)}
                >
                  Close
                </Button>
                <Button onClick={() => handleUpdateStatus(selectedUser)}>
                  Update Status
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
