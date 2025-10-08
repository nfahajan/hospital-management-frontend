"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useUpdateAppointmentMutation } from "@/redux/features/appointmentApi";
import { APPOINTMENT_STATUSES, type Appointment } from "@/types/appointment";

const statusUpdateSchema = z.object({
  status: z.enum(
    [
      "scheduled",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
      "no_show",
    ],
    {
      message: "Please select a status",
    }
  ),
  notes: z.string().optional(),
});

type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>;

interface AppointmentStatusDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AppointmentStatusDialog({
  appointment,
  open,
  onOpenChange,
  onSuccess,
}: AppointmentStatusDialogProps) {
  const [updateAppointment, { isLoading }] = useUpdateAppointmentMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StatusUpdateFormData>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: appointment?.status || "scheduled",
      notes: "",
    },
  });

  const selectedStatus = watch("status");

  // Reset form when appointment changes
  React.useEffect(() => {
    if (appointment) {
      reset({
        status: appointment.status,
        notes: appointment.notes || "",
      });
    }
  }, [appointment, reset]);

  const onSubmit = async (data: StatusUpdateFormData) => {
    if (!appointment) return;

    try {
      await updateAppointment({
        id: appointment._id,
        data: {
          status: data.status,
          notes: data.notes || undefined,
        },
      }).unwrap();

      toast.success("Appointment status updated successfully", {
        description: `Status changed to ${data.status.replace("_", " ")}`,
      });

      onSuccess();
    } catch (error: any) {
      toast.error("Failed to update appointment status", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "in_progress":
        return <Clock className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "no_show":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  const getStatusDescription = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusConfig?.description || "";
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Update Appointment Status
          </DialogTitle>
          <DialogDescription>
            Change the status for this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Appointment Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Patient:</span>
                <span className="text-sm">
                  {appointment.patient.firstName} {appointment.patient.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Doctor:</span>
                <span className="text-sm">
                  Dr. {appointment.doctor.firstName}{" "}
                  {appointment.doctor.lastName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Date:</span>
                <span className="text-sm">
                  {new Date(appointment.appointmentDate).toLocaleDateString()}{" "}
                  at {appointment.startTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge className={getStatusColor(appointment.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(appointment.status)}
                    {appointment.status.replace("_", " ")}
                  </div>
                </Badge>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">New Status *</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {APPOINTMENT_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.value)}
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Status Description */}
            {selectedStatus && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getStatusDescription(selectedStatus)}
                </AlertDescription>
              </Alert>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes about this status change..."
                {...register("notes")}
                rows={3}
              />
            </div>

            {/* Warning for sensitive status changes */}
            {(selectedStatus === "cancelled" ||
              selectedStatus === "no_show") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This status change will mark the appointment as unsuccessful.
                  Please ensure this is accurate and add appropriate notes.
                </AlertDescription>
              </Alert>
            )}

            {/* Info about status changes */}
            {selectedStatus === "completed" && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Marking as completed will finalize this appointment. Consider
                  adding notes about the consultation outcome.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Status"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
