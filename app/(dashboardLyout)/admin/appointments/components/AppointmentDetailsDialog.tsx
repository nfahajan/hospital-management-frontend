"use client";

import React from "react";
import { format } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  DollarSign,
  FileText,
  Activity,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { type Appointment } from "@/types/appointment";
import { APPOINTMENT_STATUSES, APPOINTMENT_TYPES } from "@/types/appointment";

interface AppointmentDetailsDialogProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: () => void;
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
  onUpdateStatus,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    const statusConfig = APPOINTMENT_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
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

  const getTypeIcon = (type: string) => {
    const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === type);
    return typeConfig?.icon || "📋";
  };

  const getTypeDescription = (type: string) => {
    const typeConfig = APPOINTMENT_TYPES.find((t) => t.value === type);
    return typeConfig?.description || "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Appointment Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Date & Time
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(
                      new Date(appointment.appointmentDate),
                      "EEEE, MMMM d, yyyy"
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.startTime} - {appointment.endTime}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span>{getTypeIcon(appointment.type)}</span>
                    Type & Status
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {appointment.type.replace("_", " ")}
                    </Badge>
                    <Badge className={getStatusColor(appointment.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(appointment.status)}
                        {appointment.status.replace("_", " ")}
                      </div>
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getTypeDescription(appointment.type)}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <DollarSign className="h-4 w-4" />
                    Fees
                  </div>
                  <div className="flex items-center gap-2">
                    {appointment.isUrgent && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-green-600">
                    Consultation Fee: ${appointment.doctor.consultationFee}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  Reason for Visit
                </div>
                <p className="text-sm text-muted-foreground">
                  {appointment.reason}
                </p>
              </div>

              {appointment.symptoms && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Activity className="h-4 w-4" />
                    Symptoms
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {appointment.symptoms}
                  </p>
                </div>
              )}

              {appointment.notes && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4" />
                    Notes
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {appointment.notes}
                  </p>
                </div>
              )}

              {appointment.cancellationReason && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600">
                    <XCircle className="h-4 w-4" />
                    Cancellation Reason
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {appointment.cancellationReason}
                  </p>
                  {appointment.cancelledBy && (
                    <p className="text-xs text-muted-foreground">
                      Cancelled by: {appointment.cancelledBy}
                    </p>
                  )}
                  {appointment.cancelledAt && (
                    <p className="text-xs text-muted-foreground">
                      Cancelled at:{" "}
                      {format(
                        new Date(appointment.cancelledAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      Personal Details
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          {appointment.patient.firstName}{" "}
                          {appointment.patient.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Phone:</span>
                        <span>{appointment.patient.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span className="text-blue-600 font-medium">
                          {appointment.patient.user?.email ||
                            "Email not available"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Status:
                        </span>
                        <Badge
                          variant={
                            appointment.patient.user?.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointment.patient.user?.status || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Heart className="h-4 w-4" />
                      Medical Information
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Patient ID:
                        </span>
                        <span>{appointment.patient._id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Doctor Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Doctor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      Personal Details
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-medium">
                          Dr. {appointment.doctor.firstName}{" "}
                          {appointment.doctor.lastName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Doctor ID:
                        </span>
                        <span>{appointment.doctor._id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email:</span>
                        <span>{appointment.doctor.user?.email || "N/A"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Account Status:
                        </span>
                        <Badge
                          variant={
                            appointment.doctor.user?.status === "approved"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointment.doctor.user?.status || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Stethoscope className="h-4 w-4" />
                      Professional Details
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Specialization:
                        </span>
                        <span className="font-medium capitalize">
                          {appointment.doctor.specialization.replace("_", " ")}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Experience:
                        </span>
                        <span>
                          {appointment.doctor.yearsOfExperience} years
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Consultation Fee:
                        </span>
                        <span className="font-medium">
                          ${appointment.doctor.consultationFee}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Availability:
                        </span>
                        <Badge
                          variant={
                            appointment.doctor.isAvailable
                              ? "default"
                              : "secondary"
                          }
                        >
                          {appointment.doctor.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {onUpdateStatus && (
              <Button onClick={onUpdateStatus}>Update Status</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
