"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import {
  Calendar,
  Clock,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  CalendarX,
  MoreHorizontal,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  useGetAppointmentByIdQuery,
  useCancelAppointmentMutation,
} from "@/redux/features/appointmentApi";
import { type Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PatientAppointmentDetails() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  const appointmentId = params.id as string;

  // Fetch appointment details from API
  const {
    data: appointmentResponse,
    isLoading,
    error,
    refetch,
  } = useGetAppointmentByIdQuery(appointmentId);

  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const appointment = appointmentResponse?.data;

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("patient")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

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

  const canCancelAppointment = (appointment: Appointment) => {
    const appointmentDate = parseISO(appointment.appointmentDate);
    const now = new Date();
    const hoursUntilAppointment =
      (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return (
      hoursUntilAppointment > 24 &&
      ["scheduled", "confirmed"].includes(appointment.status)
    );
  };

  const handleCancelAppointment = async () => {
    if (!appointment || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    try {
      await cancelAppointment({
        id: appointment._id,
        data: {
          cancellationReason: cancellationReason.trim(),
          cancelledBy: "patient",
        },
      }).unwrap();

      toast.success("Appointment cancelled successfully");
      setCancelDialogOpen(false);
      setCancellationReason("");
      refetch();
    } catch (error: any) {
      console.error("Cancel appointment error:", error);
      toast.error(error?.data?.message || "Failed to cancel appointment");
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view appointment details.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-32" />
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/appointments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Link>
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load appointment details. Please try again.</p>
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
      </div>
    );
  }

  const appointmentDate = parseISO(appointment.appointmentDate);
  const isUpcoming = appointmentDate > new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/appointments">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Appointments
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Appointment Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View detailed information about your appointment
            </p>
          </div>
        </div>

        {isUpcoming && canCancelAppointment(appointment) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => setCancelDialogOpen(true)}
                className="text-red-600"
              >
                <CalendarX className="h-4 w-4 mr-2" />
                Cancel Appointment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Appointment Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* Date Display */}
                <div className="w-20 h-20 bg-primary/10 rounded-lg flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold">
                    {appointmentDate.getDate()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(appointmentDate, "MMM")}
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">
                        Dr. {appointment.doctor?.firstName}{" "}
                        {appointment.doctor?.lastName}
                      </h2>
                      <p className="text-muted-foreground">
                        {appointment.doctor?.specialization}
                      </p>
                    </div>
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>
                        {appointment.startTime} - {appointment.endTime}
                      </span>
                    </div>
                  </div>

                  {appointment.type && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        {appointment.type.replace("_", " ").toUpperCase()}
                      </Badge>
                      {appointment.isUrgent && (
                        <Badge variant="destructive">Urgent</Badge>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                  Reason for Visit
                </h4>
                <p className="text-sm">{appointment.reason}</p>
              </div>

              {appointment.symptoms && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Symptoms
                  </h4>
                  <p className="text-sm">{appointment.symptoms}</p>
                </div>
              )}

              {appointment.notes && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Notes
                  </h4>
                  <p className="text-sm">{appointment.notes}</p>
                </div>
              )}

              {appointment.cancellationReason && (
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Cancellation Reason
                  </h4>
                  <p className="text-sm text-red-600">
                    {appointment.cancellationReason}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Doctor Prescription */}
          {(appointment.prescription || appointment.diagnosis) && (
            <Card>
              <CardHeader>
                <CardTitle>Doctor Prescription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                    Diagnosis
                  </h4>
                  <p className="text-sm">{appointment.diagnosis}</p>
                </div>

                {appointment.symptoms && (
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      Prescription
                    </h4>
                    <p className="text-sm">{appointment.prescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle>Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {appointment.doctor?.firstName.charAt(0)}
                    {appointment.doctor?.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">
                    Dr. {appointment.doctor?.firstName}{" "}
                    {appointment.doctor?.lastName}
                  </h4>
                  <p className="text-sm capitalize text-muted-foreground">
                    {appointment.doctor?.specialization.replace(/_/g, " ")}
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">
                    Consultation Fee:
                  </span>{" "}
                  ${appointment.doctor?.consultationFee}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge className={getStatusColor(appointment.status)}>
                  {appointment.status}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>1 hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>
                  {format(new Date(appointment.createdAt), "MMM d, yyyy")}
                </span>
              </div>
              {appointment.cancelledAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancelled:</span>
                  <span>
                    {format(new Date(appointment.cancelledAt), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Important Information */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Important</p>
                  <p className="text-muted-foreground">
                    Please arrive 10 minutes early for your appointment. Bring
                    your insurance card and a valid ID.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Appointment Details</h4>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-muted-foreground">Doctor:</span> Dr.{" "}
                  {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                </p>
                <p>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {format(appointmentDate, "EEEE, MMMM d, yyyy")}
                </p>
                <p>
                  <span className="text-muted-foreground">Time:</span>{" "}
                  {appointment.startTime} - {appointment.endTime}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cancellation-reason">Cancellation Reason *</Label>
              <Textarea
                id="cancellation-reason"
                placeholder="Please provide a reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setCancelDialogOpen(false);
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
