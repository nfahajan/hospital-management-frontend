"use client";

import React, { useState } from "react";
import { Calendar, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AppointmentBookingForm } from "./AppointmentBookingForm";
import { MyAppointments } from "./MyAppointments";
import { useGetUpcomingAppointmentsQuery } from "@/redux/features/appointmentApi";
// Mock auth hook - replace with actual auth implementation
const useAuth = () => ({
  user: { id: "1", roles: ["patient"], email: "patient@example.com" },
  isLoading: false,
  isAuthenticated: true,
});

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState("book");
  const [showBookingForm, setShowBookingForm] = useState(false);

  const { user } = useAuth();
  const { data: upcomingResponse, isLoading: isLoadingUpcoming } =
    useGetUpcomingAppointmentsQuery({ limit: 3 });

  const upcomingAppointments = upcomingResponse?.data?.appointments || [];

  const handleBookingSuccess = () => {
    setShowBookingForm(false);
    setActiveTab("my-appointments");
    // You can add a success toast here
  };

  const handleBookingCancel = () => {
    setShowBookingForm(false);
  };

  if (showBookingForm) {
    return (
      <div className="container mx-auto p-6">
        <AppointmentBookingForm
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingUpcoming ? "..." : upcomingAppointments.length}
            </div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoadingUpcoming
                ? "..."
                : upcomingAppointments.filter((apt) => {
                    const aptDate = new Date(apt.appointmentDate);
                    const now = new Date();
                    const weekFromNow = new Date(
                      now.getTime() + 7 * 24 * 60 * 60 * 1000
                    );
                    return aptDate >= now && aptDate <= weekFromNow;
                  }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Account Status
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Patient account</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setShowBookingForm(true)}
            >
              <Plus className="h-6 w-6" />
              <span>Book New Appointment</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("my-appointments")}
            >
              <Calendar className="h-6 w-6" />
              <span>View My Appointments</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("my-appointments")}
            >
              <Clock className="h-6 w-6" />
              <span>Upcoming Appointments</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => setActiveTab("my-appointments")}
            >
              <AlertCircle className="h-6 w-6" />
              <span>Appointment History</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Appointments Preview */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-sm">
                        {appointment.doctor.firstName.charAt(0)}
                        {appointment.doctor.lastName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        Dr. {appointment.doctor.firstName}{" "}
                        {appointment.doctor.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          appointment.appointmentDate
                        ).toLocaleDateString()}{" "}
                        at {appointment.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {appointment.type.replace("_", " ").toUpperCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab("my-appointments")}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}

              {upcomingAppointments.length > 3 && (
                <div className="text-center pt-2">
                  <Button
                    variant="ghost"
                    onClick={() => setActiveTab("my-appointments")}
                  >
                    View All {upcomingAppointments.length} Appointments
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="book">Book Appointment</TabsTrigger>
          <TabsTrigger value="my-appointments">My Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="book" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Book a New Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Ready to book an appointment?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Click the button below to start the appointment booking
                  process.
                </p>
                <Button onClick={() => setShowBookingForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Booking
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-appointments" className="space-y-4">
          <MyAppointments />
        </TabsContent>
      </Tabs>

      {/* Patient Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Patient Information</h3>
              <p className="text-sm text-muted-foreground">
                {user?.email} • Patient Account
              </p>
            </div>
            <Badge variant="outline">Active</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
