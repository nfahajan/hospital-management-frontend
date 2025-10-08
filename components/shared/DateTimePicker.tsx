"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addDays,
  startOfWeek,
  isSameDay,
  isToday,
  isTomorrow,
} from "date-fns";
import { useGetAvailableSlotsQuery } from "@/redux/features/scheduleApi";
import { useGetPatientAppointmentsForDateQuery } from "@/redux/features/appointmentApi";
import {
  type Doctor as AppointmentDoctor,
  type AvailableSlot,
  type DayOfWeek,
} from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  doctor: AppointmentDoctor;
  selectedDate: string | null;
  selectedTime: string | null;
  onDateSelect: (date: string) => void;
  onTimeSelect: (time: string) => void;
  className?: string;
}

export function DateTimePicker({
  doctor,
  selectedDate,
  selectedTime,
  onDateSelect,
  onTimeSelect,
  className = "",
}: DateTimePickerProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);

  // Generate week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Fetch available slots for the selected date
  const { data: slotsResponse, isLoading: isLoadingSlots } =
    useGetAvailableSlotsQuery(
      { doctorId: doctor._id, date: selectedDate || "" },
      { skip: !selectedDate }
    );

  // Fetch patient's existing appointments for the selected date
  const {
    data: patientAppointmentsResponse,
    isLoading: isLoadingPatientAppointments,
  } = useGetPatientAppointmentsForDateQuery(selectedDate || "", {
    skip: !selectedDate,
  });

  useEffect(() => {
    if (slotsResponse?.data) {
      // Handle the nested response structure from backend
      if (Array.isArray(slotsResponse.data)) {
        setAvailableSlots(slotsResponse.data);
      } else if (
        typeof slotsResponse.data === "object" &&
        slotsResponse.data !== null
      ) {
        const responseData = slotsResponse.data as any;
        if (
          responseData.availableSlots &&
          Array.isArray(responseData.availableSlots)
        ) {
          // Transform each time slot into an AvailableSlot
          const transformedSlots = responseData.availableSlots.map(
            (slot: any) => ({
              date: responseData.date,
              dayOfWeek: getDayOfWeek(responseData.date),
              timeSlot: slot,
              availableSpots: slot.availableSpots || 0,
            })
          );
          setAvailableSlots(transformedSlots);
        } else if (responseData.success && Array.isArray(responseData.data)) {
          setAvailableSlots(responseData.data);
        }
      }
    }
  }, [slotsResponse]);

  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    onDateSelect(dateStr);
    onTimeSelect(""); // Reset time selection when date changes
  };

  const handleTimeSelect = (timeSlot: string) => {
    if (!timeSlot || typeof timeSlot !== "string") {
      return;
    }
    onTimeSelect(timeSlot);
  };

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    return format(date, "EEE");
  };

  const getDateNumber = (date: Date) => {
    return format(date, "d");
  };

  const getMonthYear = (date: Date) => {
    return format(date, "MMMM yyyy");
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return isSameDay(date, new Date(selectedDate));
  };

  const isDatePast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const getDayOfWeek = (dateString: string): DayOfWeek => {
    const date = new Date(dateString);
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;
    return dayNames[date.getDay()];
  };

  const getAvailableTimeSlots = () => {
    // Get patient's existing appointments for this date
    const existingAppointments =
      patientAppointmentsResponse?.data?.appointments || [];

    // If we have real data from the backend, use it
    if (availableSlots.length > 0) {
      return availableSlots.map((slot) => {
        const startTime = slot.timeSlot.startTime;
        const endTime = slot.timeSlot.endTime;

        // Check if patient already has an appointment at this time slot
        const hasExistingAppointment = existingAppointments.some(
          (apt) => apt.startTime === startTime && apt.endTime === endTime
        );

        return {
          startTime,
          endTime,
          isAvailable:
            slot.timeSlot.isAvailable &&
            !hasExistingAppointment &&
            slot.availableSpots > 0,
          maxAppointments: slot.timeSlot.maxAppointments || 2,
          currentAppointments: slot.timeSlot.currentAppointments || 0,
          isPatientBooked: hasExistingAppointment,
          existingAppointment: hasExistingAppointment
            ? existingAppointments.find(
                (apt) => apt.startTime === startTime && apt.endTime === endTime
              )
            : null,
        };
      });
    }

    // Fallback: Create default time slots if no backend data available
    const timeSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;

      // Check if patient already has an appointment at this time slot
      const hasExistingAppointment = existingAppointments.some(
        (apt) => apt.startTime === startTime && apt.endTime === endTime
      );

      timeSlots.push({
        startTime,
        endTime,
        isAvailable: !hasExistingAppointment,
        maxAppointments: 2,
        currentAppointments: 0, // Default to 0 when no backend data
        isPatientBooked: hasExistingAppointment,
        existingAppointment: hasExistingAppointment
          ? existingAppointments.find(
              (apt) => apt.startTime === startTime && apt.endTime === endTime
            )
          : null,
      });
    }

    return timeSlots;
  };

  const timeSlots = getAvailableTimeSlots();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Calendar Header */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Select Date & Time</h2>
          <p className="text-muted-foreground">
            Choose your preferred appointment slot
          </p>
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-medium">
            {getMonthYear(currentWeek)}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateWeek("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Week Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {weekDates.map((date) => {
            const isSelected = isDateSelected(date);
            const isPast = isDatePast(date);
            const dateString = format(date, "yyyy-MM-dd");

            // Allow selection of any future date (Monday to Friday only)
            const dayOfWeek = date.getDay();
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
            const isAvailable = !isPast && !isWeekend;

            return (
              <Button
                key={date.toISOString()}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "h-[74px] flex-col gap-1",
                  (isPast || isWeekend) && "opacity-50 cursor-not-allowed",
                  isAvailable && "hover:bg-primary/10",
                  isSelected && "hover:bg-primary"
                )}
                disabled={isPast || isWeekend}
                onClick={() => handleDateSelect(date)}
              >
                <span className="text-xs font-medium">
                  {getDateLabel(date)}
                </span>
                <span className="text-lg font-semibold">
                  {getDateNumber(date)}
                </span>
                {isWeekend && !isPast && (
                  <span className="text-xs text-red-500">Closed</span>
                )}
              </Button>
            );
          })}
        </div>

        {/* Selected Date Info */}
        {selectedDate && (
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Selected: {format(new Date(selectedDate), "EEEE, MMMM d, yyyy")}
            </p>
          </div>
        )}
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Available Time Slots</h3>
          </div>
          {isLoadingSlots ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : timeSlots.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No available slots</p>
              <p className="text-sm text-muted-foreground">
                This doctor has no available time slots for the selected date.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.startTime}
                  variant={
                    selectedTime === slot.startTime ? "default" : "outline"
                  }
                  className={cn(
                    "h-12",
                    slot.isPatientBooked &&
                      "opacity-50 !cursor-not-allowed bg-gray-300 border-gray-950"
                  )}
                  onClick={() =>
                    !slot.isPatientBooked && handleTimeSelect(slot.startTime)
                  }
                  disabled={!slot.isAvailable || slot.isPatientBooked}
                >
                  <div className="flex flex-col items-center">
                    <span>
                      {slot.startTime} - {slot.endTime}
                    </span>
                    {slot.isPatientBooked ? (
                      <span className="text-xs text-red-600 font-medium">
                        Already Booked
                      </span>
                    ) : slot.maxAppointments ? (
                      <span className="text-xs">
                        {slot.currentAppointments}/{slot.maxAppointments}
                      </span>
                    ) : null}
                  </div>
                </Button>
              ))}
            </div>
          )}

          {/* Existing Appointments for Selected Date */}
          {selectedDate &&
            patientAppointmentsResponse?.data?.appointments &&
            patientAppointmentsResponse.data.appointments.length > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Your Upcoming Appointments
                </h4>
                <div className="space-y-2">
                  {patientAppointmentsResponse.data.appointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="flex items-center justify-between p-2 bg-white rounded border"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {apt.startTime} - {apt.endTime}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {apt.doctor.name} • {apt.type}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {apt.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Selected Time Info */}
          {selectedTime && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Selected Time</p>
                  <p className="text-sm text-muted-foreground">
                    {(() => {
                      // Find the selected slot to get both start and end times
                      const selectedSlot = timeSlots.find(
                        (slot) => slot.startTime === selectedTime
                      );
                      if (selectedSlot) {
                        return `${selectedSlot.startTime} - ${selectedSlot.endTime}`;
                      }
                      // Fallback to just start time if slot not found
                      return selectedTime;
                    })()}
                  </p>
                </div>
                <Badge variant="outline">Available</Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
