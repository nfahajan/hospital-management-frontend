"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  createAppointmentSchema,
  type CreateAppointmentFormData,
} from "@/lib/validations/appointment";
import { useCreateAppointmentMutation } from "@/redux/features/appointmentApi";
import { type Doctor as AppointmentDoctor } from "@/types/appointment";
import { APPOINTMENT_TYPES } from "@/types/appointment";
import { useAuth } from "@/hooks/useAuth";

interface AppointmentFormProps {
  selectedDoctor: AppointmentDoctor;
  selectedDate: string;
  selectedTime: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function AppointmentForm({
  selectedDoctor,
  selectedDate,
  selectedTime,
  onSuccess,
  onCancel,
  className = "",
}: AppointmentFormProps) {
  const [isUrgent, setIsUrgent] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const [createAppointment, { isLoading }] = useCreateAppointmentMutation();

  const form = useForm<CreateAppointmentFormData>({
    resolver: zodResolver(createAppointmentSchema),
    defaultValues: {
      patientId: user?._id || "",
      doctorId: selectedDoctor._id,
      appointmentDate: selectedDate,
      startTime: selectedTime,
      endTime: calculateEndTime(selectedTime),
      type: "consultation",
      reason: "",
      symptoms: "",
      isUrgent: false,
    },
  });

  // Calculate end time (1 hour after start time)
  function calculateEndTime(startTime: string): string {
    try {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(startTime)) {
        console.error("Invalid time format:", startTime);
        return startTime;
      }

      const [hours, minutes] = startTime.split(":").map(Number);
      const endHours = hours + 1;
      const endTimeStr = `${endHours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;
      return endTimeStr;
    } catch (error) {
      console.error("Error calculating end time:", error);
      return startTime;
    }
  }

  const onSubmit = async (data: CreateAppointmentFormData) => {
    if (!isAuthenticated || !user) {
      toast.error("Please sign in to book an appointment");
      return;
    }

    try {
      const appointmentData = {
        ...data,
        doctorId: selectedDoctor._id,
        appointmentDate: selectedDate,
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime),
        isUrgent,
      };

      await createAppointment(appointmentData).unwrap();

      toast.success("Appointment booked successfully!");
      onSuccess?.();
    } catch (error: any) {
      console.error("Appointment booking error:", error);
      toast.error(error?.data?.message || "Failed to book appointment");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Appointment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Appointment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Doctor Information */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Doctor Information
              </h4>
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {selectedDoctor.firstName.charAt(0)}
                    {selectedDoctor.lastName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedDoctor.specialization}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${selectedDoctor.consultationFee} consultation fee
                  </p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Appointment Details
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium">
                    {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time:</span>
                  <span className="font-medium">
                    {selectedTime} - {calculateEndTime(selectedTime)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">1 hour</span>
                </div>
                {isUrgent && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    <Badge variant="destructive">Urgent</Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appointment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Appointment Type */}
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
                                <div className="font-medium">{type.label}</div>
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

              {/* Reason for Visit */}
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

              {/* Symptoms */}
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

              {/* Urgent Checkbox */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="urgent"
                  checked={isUrgent}
                  onCheckedChange={(checked) => setIsUrgent(checked === true)}
                />
                <label
                  htmlFor="urgent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  This is an urgent appointment
                </label>
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
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Booking...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Book Appointment
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
