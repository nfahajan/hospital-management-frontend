"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format, subDays } from "date-fns";
import {
  Users,
  Calendar,
  UserCog,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  Heart,
  Zap,
  Shield,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// API imports
import { useGetDashboardStatsQuery } from "@/redux/features/adminApi";
import { useGetAllUsersQuery } from "@/redux/features/userApi";
import { useGetAllAppointmentsQuery } from "@/redux/features/appointmentApi";

// Types
interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [chartData, setChartData] = useState<{
    appointmentTrends: ChartData[];
    statusDistribution: ChartData[];
    userGrowth: ChartData[];
  } | null>(null);

  // API queries
  const {
    data: dashboardStatsResponse,
    isLoading: isLoadingDashboardStats,
    error: dashboardStatsError,
    refetch: refetchDashboardStats,
  } = useGetDashboardStatsQuery();

  // Get recent users and appointments for charts
  const { data: recentUsersResponse, isLoading: isLoadingRecentUsers } =
    useGetAllUsersQuery({ limit: 100 });

  const {
    data: recentAppointmentsResponse,
    isLoading: isLoadingRecentAppointments,
  } = useGetAllAppointmentsQuery({ limit: 100 });

  const dashboardStats = dashboardStatsResponse?.data;

  // Authentication check
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      (!user.roles.includes("admin") && !user.roles.includes("superadmin"))
    ) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Process chart data
  useEffect(() => {
    if (
      recentAppointmentsResponse?.data?.appointments &&
      recentUsersResponse?.data?.users
    ) {
      const appointments = recentAppointmentsResponse.data.appointments;
      const users = recentUsersResponse.data.users;

      // Generate appointment trends (last 6 months)
      const appointmentTrends: ChartData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subDays(new Date(), i * 30);
        const monthName = format(date, "MMM");
        const count = appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointmentDate);
          return (
            aptDate.getMonth() === date.getMonth() &&
            aptDate.getFullYear() === date.getFullYear()
          );
        }).length;

        appointmentTrends.push({
          name: monthName,
          value: count,
          color: "hsl(var(--chart-1))",
        });
      }

      // Generate status distribution
      const statusDistribution: ChartData[] = [
        {
          name: "Completed",
          value: appointments.filter((apt: any) => apt.status === "completed")
            .length,
          color: "#10b981",
        },
        {
          name: "Scheduled",
          value: appointments.filter((apt: any) => apt.status === "scheduled")
            .length,
          color: "#3b82f6",
        },
        {
          name: "Confirmed",
          value: appointments.filter((apt: any) => apt.status === "confirmed")
            .length,
          color: "#8b5cf6",
        },
        {
          name: "Cancelled",
          value: appointments.filter((apt: any) => apt.status === "cancelled")
            .length,
          color: "#ef4444",
        },
      ];

      // Generate user growth (last 6 months)
      const userGrowth: ChartData[] = [];
      for (let i = 5; i >= 0; i--) {
        const date = subDays(new Date(), i * 30);
        const monthName = format(date, "MMM");
        const count = users.filter((usr: any) => {
          const userDate = new Date(usr.createdAt);
          return (
            userDate.getMonth() === date.getMonth() &&
            userDate.getFullYear() === date.getFullYear()
          );
        }).length;

        userGrowth.push({
          name: monthName,
          value: count,
          color: "hsl(var(--chart-2))",
        });
      }

      setChartData({
        appointmentTrends,
        statusDistribution,
        userGrowth,
      });
    }
  }, [recentAppointmentsResponse, recentUsersResponse]);

  // Error handling
  useEffect(() => {
    if (dashboardStatsError) {
      toast.error("Failed to load dashboard data", {
        description: "Please try refreshing the page.",
      });
    }
  }, [dashboardStatsError]);

  // Loading state
  if (isLoadingDashboardStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (dashboardStatsError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              System overview and analytics
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to load dashboard data
            </h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the dashboard statistics.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardStats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            System overview and analytics - {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.users.total}
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
              <p>Total Users in system</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Patients
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.users.patients}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Registered patients in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.users.doctors}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active medical professionals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Appointments
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.appointments.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total appointments in system
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Today's Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Appointments
            </CardTitle>
            <CardDescription>Appointments scheduled for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {dashboardStats.appointments.today}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Upcoming</span>
                <span className="font-medium">
                  {dashboardStats.appointments.upcoming}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed Today</span>
                <span className="font-medium">
                  {dashboardStats.appointments.completed}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Cancelled Today</span>
                <span className="font-medium">
                  {dashboardStats.appointments.cancelled}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Status
            </CardTitle>
            <CardDescription>Current user account status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Active</span>
                </div>
                <span className="text-xl font-bold">
                  {dashboardStats.users.active}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Pending</span>
                </div>
                <span className="text-xl font-bold">
                  {dashboardStats.users.pending}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Blocked</span>
                </div>
                <span className="text-xl font-bold">
                  {dashboardStats.users.blocked}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Platform performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">User Engagement</span>
                  <span className="text-sm font-medium">
                    {dashboardStats.users.engagementRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${dashboardStats.users.engagementRate}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Appointment Success Rate</span>
                  <span className="text-sm font-medium">
                    {dashboardStats.appointments.successRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${dashboardStats.appointments.successRate}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">System Utilization</span>
                  <span className="text-sm font-medium">
                    {dashboardStats.appointments.utilizationRate}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full"
                    style={{
                      width: `${dashboardStats.appointments.utilizationRate}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Appointment Trends</CardTitle>
            <CardDescription>
              Monthly appointment volume over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData?.appointmentTrends && (
              <ChartContainer
                config={{
                  value: {
                    label: "Appointments",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData.appointmentTrends}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="var(--color-value)"
                      strokeWidth={2}
                      dot={{ fill: "var(--color-value)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status Distribution</CardTitle>
            <CardDescription>
              Current appointment status breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData?.statusDistribution && (
              <ChartContainer
                config={{
                  value: {
                    label: "Count",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.statusDistribution}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-muted"
                    />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="value"
                      fill="var(--color-value)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Growth</CardTitle>
          <CardDescription>New user registrations over time</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData?.userGrowth && (
            <ChartContainer
              config={{
                value: {
                  label: "New Users",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.userGrowth}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-muted"
                  />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="var(--color-value)"
                    strokeWidth={2}
                    dot={{ fill: "var(--color-value)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
