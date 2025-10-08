"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, isToday, isFuture, isPast } from "date-fns";
import {
  Calendar,
  Clock,
  Search,
  AlertCircle,
  User,
  Phone,
  Mail,
  Filter,
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  Clock4,
  FileText,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

// API imports
import {
  useGetDoctorAppointmentsQuery,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
} from "@/redux/features/appointmentApi";
import { type Appointment } from "@/types/appointment";

// Types
import { type AppointmentFilters as BaseAppointmentFilters } from "@/types/appointment";

interface AppointmentFilters extends Omit<BaseAppointmentFilters, "status"> {
  search?: string;
  status?: string;
}

export default function DoctorAppointments() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [filters, setFilters] = useState<AppointmentFilters>({
    search: "",
    status: "all",
    page: 1,
    limit: 10,
  });

  // API queries
  const {
    data: appointmentsResponse,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useGetDoctorAppointmentsQuery(filters as any);

  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();
  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const appointments = appointmentsResponse?.data?.appointments || [];
  const pagination = appointmentsResponse?.data?.pagination;

  // Authentication check
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      (!user.roles.includes("doctor") && !user.roles.includes("admin"))
    ) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters((prev) => ({ ...prev, search: searchTerm, page: 1 }));
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setFilters((prev) => ({
      ...prev,
      status: status === "all" ? "" : status,
      page: 1,
    }));
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchAppointments();
    toast.success("Appointments refreshed");
  };

  // Handle appointment status update
  const handleStatusUpdate = async (
    appointmentId: string,
    newStatus: string
  ) => {
    try {
      await updateAppointment({
        id: appointmentId,
        data: { status: newStatus as any },
      }).unwrap();

      toast.success(`Appointment ${newStatus} successfully`);
      refetchAppointments();
    } catch (error: any) {
      toast.error("Failed to update appointment", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  // Filter appointments by tabs
  const todayAppointments = appointments.filter((apt) =>
    isToday(new Date(apt.appointmentDate))
  );

  const upcomingAppointments = appointments.filter(
    (apt) =>
      isFuture(new Date(apt.appointmentDate)) &&
      !["completed", "cancelled"].includes(apt.status)
  );

  const pastAppointments = appointments.filter(
    (apt) =>
      isPast(new Date(apt.appointmentDate)) ||
      ["completed", "cancelled"].includes(apt.status)
  );

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      case "in_progress":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "no_show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "scheduled":
        return <Clock className="h-4 w-4" />;
      case "pending":
        return <Clock4 className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "no_show":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Loading state
  if (isLoadingAppointments) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (appointmentsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">My Appointments</h1>
            <p className="text-muted-foreground mt-2">
              Manage your patient appointments
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            Refresh Data
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load appointments. Please try again.
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Appointment Card Component
  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Patient Avatar */}
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-xl font-bold text-primary">
            {appointment.patient?.firstName?.[0] || "?"}
            {appointment.patient?.lastName?.[0] || "?"}
          </div>

          {/* Appointment Details */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">
                  {appointment.patient?.firstName}{" "}
                  {appointment.patient?.lastName}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {appointment.patient?.user?.email || "No email"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {appointment.patient?.phoneNumber || "No phone"}
                  </span>
                </div>
              </div>
              <Badge
                className={`${getStatusColor(
                  appointment.status
                )} flex items-center gap-1`}
              >
                {getStatusIcon(appointment.status)}
                {appointment.status}
              </Badge>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">{appointment.reason}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(appointment.appointmentDate), "MMM d, yyyy")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {appointment.startTime} - {appointment.endTime}
                </span>
              </div>
            </div>

            {/* Allergies Alert */}
            {appointment.patient?.user?.status === "blocked" && (
              <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-800 dark:text-red-200">
                  Patient account is blocked
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex items-center gap-2"
            >
              <a href={`/doctor/appointments/${appointment._id}`}>
                <Eye className="h-4 w-4" />
                View Details
              </a>
            </Button>

            {/* Quick Actions */}
            {appointment.status === "scheduled" && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleStatusUpdate(appointment._id, "confirmed")}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm
              </Button>
            )}

            {appointment.status === "confirmed" && (
              <Button
                variant="default"
                size="sm"
                onClick={() =>
                  handleStatusUpdate(appointment._id, "in_progress")
                }
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                Start
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            Manage your patient appointments -{" "}
            {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or reason..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filters.status} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Appointments Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming ({upcomingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Today ({todayAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Past ({pastAppointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Today's Appointments */}
        <TabsContent value="today" className="space-y-4">
          {todayAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No appointments today
                </h3>
                <p className="text-muted-foreground">
                  You have no appointments scheduled for today.
                </p>
              </CardContent>
            </Card>
          ) : (
            todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
              />
            ))
          )}
        </TabsContent>

        {/* Upcoming Appointments */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No upcoming appointments
                </h3>
                <p className="text-muted-foreground">
                  You have no upcoming appointments scheduled.
                </p>
              </CardContent>
            </Card>
          ) : (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
              />
            ))
          )}
        </TabsContent>

        {/* Past Appointments */}
        <TabsContent value="past" className="space-y-4">
          {pastAppointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No past appointments
                </h3>
                <p className="text-muted-foreground">
                  You have no completed or cancelled appointments.
                </p>
              </CardContent>
            </Card>
          ) : (
            pastAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id}
                appointment={appointment}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.currentPage - 1) * 10 + 1} to{" "}
            {Math.min(
              pagination.currentPage * 10,
              pagination.totalAppointments
            )}{" "}
            of {pagination.totalAppointments} appointments
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! - 1 }))
              }
              disabled={!pagination.hasPrevPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: prev.page! + 1 }))
              }
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
