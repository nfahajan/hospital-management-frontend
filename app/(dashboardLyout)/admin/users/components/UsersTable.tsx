"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  UserCheck,
  UserX,
  Shield,
  Trash2,
  RefreshCw,
  Download,
  UserPlus,
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import {
  useGetAllUsersQuery,
  useDeleteUserMutation,
  useBulkUpdateUserStatusMutation,
  type User,
  type UserFilters,
} from "@/redux/features/userApi";
import { USER_STATUSES, USER_ROLES, AUTH_TYPES } from "@/types/user";
import { toast } from "sonner";

interface UsersTableProps {
  onViewUser: (user: User) => void;
  onUpdateStatus: (user: User) => void;
}

export function UsersTable({ onViewUser, onUpdateStatus }: UsersTableProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    page: 1,
    limit: 10,
  });

  // API hooks
  const {
    data: usersResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllUsersQuery(filters);

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] =
    useBulkUpdateUserStatusMutation();

  const users = usersResponse?.data?.users || [];
  const pagination = usersResponse?.data?.pagination;

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? undefined : status,
      page: 1,
    }));
  };

  const handleRoleFilter = (roles: string[]) => {
    setFilters((prev) => ({
      ...prev,
      roles: roles.length > 0 ? roles : undefined,
      page: 1,
    }));
  };

  const handleAuthTypeFilter = (authType: string) => {
    setFilters((prev) => ({
      ...prev,
      auth_type: authType === "all" ? undefined : authType,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev) => ({ ...prev, limit, page: 1 }));
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(users.map((user) => user._id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers((prev) => [...prev, userId]);
    } else {
      setSelectedUsers((prev) => prev.filter((id) => id !== userId));
    }
  };

  // // Action handlers
  // const handleDeleteUser = async (user: User) => {
  //   if (!confirm(`Are you sure you want to delete ${user.email}?`)) {
  //     return;
  //   }

  //   try {
  //     await deleteUser(user._id).unwrap();
  //     toast.success("User deleted successfully");
  //     setSelectedUsers((prev) => prev.filter((id) => id !== user._id));
  //   } catch (error: any) {
  //     toast.error("Failed to delete user", {
  //       description: error?.data?.message || "Please try again later.",
  //     });
  //   }
  // };

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select users first");
      return;
    }

    try {
      await bulkUpdateStatus({
        userIds: selectedUsers,
        status: status as any,
      }).unwrap();
      toast.success(`${selectedUsers.length} users updated successfully`);
      setSelectedUsers([]);
    } catch (error: any) {
      toast.error("Failed to update users", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = USER_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  const getProfileType = (roles: string[]) => {
    if (roles.includes("doctor")) return "Doctor";
    if (roles.includes("patient")) return "Patient";
    if (roles.includes("admin") || roles.includes("superadmin")) return "Admin";
    return "User";
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load users. Please try again.
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="ml-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Users Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by email..."
                value={filters.search || ""}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.status || "all"}
            onValueChange={handleStatusFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {USER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.limit?.toString() || "10"}
            onValueChange={(value) => handleLimitChange(parseInt(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusUpdate("approved")}
                disabled={isBulkUpdating}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleBulkStatusUpdate("blocked")}
                disabled={isBulkUpdating}
              >
                <UserX className="h-4 w-4 mr-2" />
                Block
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedUsers([])}
              >
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      selectedUsers.length === users.length && users.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Profile Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedUsers.includes(user._id)}
                      onCheckedChange={(checked) =>
                        handleSelectUser(user._id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.email}</div>
                      {user.profile && (
                        <div className="text-sm text-muted-foreground">
                          {user.profile.firstName} {user.profile.lastName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getProfileType(user.roles)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.lastLoggedIn), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(user.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewUser(user)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onUpdateStatus(user)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>

                        {/* <DropdownMenuSeparator /> */}
                        {/* <DropdownMenuItem
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600"
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete User
                        </DropdownMenuItem> */}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.currentPage - 1) * pagination.totalPages + 1}{" "}
              to{" "}
              {Math.min(
                pagination.currentPage * pagination.totalPages,
                pagination.totalUsers
              )}{" "}
              of {pagination.totalUsers} users
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
