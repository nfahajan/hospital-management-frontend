"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  RefreshCw,
  Download,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// API Hooks
import { useGetMyScheduleAnalyticsQuery } from "@/redux/features/scheduleApi";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
];

export default function ScheduleAnalytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  // API Query
  const {
    data: analyticsResponse,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useGetMyScheduleAnalyticsQuery({ period: selectedPeriod });

  const analytics = analyticsResponse?.data;

  // Handle period change
  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  // Handle refresh
  const handleRefresh = () => {
    refetchAnalytics();
    toast.success("Analytics data refreshed");
  };

  // Handle export (placeholder)
  const handleExport = () => {
    toast.info("Export functionality coming soon");
  };

  // Error state
  if (analyticsError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load analytics data. Please try again.</p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetchAnalytics()}
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Schedule Analytics</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your schedule performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Utilization
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.utilization.overall || 0}%
              </div>
            )}
            <div className="mt-2">
              <Progress
                value={analytics?.utilization.overall || 0}
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics?.appointments.total || 0} of{" "}
              {analytics?.schedules.totalSlots || 0} slots booked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.utilization.completionRate || 0}%
              </div>
            )}
            <div className="mt-2">
              <Progress
                value={analytics?.utilization.completionRate || 0}
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics?.appointments.completed || 0} completed appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cancellation Rate
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.utilization.cancellationRate || 0}%
              </div>
            )}
            <div className="mt-2">
              <Progress
                value={analytics?.utilization.cancellationRate || 0}
                className="h-2"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {analytics?.appointments.cancelled || 0} cancelled appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {analytics?.schedules.active || 0}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {analytics?.schedules.availableSlots || 0} slots available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Utilization Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Utilization</CardTitle>
            <CardDescription>
              Daily slot utilization over the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "utilization" ? `${value}%` : value,
                      name === "utilization"
                        ? "Utilization"
                        : name === "bookedSlots"
                        ? "Booked"
                        : "Total Slots",
                    ]}
                    labelFormatter={(label) => `Day: ${label}`}
                  />
                  <Bar dataKey="totalSlots" fill="#e2e8f0" name="totalSlots" />
                  <Bar
                    dataKey="bookedSlots"
                    fill="#3b82f6"
                    name="bookedSlots"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Time Slot Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Time Slot Popularity</CardTitle>
            <CardDescription>
              Appointment distribution by time slots
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.timeSlotStats || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "appointments" ? value : `$${value}`,
                      name === "appointments" ? "Appointments" : "Revenue",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="appointments"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Day of Week Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Day of Week Distribution</CardTitle>
            <CardDescription>
              Appointment distribution by day of the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnalytics ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={
                      analytics?.dayOfWeekStats?.map((day, index) => ({
                        ...day,
                        color: COLORS[index % COLORS.length],
                      })) || []
                    }
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ day, appointments, value }: any) =>
                      `${day}: ${appointments} (${(
                        (appointments / (analytics?.appointments.total || 1)) *
                        100
                      ).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="appointments"
                  >
                    {(analytics?.dayOfWeekStats || []).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
            <CardDescription>Key insights and recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingAnalytics ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {(analytics?.utilization.overall || 0) < 50 && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">
                        Low Utilization
                      </p>
                      <p className="text-sm text-blue-700">
                        Consider reducing available slots or promoting your
                        services to increase bookings.
                      </p>
                    </div>
                  </div>
                )}

                {(analytics?.utilization.cancellationRate || 0) > 20 && (
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">
                        High Cancellation Rate
                      </p>
                      <p className="text-sm text-orange-700">
                        Consider implementing a cancellation policy or reminder
                        system.
                      </p>
                    </div>
                  </div>
                )}

                {(analytics?.utilization.completionRate || 0) > 90 && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <Target className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">
                        Excellent Completion Rate
                      </p>
                      <p className="text-sm text-green-700">
                        Great job! Your patients are showing up consistently.
                      </p>
                    </div>
                  </div>
                )}

                {(analytics?.timeSlotStats || []).some(
                  (slot) => slot.appointments === 0
                ) && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-900">
                        Unused Time Slots
                      </p>
                      <p className="text-sm text-yellow-700">
                        Some time slots have no bookings. Consider adjusting
                        your schedule.
                      </p>
                    </div>
                  </div>
                )}

                {(!analytics || analytics.appointments.total === 0) && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="h-5 w-5 text-gray-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">
                        No Data Available
                      </p>
                      <p className="text-sm text-gray-700">
                        No appointments found for the selected period. Create
                        some schedules to see analytics.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Statistics</CardTitle>
          <CardDescription>
            Comprehensive breakdown of your schedule performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-12 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-24 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {analytics?.schedules.total || 0}
                </div>
                <p className="text-sm text-muted-foreground">Total Schedules</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {analytics?.schedules.active || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Active Schedules
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {analytics?.schedules.totalSlots || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Time Slots
                </p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analytics?.schedules.availableSlots || 0}
                </div>
                <p className="text-sm text-muted-foreground">Available Slots</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Appointment Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Appointment Status Breakdown</CardTitle>
          <CardDescription>
            Distribution of appointments by status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingAnalytics ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="text-center">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics?.appointments.scheduled || 0}
                </div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {analytics?.appointments.completed || 0}
                </div>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {analytics?.appointments.cancelled || 0}
                </div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {analytics?.appointments.confirmed || 0}
                </div>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {analytics?.appointments.noShow || 0}
                </div>
                <p className="text-sm text-muted-foreground">No Show</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
