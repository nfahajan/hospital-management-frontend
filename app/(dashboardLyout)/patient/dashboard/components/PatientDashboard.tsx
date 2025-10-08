"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, parseISO, isAfter, isBefore } from "date-fns";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Activity,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  CalendarX,
  Stethoscope,
  Heart,
  Pill,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

import {
  useGetMyAppointmentsQuery,
  useGetAppointmentStatsQuery,
} from "@/redux/features/appointmentApi";
import { type Appointment } from "@/types/appointment";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function PatientDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");

  // Fetch appointments from API
  const {
    data: appointmentsResponse,
    isLoading: isLoadingAppointments,
    error: appointmentsError,
    refetch: refetchAppointments,
  } = useGetMyAppointmentsQuery({
    page: 1,
    limit: 100,
  });

  // Fetch appointment statistics
  const {
    data: statsResponse,
    isLoading: isLoadingStats,
    error: statsError,
  } = useGetAppointmentStatsQuery();

  const allAppointments = appointmentsResponse?.data?.appointments || [];
  const stats = statsResponse?.data || {
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
  };

  // Set greeting based on time of day
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 17) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("patient")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Filter appointments for dashboard display
  const now = new Date();
  const upcomingAppointments = allAppointments
    .filter((apt) => {
      const appointmentDate = parseISO(apt.appointmentDate);
      return (
        isAfter(appointmentDate, now) &&
        ["scheduled", "confirmed"].includes(apt.status)
      );
    })
    .sort(
      (a, b) =>
        parseISO(a.appointmentDate).getTime() -
        parseISO(b.appointmentDate).getTime()
    )
    .slice(0, 5); // Show only next 5 appointments

  const todayAppointments = allAppointments.filter((apt) => {
    const appointmentDate = parseISO(apt.appointmentDate);
    const today = new Date();
    return (
      appointmentDate.toDateString() === today.toDateString() &&
      ["scheduled", "confirmed", "in_progress"].includes(apt.status)
    );
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "no_show":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "no_show":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case "consultation":
        return <Stethoscope className="h-4 w-4" />;
      case "follow_up":
        return <Heart className="h-4 w-4" />;
      case "emergency":
        return <AlertCircle className="h-4 w-4" />;
      case "routine_checkup":
        return <Activity className="h-4 w-4" />;
      case "specialist_referral":
        return <User className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">
            {greeting}, {user?.email?.split("@")[0]}!
          </h1>
          <p className="text-muted-foreground mt-2">
            Here's an overview of your health journey
          </p>
        </div>
        <Button asChild>
          <Link href="/patient/book-appointment">
            <Plus className="h-4 w-4 mr-2" />
            Book Appointment
          </Link>
        </Button>
      </div>

      {/* Error States */}
      {(appointmentsError || statsError) && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load dashboard data. Please try again.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchAppointments()}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Today's Appointments Alert */}
      {todayAppointments.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Calendar className="h-5 w-5" />
              <p className="font-medium">
                You have {todayAppointments.length} appointment
                {todayAppointments.length > 1 ? "s" : ""} today
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.upcomingAppointments}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Scheduled appointments
            </p>
          </CardContent>
        </Card>

        {/* Completed Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.completedAppointments}
              </div>
            )}
            <p className="text-xs text-muted-foreground">Total visits</p>
          </CardContent>
        </Card>

        {/* Cancelled Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.cancelledAppointments}
              </div>
            )}
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        {/* Total Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingStats ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.totalAppointments}
              </div>
            )}
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button asChild className="h-auto py-4 justify-start">
            <Link href="/patient/book-appointment">
              <Plus className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">Book Appointment</div>
                <div className="text-xs font-normal opacity-80">
                  Schedule a new visit
                </div>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="h-auto py-4 justify-start"
          >
            <Link href="/patient/appointments">
              <Calendar className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">View All Appointments</div>
                <div className="text-xs font-normal opacity-80">
                  See your history
                </div>
              </div>
            </Link>
          </Button>
          <Button
            variant="outline"
            asChild
            className="h-auto py-4 justify-start"
          >
            <Link href="/patient/profile">
              <User className="mr-2 h-5 w-5" />
              <div className="text-left">
                <div className="font-semibold">My Profile</div>
                <div className="text-xs font-normal opacity-80">
                  Update information
                </div>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled visits</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/patient/appointments">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingAppointments ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <Skeleton className="w-16 h-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-8 w-20" />
                </div>
              ))}
            </div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No upcoming appointments
              </h3>
              <p className="text-muted-foreground mb-6">
                You don't have any upcoming appointments scheduled.
              </p>
              <Button asChild>
                <Link href="/patient/book-appointment">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Your First Appointment
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => {
                const appointmentDate = parseISO(appointment.appointmentDate);
                const isToday =
                  appointmentDate.toDateString() === new Date().toDateString();
                const isTomorrow =
                  appointmentDate.toDateString() ===
                  new Date(Date.now() + 24 * 60 * 60 * 1000).toDateString();

                return (
                  <div
                    key={appointment._id}
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-all",
                      isToday && "border-blue-200 bg-blue-50/50"
                    )}
                  >
                    {/* Date Display */}
                    <div
                      className={cn(
                        "w-16 h-16 rounded-lg flex flex-col items-center justify-center",
                        isToday
                          ? "bg-blue-100 text-blue-800"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      <div className="text-2xl font-bold">
                        {appointmentDate.getDate()}
                      </div>
                      <div className="text-xs font-medium">
                        {format(appointmentDate, "MMM")}
                      </div>
                    </div>

                    {/* Appointment Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">
                            Dr. {appointment.doctor?.firstName}{" "}
                            {appointment.doctor?.lastName}
                          </h3>
                          <p className="text-sm capitalize text-muted-foreground">
                            {appointment.doctor?.specialization.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              "flex items-center gap-1",
                              getStatusColor(appointment.status)
                            )}
                          >
                            {getStatusIcon(appointment.status)}
                            {appointment.status.charAt(0).toUpperCase() +
                              appointment.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {appointment.startTime} - {appointment.endTime}
                            {isToday && (
                              <span className="ml-2 text-blue-600 font-medium">
                                (Today)
                              </span>
                            )}
                            {isTomorrow && (
                              <span className="ml-2 text-green-600 font-medium">
                                (Tomorrow)
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {getAppointmentTypeIcon(appointment.type)}
                          <span>
                            {appointment.type.replace("_", " ").toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Reason:</span>{" "}
                        {appointment.reason}
                      </div>

                      {appointment.isUrgent && (
                        <Badge variant="destructive" className="text-xs">
                          Urgent
                        </Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patient/appointments/${appointment._id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest health activities</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAppointments ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {allAppointments.slice(0, 5).map((appointment) => {
                  const appointmentDate = parseISO(appointment.appointmentDate);
                  return (
                    <div
                      key={appointment._id}
                      className="flex items-center gap-3"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          getStatusColor(appointment.status)
                        )}
                      >
                        {getStatusIcon(appointment.status)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {appointment.status === "completed"
                            ? "Completed"
                            : appointment.status === "cancelled"
                            ? "Cancelled"
                            : "Scheduled"}{" "}
                          appointment
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(appointmentDate, "MMM d, yyyy")} • Dr.{" "}
                          {appointment.doctor?.firstName}{" "}
                          {appointment.doctor?.lastName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Health Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Health Insights</CardTitle>
            <CardDescription>Your health journey overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingStats ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Appointment Completion Rate</span>
                    <span>
                      {stats.totalAppointments > 0
                        ? Math.round(
                            (stats.completedAppointments /
                              stats.totalAppointments) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      stats.totalAppointments > 0
                        ? (stats.completedAppointments /
                            stats.totalAppointments) *
                          100
                        : 0
                    }
                    className="h-2"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Upcoming Appointments</span>
                    <span>{stats.upcomingAppointments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Visits</span>
                    <span>{stats.completedAppointments}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cancellation Rate</span>
                    <span>
                      {stats.totalAppointments > 0
                        ? Math.round(
                            (stats.cancelledAppointments /
                              stats.totalAppointments) *
                              100
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
