"use client";

import React, { useState } from "react";

import { AppointmentsTable } from "./AppointmentsTable";
import { AppointmentDetailsDialog } from "./AppointmentDetailsDialog";
import { AppointmentStatusDialog } from "./AppointmentStatusDialog";
import { type Appointment } from "@/types/appointment";

export default function AdminAppointments() {
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);

  const handleViewAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsDetailsDialogOpen(true);
  };

  const handleUpdateStatus = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsStatusDialogOpen(true);
  };

  const handleStatusDialogSuccess = () => {
    setIsStatusDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleDetailsDialogUpdateStatus = () => {
    setIsDetailsDialogOpen(false);
    if (selectedAppointment) {
      handleUpdateStatus(selectedAppointment);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Appointments Management
          </h1>
          <p className="text-muted-foreground">
            View and manage all system appointments
          </p>
        </div>
      </div>

      {/* Main Content */}
      <AppointmentsTable
        onViewAppointment={handleViewAppointment}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Status Update Dialog */}
      <AppointmentStatusDialog
        appointment={selectedAppointment}
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        onSuccess={handleStatusDialogSuccess}
      />

      {/* View Appointment Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
        onUpdateStatus={handleDetailsDialogUpdateStatus}
      />
    </div>
  );
}
