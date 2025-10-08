"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Import shared components
import { DoctorSelection } from "@/components/shared/DoctorSelection";
import { DateTimePicker } from "@/components/shared/DateTimePicker";
import { AppointmentForm } from "@/components/shared/AppointmentForm";

import { type Doctor as AppointmentDoctor } from "@/types/appointment";

export default function BookAppointment() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] =
    useState<AppointmentDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const totalSteps = 4;

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("patient")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  const handleDoctorSelect = (doctor: AppointmentDoctor | null) => {
    setSelectedDoctor(doctor);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSuccess = () => {
    toast.success("Appointment booked successfully!");
    router.push("/patient/appointments");
  };

  const handleCancel = () => {
    router.push("/patient/dashboard");
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Select Doctor";
      case 2:
        return "Choose Date & Time";
      case 3:
        return "Appointment Details";
      case 4:
        return "Review & Confirm";
      default:
        return "";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return "Choose a doctor for your appointment";
      case 2:
        return "Select your preferred date and time";
      case 3:
        return "Provide appointment details and reason";
      case 4:
        return "Review your appointment details";
      default:
        return "";
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDoctor !== null;
      case 2:
        return selectedDate !== null && selectedTime !== null;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to book an appointment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-balance">Book Appointment</h1>
        <p className="text-muted-foreground mt-2">
          Find and schedule an appointment with a healthcare provider
        </p>
      </div>

      {/* Progress Steps */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-4 mb-4">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i + 1 <= currentStep
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {i + 1 < currentStep ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              {i < totalSteps - 1 && (
                <div
                  className={`w-12 h-1 mx-2 ${
                    i + 1 < currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}: {getStepTitle(currentStep)}
        </p>
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {/* Step 1: Doctor Selection */}
        {currentStep === 1 && (
          <DoctorSelection
            selectedDoctor={selectedDoctor}
            onDoctorSelect={handleDoctorSelect}
          />
        )}

        {/* Step 2: Date & Time Selection */}
        {currentStep === 2 && selectedDoctor && (
          <DateTimePicker
            doctor={selectedDoctor}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onDateSelect={handleDateSelect}
            onTimeSelect={handleTimeSelect}
          />
        )}

        {/* Step 3: Appointment Details */}
        {currentStep === 3 &&
          selectedDoctor &&
          selectedDate &&
          selectedTime && (
            <AppointmentForm
              selectedDoctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}

        {/* Step 4: Review & Confirm - This is handled in AppointmentForm */}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {currentStep < totalSteps && (
              <Button onClick={nextStep} disabled={!canProceedToNext()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Selected Doctor Summary */}
      {selectedDoctor && currentStep > 1 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Selected Doctor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                {selectedDoctor.firstName.charAt(0)}
                {selectedDoctor.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {selectedDoctor.specialization} • $
                  {selectedDoctor.consultationFee}
                </p>
              </div>
              <Badge variant="default">Selected</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Date & Time Summary */}
      {selectedDate && selectedTime && currentStep > 2 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Selected Date & Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedTime} -{" "}
                  {(() => {
                    const [hours, minutes] = selectedTime
                      .split(":")
                      .map(Number);
                    const endHours = hours + 1;
                    return `${endHours.toString().padStart(2, "0")}:${minutes
                      .toString()
                      .padStart(2, "0")}`;
                  })()}
                </p>
              </div>
              <Badge variant="default">Confirmed</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
