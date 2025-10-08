"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

import ScheduleAnalytics from "./ScheduleAnalytics";

import {
  useGetMySchedulesQuery,
  useCheckScheduleExistsQuery,
  useTriggerScheduleCheckMutation,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} from "@/redux/features/scheduleApi";

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  maxAppointments: number;
  currentAppointments: number;
}

interface Schedule {
  _id: string;
  doctor: string;
  date: string;
  timeSlots: TimeSlot[];
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ScheduleFormData {
  date: string;
  timeSlots: TimeSlot[];
  isActive: boolean;
  notes?: string;
}

export default function DoctorSchedule() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [activeTab, setActiveTab] = useState("calendar");
  const [formData, setFormData] = useState<ScheduleFormData>({
    date: "",
    timeSlots: [],
    isActive: true,
    notes: "",
  });

  // API Queries
  const {
    data: schedulesResponse,
    isLoading: isLoadingSchedules,
    error: schedulesError,
    refetch: refetchSchedules,
  } = useGetMySchedulesQuery();

  // API Mutations
  const [createSchedule, { isLoading: isCreating }] =
    useCreateScheduleMutation();
  const [updateSchedule, { isLoading: isUpdating }] =
    useUpdateScheduleMutation();
  const [triggerScheduleCheck, { isLoading: isCheckingSchedule }] =
    useTriggerScheduleCheckMutation();

  const schedules = schedulesResponse?.data || [];

  // Generate week dates
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("doctor")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Initialize default time slots
  const initializeTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour < 17; hour++) {
      const startTime = `${hour.toString().padStart(2, "0")}:00`;
      const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
      slots.push({
        startTime,
        endTime,
        isAvailable: true,
        maxAppointments: 2,
        currentAppointments: 0,
      });
    }
    return slots;
  };

  // Get schedule for a specific date
  const getScheduleForDate = (date: Date): Schedule | null => {
    const dateStr = format(date, "yyyy-MM-dd");
    return (
      schedules.find((schedule) => isSameDay(new Date(schedule.date), date)) ||
      null
    );
  };

  // Handle date selection with API check
  const handleDateSelect = async (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    setSelectedDate(dateStr);

    try {
      // Use RTK Query mutation to check if schedule exists for this specific date
      const checkResult = await triggerScheduleCheck(dateStr).unwrap();
      if (checkResult.success && checkResult.data.exists) {
        // Schedule exists - open edit dialog
        const existingSchedule = checkResult.data.schedule;
        setEditingSchedule(existingSchedule);
        setFormData({
          date: dateStr,
          timeSlots: existingSchedule.timeSlots,
          isActive: existingSchedule.isActive,
          notes: existingSchedule.notes || "",
        });
        setIsEditDialogOpen(true);
        toast.success("Schedule found for this date. Opening edit mode.");
      } else {
        setFormData({
          date: dateStr,
          timeSlots: initializeTimeSlots(),
          isActive: true,
          notes: "",
        });
        setIsCreateDialogOpen(true);
        toast.info("No schedule found for this date. Creating new schedule.");
      }
    } catch (error) {
      console.error("Error checking schedule existence:", error);
      // Fallback to local check if API fails
      console.log(`Fallback: Checking local schedules for date: ${dateStr}`);
      console.log(`Available schedules:`, schedules);
      const existingSchedule = getScheduleForDate(date);
      console.log(`Local schedule found:`, existingSchedule);
      if (existingSchedule) {
        setEditingSchedule(existingSchedule);
        setFormData({
          date: dateStr,
          timeSlots: existingSchedule.timeSlots,
          isActive: existingSchedule.isActive,
          notes: existingSchedule.notes || "",
        });
        setIsEditDialogOpen(true);
      } else {
        setFormData({
          date: dateStr,
          timeSlots: initializeTimeSlots(),
          isActive: true,
          notes: "",
        });
        setIsCreateDialogOpen(true);
      }
      toast.warning(
        "Using local data. Please refresh if schedule seems incorrect."
      );
    }
  };

  // Handle create schedule
  const handleCreateSchedule = async () => {
    try {
      await createSchedule({
        doctor: user?._id,
        date: formData.date,
        timeSlots: formData.timeSlots,
        isActive: formData.isActive,
        notes: formData.notes,
      }).unwrap();

      toast.success("Schedule created successfully");
      setIsCreateDialogOpen(false);
      refetchSchedules();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create schedule");
    }
  };

  // Handle update schedule
  const handleUpdateSchedule = async () => {
    if (!editingSchedule) return;

    try {
      await updateSchedule({
        id: editingSchedule._id,
        data: {
          timeSlots: formData.timeSlots,
          isActive: formData.isActive,
          notes: formData.notes,
        },
      }).unwrap();

      toast.success("Schedule updated successfully");
      setIsEditDialogOpen(false);
      setEditingSchedule(null);
      refetchSchedules();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update schedule");
    }
  };

  // Handle time slot toggle
  const handleTimeSlotToggle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, isAvailable: !slot.isAvailable } : slot
      ),
    }));
  };

  // Handle max appointments change
  const handleMaxAppointmentsChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      timeSlots: prev.timeSlots.map((slot, i) =>
        i === index ? { ...slot, maxAppointments: parseInt(value) } : slot
      ),
    }));
  };

  // Navigate weeks
  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeek((prev) => addDays(prev, direction === "next" ? 7 : -7));
  };

  // Get schedule statistics
  const getScheduleStats = () => {
    const totalSchedules = schedules.length;
    const activeSchedules = schedules.filter((s: any) => s.isActive).length;
    const totalSlots = schedules.reduce(
      (acc: number, s: any) => acc + s.timeSlots.length,
      0
    );
    const availableSlots = schedules.reduce(
      (acc: number, s: any) =>
        acc + s.timeSlots.filter((slot: any) => slot.isAvailable).length,
      0
    );
    const totalAppointments = schedules.reduce(
      (acc: number, s: any) =>
        acc +
        s.timeSlots.reduce(
          (slotAcc: number, slot: any) => slotAcc + slot.currentAppointments,
          0
        ),
      0
    );

    return {
      totalSchedules,
      activeSchedules,
      totalSlots,
      availableSlots,
      totalAppointments,
    };
  };

  const stats = getScheduleStats();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">
            Please sign in to manage your schedule.
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
            Schedule Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your availability and time slots for patient appointments
          </p>
        </div>
      </div>

      {/* Error State */}
      {schedulesError && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load schedules. Please try again.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => refetchSchedules()}
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Schedules
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalSchedules}</div>
            )}
            <p className="text-xs text-muted-foreground">Created schedules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Schedules
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeSchedules}</div>
            )}
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Slots
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{stats.availableSlots}</div>
            )}
            <p className="text-xs text-muted-foreground">Open for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Bookings
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.totalAppointments}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Patient appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingSchedules ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">
                {stats.totalSlots > 0
                  ? Math.round(
                      (stats.totalAppointments / (stats.totalSlots * 2)) * 100
                    )
                  : 0}
                %
              </div>
            )}
            <p className="text-xs text-muted-foreground">Slot utilization</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-6">
          <div className="grid">
            {/* Calendar View */}
            <div className="w-full">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Weekly Calendar</CardTitle>
                      <CardDescription>
                        Click on a date to create or edit your schedule
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("prev")}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium min-w-[120px] text-center">
                        {format(currentWeek, "MMMM yyyy")}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek("next")}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date) => {
                      const schedule = getScheduleForDate(date);
                      const isSelected =
                        selectedDate === format(date, "yyyy-MM-dd");
                      const isPast = date < new Date();

                      return (
                        <Button
                          key={date.toISOString()}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "h-20 flex-col gap-1 relative",
                            isPast && "opacity-50 cursor-not-allowed",
                            schedule && "border-primary/50"
                          )}
                          disabled={isPast}
                          onClick={() => handleDateSelect(date)}
                        >
                          <span className="text-xs font-medium">
                            {format(date, "EEE")}
                          </span>
                          <span className="text-lg font-semibold">
                            {format(date, "d")}
                          </span>
                          {schedule && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                              <div
                                className={cn(
                                  "w-2 h-2 rounded-full",
                                  schedule.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                )}
                              />
                            </div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <ScheduleAnalytics />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Templates</CardTitle>
              <CardDescription>
                Pre-configured schedule templates for quick setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Standard Business Hours</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    9:00 AM - 5:00 PM, Monday to Friday, 2 patients per slot
                  </p>
                  <Button size="sm" className="w-full">
                    Apply Template
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Extended Hours</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    8:00 AM - 6:00 PM, Monday to Friday, 2 patients per slot
                  </p>
                  <Button size="sm" className="w-full">
                    Apply Template
                  </Button>
                </div>

                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Weekend Coverage</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    9:00 AM - 1:00 PM, Saturday, 1 patient per slot
                  </p>
                  <Button size="sm" className="w-full">
                    Apply Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Schedule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Schedule</DialogTitle>
            <DialogDescription>
              Set up your availability for{" "}
              {formData.date &&
                format(new Date(formData.date), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Schedule Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label>{formData.isActive ? "Active" : "Inactive"}</Label>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Time Slots</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      timeSlots: initializeTimeSlots(),
                    }))
                  }
                >
                  Reset to Default
                </Button>
              </div>

              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {formData.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={slot.isAvailable}
                        onCheckedChange={() => handleTimeSlotToggle(index)}
                      />
                      <Label className="min-w-[100px]">
                        {slot.startTime} - {slot.endTime}
                      </Label>
                    </div>

                    {slot.isAvailable && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Max Patients:</Label>
                        <Select
                          value={slot.maxAppointments.toString()}
                          onValueChange={(value) =>
                            handleMaxAppointmentsChange(index, value)
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="ml-auto">
                      <Badge
                        variant={slot.isAvailable ? "default" : "secondary"}
                      >
                        {slot.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any special notes for this schedule..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSchedule}
              disabled={isCreating || !formData.date}
            >
              {isCreating ? "Creating..." : "Create Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Schedule Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Schedule</DialogTitle>
            <DialogDescription>
              Update your availability for{" "}
              {formData.date &&
                format(new Date(formData.date), "EEEE, MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Schedule Settings */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formData.date} disabled />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label>{formData.isActive ? "Active" : "Inactive"}</Label>
                </div>
              </div>
            </div>

            {/* Time Slots */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Time Slots</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      timeSlots: initializeTimeSlots(),
                    }))
                  }
                >
                  Reset to Default
                </Button>
              </div>

              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {formData.timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={slot.isAvailable}
                        onCheckedChange={() => handleTimeSlotToggle(index)}
                      />
                      <Label className="min-w-[100px]">
                        {slot.startTime} - {slot.endTime}
                      </Label>
                    </div>

                    {slot.isAvailable && (
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Max Patients:</Label>
                        <Select
                          value={slot.maxAppointments.toString()}
                          onValueChange={(value) =>
                            handleMaxAppointmentsChange(index, value)
                          }
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      {slot.currentAppointments > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {slot.currentAppointments} booked
                        </Badge>
                      )}
                      <Badge
                        variant={slot.isAvailable ? "default" : "secondary"}
                      >
                        {slot.isAvailable ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                placeholder="Add any special notes for this schedule..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingSchedule(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateSchedule} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
