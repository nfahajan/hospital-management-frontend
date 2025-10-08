"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Calendar,
  Clock,
  User,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Plus,
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
  useGetAllAppointmentsQuery,
  useDeleteAppointmentMutation,
} from "@/redux/features/appointmentApi";
import { type Appointment, type AppointmentFilters } from "@/types/appointment";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from "@/types/appointment";
import { toast } from "sonner";

interface AppointmentsTableProps {
  onViewAppointment: (appointment: Appointment) => void;
  onUpdateStatus: (appointment: Appointment) => void;
}

export function AppointmentsTable({
  onViewAppointment,
  onUpdateStatus,
}: AppointmentsTableProps) {
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>(
    []
  );
  const [filters, setFilters] = useState<AppointmentFilters>({
    page: 1,
    limit: 10,
  });

  // API hooks
  const {
    data: appointmentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetAllAppointmentsQuery(filters);

  const [deleteAppointment, { isLoading: isDeleting }] =
    useDeleteAppointmentMutation();

  const appointments = appointmentsResponse?.data?.appointments || [];
  const pagination = appointmentsResponse?.data?.pagination;

  // Filter handlers
  const handleSearchChange = (value: string) => {
    setFilters((prev: AppointmentFilters) => ({
      ...prev,
      search: value || undefined,
      page: 1, // Reset to first page when searching
    }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev: AppointmentFilters) => ({
      ...prev,
      status: status === "all" ? undefined : (status as any),
      page: 1,
    }));
  };

  const handleTypeFilter = (type: string) => {
    setFilters((prev: AppointmentFilters) => ({
      ...prev,
      type: type === "all" ? undefined : (type as any),
      page: 1,
    }));
  };

  const handleUrgentFilter = (urgent: string) => {
    setFilters((prev: AppointmentFilters) => ({
      ...prev,
      isUrgent: urgent === "all" ? undefined : urgent === "urgent",
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev: AppointmentFilters) => ({ ...prev, page }));
  };

  const handleLimitChange = (limit: number) => {
    setFilters((prev: AppointmentFilters) => ({ ...prev, limit, page: 1 }));
  };

  // Selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAppointments(
        appointments.map((appointment) => appointment._id)
      );
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleSelectAppointment = (appointmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedAppointments((prev) => [...prev, appointmentId]);
    } else {
      setSelectedAppointments((prev) =>
        prev.filter((id) => id !== appointmentId)
      );
    }
  };

  // Action handlers
  const handleDeleteAppointment = async (appointment: Appointment) => {
    if (!confirm(`Are you sure you want to delete this appointment?`)) {
      return;
    }

    try {
      await deleteAppointment(appointment._id).unwrap();
      toast.success("Appointment deleted successfully");
      setSelectedAppointments((prev) =>
        prev.filter((id) => id !== appointment._id)
      );
    } catch (error: any) {
      toast.error("Failed to delete appointment", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-3 w-3" />;
      case "confirmed":
        return <CheckCircle className="h-3 w-3" />;
      case "in_progress":
        return <Clock className="h-3 w-3" />;
      case "completed":
        return <CheckCircle className="h-3 w-3" />;
      case "cancelled":
        return <XCircle className="h-3 w-3" />;
      case "no_show":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === type);
    return typeConfig?.icon || "📋";
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
          Failed to load appointments. Please try again.
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
          <CardTitle>Appointments Management</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
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
              {APPOINTMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.type || "all"}
            onValueChange={handleTypeFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {APPOINTMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={
              filters.isUrgent === undefined
                ? "all"
                : filters.isUrgent
                ? "urgent"
                : "normal"
            }
            onValueChange={handleUrgentFilter}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="normal">Normal</SelectItem>
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
        {selectedAppointments.length > 0 && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">
              {selectedAppointments.length} appointment(s) selected
            </span>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedAppointments([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>{" "}
                <TableHead>Consultation Fee</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {appointment.patient.firstName}{" "}
                        {appointment.patient.lastName}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">
                        {appointment.patient.user?.email ||
                          "Email not available"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.patient.phoneNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        Dr. {appointment.doctor.firstName}{" "}
                        {appointment.doctor.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {appointment.doctor.specialization.replace("_", " ")}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="text-sm font-semibold text-green-600">
                        ${appointment.doctor.consultationFee}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(
                          new Date(appointment.appointmentDate),
                          "MMM d, yyyy"
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {appointment.startTime} - {appointment.endTime}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <span>{getTypeIcon(appointment.type)}</span>
                        <span className="capitalize">
                          {appointment.type.replace("_", " ")}
                        </span>
                      </div>

                      {appointment.isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(appointment.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace("_", " ")}
                      </div>
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => onViewAppointment(appointment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onUpdateStatus(appointment)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Update Status
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteAppointment(appointment)}
                          className="text-red-600"
                          disabled={isDeleting}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Delete Appointment
                        </DropdownMenuItem>
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
                pagination.totalAppointments
              )}{" "}
              of {pagination.totalAppointments} appointments
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
