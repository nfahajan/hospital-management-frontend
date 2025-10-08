"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, UserCheck, UserX, Clock, XCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  useUpdateUserStatusMutation,
  type User,
} from "@/redux/features/userApi";
import { USER_STATUSES } from "@/types/user";

const statusUpdateSchema = z.object({
  status: z.enum(["pending", "approved", "blocked", "declined", "hold"], {
    message: "Please select a status",
  }),
  reason: z.string().optional(),
});

type StatusUpdateFormData = z.infer<typeof statusUpdateSchema>;

interface UserStatusDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserStatusDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: UserStatusDialogProps) {
  const [updateStatus, { isLoading }] = useUpdateUserStatusMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StatusUpdateFormData>({
    resolver: zodResolver(statusUpdateSchema),
    defaultValues: {
      status: user?.status || "pending",
      reason: "",
    },
  });

  const selectedStatus = watch("status");

  // Reset form when user changes
  React.useEffect(() => {
    if (user) {
      reset({
        status: user.status,
        reason: "",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: StatusUpdateFormData) => {
    if (!user) return;

    try {
      await updateStatus({
        id: user._id,
        data: {
          status: data.status,
          reason: data.reason || undefined,
        },
      }).unwrap();

      toast.success("User status updated successfully", {
        description: `${user.email} status changed to ${data.status}`,
      });

      onSuccess();
    } catch (error: any) {
      toast.error("Failed to update user status", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <UserCheck className="h-4 w-4" />;
      case "blocked":
        return <UserX className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "declined":
        return <XCircle className="h-4 w-4" />;
      case "hold":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "approved":
        return "User will have full access to the system";
      case "blocked":
        return "User will be denied access to the system";
      case "pending":
        return "User registration is pending approval";
      case "declined":
        return "User registration has been declined";
      case "hold":
        return "User account is temporarily on hold";
      default:
        return "";
    }
  };

  const getStatusColor = (status: string) => {
    const statusConfig = USER_STATUSES.find((s) => s.value === status);
    return statusConfig?.color || "bg-gray-100 text-gray-800";
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Update User Status
          </DialogTitle>
          <DialogDescription>
            Change the status for {user.email}
          </DialogDescription>
        </DialogHeader>

        {/* Current User Info */}
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{user.email}</span>
              </div>
              {user.profile && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Name:</span>
                  <span className="text-sm">
                    {user.profile.firstName} {user.profile.lastName}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Status:</span>
                <Badge className={getStatusColor(user.status)}>
                  {user.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Roles:</span>
                <div className="flex gap-1">
                  {user.roles.map((role) => (
                    <Badge key={role} variant="outline" className="text-xs">
                      {role}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Status Selection */}
            <div className="space-y-2">
              <Label htmlFor="status">New Status *</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger
                  className={errors.status ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {USER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.value)}
                        <span>{status.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* Status Description */}
            {selectedStatus && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {getStatusDescription(selectedStatus)}
                </AlertDescription>
              </Alert>
            )}

            {/* Reason */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (Optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter reason for status change..."
                {...register("reason")}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Provide a reason for the status change (recommended for
                declined/blocked status)
              </p>
            </div>

            {/* Warning for sensitive status changes */}
            {(selectedStatus === "blocked" ||
              selectedStatus === "declined") && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action will restrict user access. Please ensure you have
                  a valid reason.
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
