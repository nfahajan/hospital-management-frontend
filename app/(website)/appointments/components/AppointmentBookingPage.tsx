"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentBookingForm } from "./AppointmentBookingForm";

export default function AppointmentBookingPage() {
  const router = useRouter();
  const [showBookingForm, setShowBookingForm] = useState(true);

  const handleBookingSuccess = () => {
    // Redirect to patient dashboard after successful booking
    router.push("/patient/dashboard");
  };

  const handleGoBack = () => {
    router.back();
  };

  if (!showBookingForm) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-center">
                Book Your Medical Appointment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                Select a doctor, choose your preferred date and time, and book
                your appointment in just a few simple steps.
              </p>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <AppointmentBookingForm
            onSuccess={handleBookingSuccess}
            onCancel={handleGoBack}
          />
        </div>
      </div>
    </div>
  );
}
