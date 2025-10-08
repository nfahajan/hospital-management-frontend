"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Edit,
  Save,
  X,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/hooks/useAuth";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/redux/features/patientApi";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import { updatePatientSchema } from "@/lib/validations/patient";
import { GENDERS, BLOOD_GROUPS, BloodGroup } from "@/types/patient";

type PatientProfileFormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  phoneNumber: string;
  bloodGroup?: BloodGroup;
};

export default function PatientProfile() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);

  // API hooks
  const {
    data: profileResponse,
    isLoading: isLoadingProfile,
    error: profileError,
    refetch: refetchProfile,
  } = useGetMyProfileQuery();

  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateMyProfileMutation();

  const profile = profileResponse?.data;

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<PatientProfileFormData>({
    resolver: zodResolver(updatePatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phoneNumber: "",
      bloodGroup: undefined,
    },
  });

  const genderValue = watch("gender");
  const bloodGroupValue = watch("bloodGroup");

  // Set form values when profile data loads
  useEffect(() => {
    if (profile) {
      const formData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        dateOfBirth: profile.dateOfBirth
          ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
          : "",
        gender: (profile.gender as "male" | "female" | "other") || "male",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup || undefined,
      };
      reset(formData);
    }
  }, [profile, reset]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || !user || !user.roles.includes("patient")) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Form submission handler
  const onSubmit = async (data: PatientProfileFormData) => {
    try {
      await updateProfile(data).unwrap();

      toast.success("Profile updated successfully", {
        description: "Your profile information has been saved.",
      });

      setIsEditing(false);
      refetchProfile();
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      const formData = {
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        dateOfBirth: profile.dateOfBirth
          ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd")
          : "",
        gender: (profile.gender as "male" | "female" | "other") || "male",
        phoneNumber: profile.phoneNumber || "",
        bloodGroup: profile.bloodGroup || undefined,
      };
      reset(formData);
    }
    setIsEditing(false);
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your personal information
            </p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile data. Please try again.
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetchProfile()}
              className="ml-4"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your personal information
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowChangePassword(true)}
            className="flex items-center gap-2"
          >
            <Lock className="h-4 w-4" />
            Change Password
          </Button>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleSubmit(onSubmit)}
                disabled={isUpdating || !isDirty}
                className="flex items-center gap-2"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Summary Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    {profile?.firstName} {profile?.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile?.user?.email}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    Patient
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{profile?.phoneNumber || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {profile?.dateOfBirth
                      ? format(new Date(profile.dateOfBirth), "MMM d, yyyy")
                      : "Not provided"}
                  </span>
                </div>
                {profile?.bloodGroup && (
                  <div className="flex items-center gap-2 text-sm">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span>Blood Group: {profile.bloodGroup}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic contact and demographic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    disabled={!isEditing}
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    disabled={!isEditing}
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile?.user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    disabled={!isEditing}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                    placeholder="+1 (555) 123-4567"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    disabled={!isEditing}
                    className={errors.dateOfBirth ? "border-red-500" : ""}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-red-500">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <Select
                    value={genderValue}
                    onValueChange={(value) =>
                      setValue("gender", value as "male" | "female" | "other")
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      className={errors.gender ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender.value} value={gender.value}>
                          {gender.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-sm text-red-500">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={bloodGroupValue}
                  onValueChange={(value) =>
                    setValue("bloodGroup", value as BloodGroup)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group.value} value={group.value}>
                        {group.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bloodGroup && (
                  <p className="text-sm text-red-500">
                    {errors.bloodGroup.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
}
