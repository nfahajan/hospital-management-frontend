"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { CalendarIcon, Clock, Stethoscope, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Navigation } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

const doctors = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    image: "/female-doctor.png",
  },
  {
    id: "2",
    name: "Dr. Michael Chen",
    specialty: "Neurologist",
    image: "/male-doctor.png",
  },
  {
    id: "3",
    name: "Dr. Emily Williams",
    specialty: "Pediatrician",
    image: "/female-pediatrician.png",
  },
  {
    id: "4",
    name: "Dr. James Brown",
    specialty: "Orthopedic",
    image: "/male-orthopedic-doctor.png",
  },
];

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

export default function AppointmentsPage() {
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("");
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle appointment booking
    console.log({
      doctor: selectedDoctor,
      date,
      time: selectedTime,
      patientName,
      patientEmail,
      patientPhone,
      reason,
    });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1 bg-gradient-to-b from-card to-background">
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-md text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
              <h1 className="mb-4 text-3xl font-bold">
                Appointment Confirmed!
              </h1>
              <p className="mb-6 text-lg text-muted-foreground leading-relaxed">
                Your appointment has been successfully booked. We've sent a
                confirmation email to{" "}
                <span className="font-medium text-foreground">
                  {patientEmail}
                </span>
              </p>
              <Card className="mb-6 text-left">
                <CardHeader>
                  <CardTitle>Appointment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Doctor</p>
                      <p className="font-medium">
                        {doctors.find((d) => d.id === selectedDoctor)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {date && format(date, "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Time</p>
                      <p className="font-medium">{selectedTime}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={() => setIsSubmitted(false)}>
                  Book Another Appointment
                </Button>
                <Button variant="outline" asChild>
                  <a href="/">Go to Home</a>
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-gradient-to-b from-card to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Book an Appointment
            </h1>
            <p className="mt-2 text-lg text-muted-foreground text-pretty">
              Choose your preferred doctor, date, and time slot
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Doctor</CardTitle>
                      <CardDescription>
                        Choose from our expert medical team
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        {doctors.map((doctor) => (
                          <div
                            key={doctor.id}
                            onClick={() => setSelectedDoctor(doctor.id)}
                            className={cn(
                              "flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all hover:border-primary",
                              selectedDoctor === doctor.id
                                ? "border-primary bg-primary/5"
                                : "border-border"
                            )}
                          >
                            <img
                              src={doctor.image || "/placeholder.svg"}
                              alt={doctor.name}
                              className="h-16 w-16 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-semibold">{doctor.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {doctor.specialty}
                              </p>
                            </div>
                            {selectedDoctor === doctor.id && (
                              <CheckCircle2 className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Select Date</CardTitle>
                      <CardDescription>
                        Choose your preferred appointment date
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) =>
                          date < new Date() || date < new Date("1900-01-01")
                        }
                        className="rounded-md border"
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Select Time Slot</CardTitle>
                      <CardDescription>
                        Available time slots for your appointment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={
                              selectedTime === time ? "default" : "outline"
                            }
                            className="w-full"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={
                      !selectedDoctor ||
                      !date ||
                      !selectedTime ||
                      !patientName ||
                      !patientEmail ||
                      !patientPhone
                    }
                  >
                    <CalendarIcon className="mr-2 h-5 w-5" />
                    Confirm Appointment
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
