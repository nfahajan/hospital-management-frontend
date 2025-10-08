"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { DoctorSelection } from "./DoctorSelection";
import { DateTimePicker } from "./DateTimePicker";
import {
  createAppointmentSchema,
  type CreateAppointmentFormData,
} from "@/lib/validations/appointment";
import { useCreateAppointmentMutation } from "@/redux/features/appointmentApi";

import { type Doctor as AppointmentDoctor } from "@/types/appointment";
import { APPOINTMENT_TYPES, DURATION_OPTIONS } from "@/types/appointment";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

interface AppointmentBookingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AppointmentBookingForm({
  onSuccess,
  onCancel,
  className = "",
}: AppointmentBookingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] =
    useState<AppointmentDoctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isUrgent, setIsUrgent] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const totalSteps = 4;

  const form = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: user?._id || "",
      doctorId: "",
      appointmentDate: "",
      startTime: "",
      endTime: "",
      type: "consultation",
      reason: "",
      symptoms: "",
      isUrgent: false,
    },
  });

  // Update patientId when user data becomes available
  useEffect(() => {
    if (user?._id && user._id !== form.getValues("patientId")) {
      form.setValue("patientId", user._id);
    }
  }, [user?._id, form]);

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

  const handleDoctorSelect = (doctor: AppointmentDoctor | null) => {
    setSelectedDoctor(doctor);
    if (doctor) {
      form.setValue("doctorId", doctor._id);
    }
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    form.setValue("appointmentDate", date);
  };

  const handleTimeSelect = (time: string) => {
    if (!time || typeof time !== "string") {
      console.error("Invalid time value:", time);
      return;
    }

    setSelectedTime(time);
    form.setValue("startTime", time);

    // Calculate end time (1 hour after start time)
    try {
      // Validate time format (HH:MM)
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(time)) {
        console.error("Invalid time format:", time);
        return;
      }

      // Add 1 hour to start time
      const [hours, minutes] = time.split(":").map(Number);
      const endHours = hours + 1;
      const endTimeStr = `${endHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      form.setValue("endTime", endTimeStr);
    } catch (error) {
      console.error("Error calculating end time:", error);
      // Fallback: add 1 hour to start time
      const [hours, minutes] = time.split(":").map(Number);
      const endHours = hours + 1;
      const endTimeStr = `${endHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      form.setValue("endTime", endTimeStr);
    }
  };

  const onSubmit = async (data: CreateAppointmentFormData) => {
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to book an appointment");
      return;
    }

    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please complete all steps before booking");
      return;
    }

    try {
      const appointmentData = {
        ...data,
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        isUrgent,
      };

      await createAppointment(appointmentData).unwrap();

      toast.success("Appointment booked successfully!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to book appointment");
    }
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

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return selectedDoctor !== null;
      case 2:
        return selectedDate !== null && selectedTime !== null;
      case 3:
        return form.getValues("reason").length >= 10;
      case 4:
        return true;
      default:
        return false;
    }
  };
  console.log(user, "authecaitoed");
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Simple Progress Indicator */}
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
        {currentStep === 3 && (
          <Form {...form}>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Appointment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select appointment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {APPOINTMENT_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <span>{type.icon}</span>
                                <div>
                                  <div className="font-medium">
                                    {type.label}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {type.description}
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Visit *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe the reason for your appointment..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="symptoms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symptoms (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe any symptoms you're experiencing..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setIsUrgent(checked === true)}
                />
                <Label htmlFor="urgent" className="text-sm">
                  This is an urgent appointment
                </Label>
              </div>

              {isUrgent && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Urgent appointments may have higher fees and are subject to
                    doctor availability.
                  </AlertDescription>
                </Alert>
              )}
            </form>
          </Form>
        )}

        {/* Step 4: Review & Confirm */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Doctor Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {selectedDoctor?.firstName.charAt(0)}
                        {selectedDoctor?.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        Dr. {selectedDoctor?.firstName}{" "}
                        {selectedDoctor?.lastName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoctor?.specialization}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        ${selectedDoctor?.consultationFee} consultation fee
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span>
                      {selectedDate &&
                        format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span>{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span>
                      {
                        APPOINTMENT_TYPES.find(
                          (t) => t.value === form.getValues("type")
                        )?.label
                      }
                    </span>
                  </div>
                  {isUrgent && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reason for Visit</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{form.getValues("reason")}</p>
                {form.getValues("symptoms") && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Symptoms:</h4>
                    <p className="text-sm text-muted-foreground">
                      {form.getValues("symptoms")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center space-x-2">
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            {currentStep < totalSteps ? (
              <Button onClick={nextStep} disabled={!canProceedToNext()}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={isLoading || !canProceedToNext()}
              >
                {isLoading ? "Booking..." : "Book Appointment"}
              </Button>
            )}
          </div>
        ) : (
          <div>
            <Link href={"/login"}>
              {" "}
              <Button>Login</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
