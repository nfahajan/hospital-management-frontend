"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  FileText,
  Pill,
  Save,
  X,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Edit,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// API imports
import {
  useGetAppointmentByIdQuery,
  useUpdateAppointmentMutation,
  useCancelAppointmentMutation,
} from "@/redux/features/appointmentApi";
import { useAuth } from "@/hooks/useAuth";
import { type Appointment } from "@/types/appointment";

// Validation schema
import { z } from "zod";

const appointmentUpdateSchema = z.object({
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  status: z
    .enum([
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ])
    .optional(),
});

type AppointmentUpdateFormData = z.infer<typeof appointmentUpdateSchema>;

export default function AppointmentDetails() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id as string;

  const [isEditing, setIsEditing] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<AppointmentUpdateFormData>({
    resolver: zodResolver(appointmentUpdateSchema),
  });

  // API queries
  const {
    data: appointmentResponse,
    isLoading: isLoadingAppointment,
    error: appointmentError,
    refetch: refetchAppointment,
  } = useGetAppointmentByIdQuery(appointmentId);

  const [updateAppointment, { isLoading: isUpdating }] =
    useUpdateAppointmentMutation();
  const [cancelAppointment, { isLoading: isCancelling }] =
    useCancelAppointmentMutation();

  const appointment = appointmentResponse?.data;

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

  // Reset form when appointment data loads
  useEffect(() => {
    if (appointment) {
      reset({
        notes: appointment.notes || "",
        diagnosis: appointment.diagnosis || "",
        prescription: appointment.prescription || "",
        status: appointment.status,
      });
    }
  }, [appointment, reset]);

  // Handle form submission
  const onSubmit = async (data: AppointmentUpdateFormData) => {
    if (!appointment) return;

    try {
      await updateAppointment({
        id: appointment._id,
        data,
      }).unwrap();

      toast.success("Appointment updated successfully");
      setIsEditing(false);
      refetchAppointment();
    } catch (error: any) {
      toast.error("Failed to update appointment", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  // Handle appointment completion
  const handleCompleteAppointment = async () => {
    if (!appointment) return;

    const formData = watch();
    if (!formData.diagnosis?.trim()) {
      toast.error("Diagnosis is required to complete appointment");
      return;
    }

    try {
      await updateAppointment({
        id: appointment._id,
        data: {
          ...formData,
          status: "completed",
        },
      }).unwrap();

      toast.success("Appointment completed successfully");
      setShowCompleteDialog(false);
      setIsEditing(false);
      refetchAppointment();
    } catch (error: any) {
      toast.error("Failed to complete appointment", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!appointment || !cancellationReason.trim()) {
      toast.error("Cancellation reason is required");
      return;
    }

    try {
      await cancelAppointment({
        id: appointment._id,
        data: {
          cancellationReason: cancellationReason,
          cancelledBy: "doctor",
        },
      }).unwrap();

      toast.success("Appointment cancelled successfully");
      setShowCancelDialog(false);
      setCancellationReason("");
      refetchAppointment();
    } catch (error: any) {
      toast.error("Failed to cancel appointment", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (appointment) {
      reset({
        notes: appointment.notes || "",
        diagnosis: appointment.diagnosis || "",
        prescription: appointment.prescription || "",
        status: appointment.status,
      });
    }
    setIsEditing(false);
  };

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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  // Loading state
  if (isLoadingAppointment) {
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
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (appointmentError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Appointment Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage appointment information
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load appointment details. Please try again.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchAppointment()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Appointment Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage appointment information
            </p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Appointment not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Appointment Details
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage appointment information
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={`${getStatusColor(
              appointment.status
            )} flex items-center gap-1`}
          >
            {appointment.status}
          </Badge>
          {!isEditing &&
            appointment.status !== "completed" &&
            appointment.status !== "cancelled" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Patient Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                    {appointment.patient?.firstName?.[0] || "?"}
                    {appointment.patient?.lastName?.[0] || "?"}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold">
                        {appointment.patient?.firstName}{" "}
                        {appointment.patient?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient?.user?.email ||
                          "No email available"}
                      </p>
                    </div>

                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {appointment.patient?.user?.email || "No email"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {appointment.patient?.phoneNumber || "No phone"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Status Alert */}
                {appointment.patient?.user?.status === "blocked" && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                    <div>
                      <Label className="text-red-900 dark:text-red-100">
                        Patient Account Blocked
                      </Label>
                      <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                        This patient's account is currently blocked.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Clinical Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Clinical Notes</CardTitle>
                <CardDescription>
                  Document your findings and treatment plan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Consultation Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Enter your notes about the consultation..."
                    {...register("notes")}
                    disabled={!isEditing}
                    rows={4}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500">
                      {errors.notes.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis *</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter diagnosis..."
                    {...register("diagnosis")}
                    disabled={!isEditing}
                    rows={3}
                  />
                  {errors.diagnosis && (
                    <p className="text-sm text-red-500">
                      {errors.diagnosis.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription</Label>
                  <Textarea
                    id="prescription"
                    placeholder="Enter prescription details..."
                    {...register("prescription")}
                    disabled={!isEditing}
                    rows={3}
                  />
                  {errors.prescription && (
                    <p className="text-sm text-red-500">
                      {errors.prescription.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Appointment Details Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {format(
                          new Date(appointment.appointmentDate),
                          "MMM d, yyyy"
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">
                        {appointment.startTime} - {appointment.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Reason for Visit</p>
                      <p className="font-medium">{appointment.reason}</p>
                    </div>
                  </div>
                  {appointment.symptoms && (
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-muted-foreground">Symptoms</p>
                        <p className="font-medium">{appointment.symptoms}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Appointment Type</p>
                      <p className="font-medium capitalize">
                        {appointment.type}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {appointment.status !== "completed" &&
              appointment.status !== "cancelled" && (
                <Card>
                  <CardHeader>
                    <CardTitle>Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {isEditing ? (
                      <div className="space-y-2">
                        <Button
                          type="submit"
                          disabled={isUpdating}
                          className="w-full flex items-center gap-2"
                        >
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4" />
                          )}
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="w-full flex items-center gap-2"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Button
                          onClick={() => setShowCompleteDialog(true)}
                          className="w-full flex items-center gap-2"
                          disabled={!appointment.diagnosis?.trim()}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete Appointment
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => setShowCancelDialog(true)}
                          className="w-full flex items-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Cancel Appointment
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Completed Appointment Info */}
            {appointment.status === "completed" && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {appointment.diagnosis && (
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Diagnosis
                        </Label>
                        <p className="mt-1">{appointment.diagnosis}</p>
                      </div>
                    )}
                    {appointment.prescription && (
                      <div>
                        <Label className="text-muted-foreground flex items-center gap-2">
                          <Pill className="h-4 w-4" />
                          Prescription
                        </Label>
                        <p className="mt-1">{appointment.prescription}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>

      {/* Complete Appointment Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this appointment as completed? Make
              sure you've added all necessary notes, diagnosis, and
              prescription.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompleteAppointment}
              disabled={isUpdating}
              className="flex items-center gap-2"
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Appointment Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Please provide a reason for cancelling this appointment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cancellationReason">Cancellation Reason *</Label>
              <Textarea
                id="cancellationReason"
                placeholder="Enter reason for cancellation..."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isCancelling || !cancellationReason.trim()}
              className="flex items-center gap-2"
            >
              {isCancelling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
