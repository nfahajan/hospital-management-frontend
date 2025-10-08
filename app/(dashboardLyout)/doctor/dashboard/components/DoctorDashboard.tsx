"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  CalendarDays,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";
import { useGetDoctorDashboardStatsQuery } from "@/redux/features/doctorApi";
import { useGetUpcomingAppointmentsQuery } from "@/redux/features/appointmentApi";
import AppointmentTrendChart from "./AppointmentTrendChart";

export default function DoctorDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // API hooks
  const {
    data: dashboardStats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useGetDoctorDashboardStatsQuery();

  const { data: upcomingAppointments, isLoading: isLoadingUpcoming } =
    useGetUpcomingAppointmentsQuery({ limit: 5 });

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("doctor")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  if (isLoadingStats) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts and Tables Skeleton */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (statsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              Doctor Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, Dr. {user?.email.split("@")[0] || "Doctor"}
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load dashboard data. Please try again.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchStats()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = dashboardStats?.data;
  const recentAppointments = stats?.recentAppointments || [];
  const trends = stats?.trends?.dailyTrends || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Doctor Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back, Dr. {user?.email.split("@")[0] || "Doctor"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/doctor/appointments">
              <Calendar className="h-4 w-4 mr-2" />
              View Appointments
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/doctor/profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.todayAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled for today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.upcomingAppointments || 0}
            </div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.uniquePatients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Unique patients seen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.completionRate || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Appointments completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appointment Trends Chart */}
        <AppointmentTrendChart
          data={trends}
          title="Appointment Trends"
          description="Daily appointment counts for the last 7 days"
        />

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Your practice statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Completed</span>
              </div>
              <span className="text-sm font-bold">
                {stats?.overview.completedAppointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Cancelled</span>
              </div>
              <span className="text-sm font-bold">
                {stats?.overview.cancelledAppointments || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">This Week</span>
              </div>
              <span className="text-sm font-bold">
                {stats?.trends.weekly || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">This Month</span>
              </div>
              <span className="text-sm font-bold">
                {stats?.trends.monthly || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Appointments
            </CardTitle>
            <CardDescription>Your latest appointment activity</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/doctor/appointments">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingUpcoming ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentAppointments.length > 0 ? (
            <div className="space-y-4">
              {recentAppointments.map((appointment: any) => (
                <div
                  key={appointment._id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {appointment.patient?.firstName}{" "}
                        {appointment.patient?.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.patient?.user?.email ||
                          appointment.patient?.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          appointment.status === "completed"
                            ? "default"
                            : appointment.status === "cancelled"
                            ? "destructive"
                            : appointment.status === "in_progress"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {appointment.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(appointment.appointmentDate),
                        "MMM d, yyyy"
                      )}{" "}
                      at {appointment.startTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent appointments found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" asChild className="h-auto p-4">
              <Link
                href="/doctor/appointments"
                className="flex flex-col items-center gap-2"
              >
                <Calendar className="h-6 w-6" />
                <span>View Appointments</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4">
              <Link
                href="/doctor/appointments?status=scheduled"
                className="flex flex-col items-center gap-2"
              >
                <Clock className="h-6 w-6" />
                <span>Today's Schedule</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4">
              <Link
                href="/doctor/profile"
                className="flex flex-col items-center gap-2"
              >
                <User className="h-6 w-6" />
                <span>Update Profile</span>
              </Link>
            </Button>
            <Button variant="outline" asChild className="h-auto p-4">
              <Link
                href="/doctor/appointments?status=completed"
                className="flex flex-col items-center gap-2"
              >
                <CheckCircle2 className="h-6 w-6" />
                <span>View History</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
