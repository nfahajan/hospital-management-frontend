"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, isAfter, isBefore, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Search,
  Filter,
  MoreHorizontal,
  X,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarX,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  useGetMyAppointmentsQuery,
  useCancelAppointmentMutation,
} from "@/redux/features/appointmentApi";
import { type Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PatientAppointments() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] =
    useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState("");

  // Fetch appointments from API
  const {
    data: appointmentsResponse,
    isLoading,
    error,
    refetch,
  } = useGetMyAppointmentsQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    page: 1,
    limit: 100,
  });

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const allAppointments = appointmentsResponse?.data?.appointments || [];

  // Client-side filtering for search
  const appointments = allAppointments.filter((appointment) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      appointment.doctor?.firstName?.toLowerCase().includes(searchLower) ||
      appointment.doctor?.lastName?.toLowerCase().includes(searchLower) ||
      appointment.reason?.toLowerCase().includes(searchLower) ||
      appointment.symptoms?.toLowerCase().includes(searchLower)
    );
  });

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("patient")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Filter appointments based on current date
  const now = new Date();
  const upcomingAppointments = appointments.filter((apt) => {
    const appointmentDate = parseISO(apt.appointmentDate);
    return (
      isAfter(appointmentDate, now) &&
      ["scheduled", "confirmed"].includes(apt.status)
    );
  });

  const pastAppointments = appointments.filter((apt) => {
    const appointmentDate = parseISO(apt.appointmentDate);
    return (
      isBefore(appointmentDate, now) ||
      ["completed", "cancelled", "no_show"].includes(apt.status)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "no_show":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "no_show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await cancelAppointment({
        id: appointmentToCancel._id,
        data: {
          cancellationReason: cancellationReason.trim(),
          cancelledBy: "patient",
        },
      }).unwrap();

      toast.success("Appointment cancelled successfully");
      setCancelDialogOpen(false);
      setAppointmentToCancel(null);
      setCancellationReason("");
      refetch();
    } catch (error: any) {
      console.error("Cancel appointment error:", error);
      toast.error(error?.data?.message || "Failed to cancel appointment");
    }
  };

  const openCancelDialog = (appointment: Appointment) => {
    setAppointmentToCancel(appointment);
    setCancelDialogOpen(true);
  };

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDate = parseISO(appointment.appointmentDate);
    const hoursUntilAppointment =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return (
      hoursUntilAppointment > 24 &&
      ["scheduled", "confirmed"].includes(appointment.status)
    );
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => {
    const appointmentDate = parseISO(appointment.appointmentDate);
    const isUpcoming = isAfter(appointmentDate, now);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Date Display */}
            <div className="w-16 h-16 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
              <div className="text-2xl font-bold">
                {appointmentDate.getDate()}
              </div>
              <div className="text-xs text-muted-foreground">
                {format(appointmentDate, "MMM")}
              </div>
            </div>

            {/* Appointment Details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">
                    Dr. {appointment.doctor?.firstName}{" "}
                    {appointment.doctor?.lastName}
                  </h3>
                  <p className="text-sm capitalize text-muted-foreground">
                    {appointment.doctor?.specialization.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={cn(
                      "flex items-center gap-1",
                      getStatusColor(appointment.status)
                    )}
                  >
                    {getStatusIcon(appointment.status)}
                    {appointment.status.charAt(0).toUpperCase() +
                      appointment.status.slice(1)}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(appointmentDate, "EEEE, MMMM d, yyyy")} at{" "}
                    {appointment.startTime} - {appointment.endTime}
                  </span>
                </div>
              </div>

              {appointment.type && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {appointment.type.replace("_", " ").toUpperCase()}
                  </Badge>
                  {appointment.isUrgent && (
                    <Badge variant="destructive" className="text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/patient/appointments/${appointment._id}`}>
                  View Details
                </Link>
              </Button>

              {isUpcoming && canCancelAppointment(appointment) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => openCancelDialog(appointment)}
                      className="text-red-600"
                    >
                      <CalendarX className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view your appointments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Appointments</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your appointments
          </p>
        </div>
        <Button asChild>
          <Link href="/patient/book-appointment">Book New Appointment</Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments by doctor name or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load appointments. Please try again.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Appointments Tabs */}
      {!isLoading && !error && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming ({upcomingAppointments.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Past ({pastAppointments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            {upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No upcoming appointments
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    You don't have any upcoming appointments scheduled.
                  </p>
                  <Button asChild>
                    <Link href="/patient/book-appointment">
                      Book an Appointment
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            {pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No past appointments
                  </h3>
                  <p className="text-muted-foreground">
                    You don't have any past appointments.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment._id}
                    appointment={appointment}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Cancel Appointment Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {appointmentToCancel && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Appointment Details</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <span className="text-muted-foreground">Doctor:</span> Dr.{" "}
                    {appointmentToCancel.doctor?.firstName}{" "}
                    {appointmentToCancel.doctor?.lastName}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Date:</span>{" "}
                    {format(
                      parseISO(appointmentToCancel.appointmentDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Time:</span>{" "}
                    {appointmentToCancel.startTime} -{" "}
                    {appointmentToCancel.endTime}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancellation-reason">
                  Cancellation Reason *
                </Label>
                <Textarea
                  id="cancellation-reason"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCancelDialogOpen(false);
                setAppointmentToCancel(null);
                setCancellationReason("");
              }}
            >
              Keep Appointment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelAppointment}
              disabled={isCancelling || !cancellationReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isCancelling ? "Cancelling..." : "Cancel Appointment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
