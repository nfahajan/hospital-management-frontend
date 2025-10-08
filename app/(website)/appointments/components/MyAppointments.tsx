"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
  useGetUpcomingAppointmentsQuery,
  useGetAppointmentHistoryQuery,
} from "@/redux/features/appointmentApi";
import { type Appointment, APPOINTMENT_STATUSES } from "@/types/appointment";

interface MyAppointmentsProps {
  className?: string;
}

export function MyAppointments({ className = "" }: MyAppointmentsProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const {
    data: appointmentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetMyAppointmentsQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchTerm || undefined,
    page: 1,
    limit: 50,
  });

  const { data: upcomingResponse, isLoading: isLoadingUpcoming } =
    useGetUpcomingAppointmentsQuery({ limit: 5 });

  const { data: historyResponse, isLoading: isLoadingHistory } =
    useGetAppointmentHistoryQuery({
      page: 1,
      limit: 20,
    });

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const appointments = appointmentsResponse?.data?.appointments || [];
  const upcomingAppointments = upcomingResponse?.data?.appointments || [];
  const historyAppointments = historyResponse?.data?.appointments || [];

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await cancelAppointment({
        id: appointmentId,
        data: {
          cancellationReason: "Cancelled by patient",
          cancelledBy: "patient",
        },
      }).unwrap();

      toast.success("Appointment cancelled successfully");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to cancel appointment");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "no_show":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusConfig?.label || status;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    return (
      (appointment.status === "scheduled" ||
        appointment.status === "confirmed") &&
      hoursUntilAppointment > 24 // Can cancel up to 24 hours before
    );
  };

  const renderAppointmentCard = (appointment: Appointment) => (
    <Card key={appointment._id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarFallback>
                {getInitials(
                  appointment.doctor.firstName,
                  appointment.doctor.lastName
                )}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold">
                  Dr. {appointment.doctor.firstName}{" "}
                  {appointment.doctor.lastName}
                </h3>
                <Badge className={getStatusColor(appointment.status)}>
                  {getStatusIcon(appointment.status)}
                  <span className="ml-1">
                    {getStatusLabel(appointment.status)}
                  </span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(
                      new Date(appointment.appointmentDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {appointment.type.replace("_", " ").toUpperCase()}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {appointment.doctor.specialization}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />$
                    {appointment.doctor.consultationFee}
                  </div>
                  {appointment.isUrgent && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600 font-medium">Urgent</span>
                    </div>
                  )}
                </div>
              </div>

              {appointment.reason && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Reason:</span>{" "}
                    {appointment.reason}
                  </p>
                </div>
              )}

              {appointment.symptoms && (
                <div className="mt-2 p-3 bg-muted rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Symptoms:</span>{" "}
                    {appointment.symptoms}
                  </p>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>

              {canCancelAppointment(appointment) && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      className="text-red-600"
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your appointment with
                        Dr. {appointment.doctor.firstName}{" "}
                        {appointment.doctor.lastName} on{" "}
                        {format(
                          new Date(appointment.appointmentDate),
                          "MMMM d, yyyy"
                        )}{" "}
                        at {appointment.startTime}?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Appointment</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancelAppointment(appointment._id)}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isCancelling}
                      >
                        {isCancelling ? "Cancelling..." : "Cancel Appointment"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load appointments</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            My Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
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
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="all">All Appointments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoadingUpcoming ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No upcoming appointments
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(renderAppointmentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No appointments found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {appointments.map(renderAppointmentCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoadingHistory ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="animate-pulse">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : historyAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No appointment history
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {historyAppointments.map(renderAppointmentCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
