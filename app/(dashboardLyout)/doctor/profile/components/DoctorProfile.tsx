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
  Stethoscope,
  Edit,
  Save,
  X,
  Lock,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  CheckCircle,
  DollarSign,
  Award,
  FileText,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/hooks/useAuth";
import {
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
} from "@/redux/features/doctorApi";
import ChangePasswordDialog from "@/components/shared/ChangePasswordDialog";
import { updateDoctorSchema } from "@/lib/validations/doctor";
import {
  GENDERS,
  SPECIALIZATIONS,
  type Gender,
  type Specialization,
} from "@/types/doctor";

type DoctorProfileFormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  phoneNumber: string;
  specialization: Specialization;
  yearsOfExperience: number;
  bio?: string;
  consultationFee: number;
  isAvailable: boolean;
};

export default function DoctorProfile() {
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
  } = useForm<DoctorProfileFormData>({
    resolver: zodResolver(updateDoctorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "male",
      phoneNumber: "",
      specialization: "general_medicine",
      yearsOfExperience: 0,
      bio: "",
      consultationFee: 0,
      isAvailable: true,
    },
  });

  // Authentication check
  useEffect(() => {
    if (
      !isAuthenticated ||
      !user ||
      (!user.roles.includes("doctor") && !user.roles.includes("admin"))
    ) {
      router.push("/login");
      return;
    }
  }, [user, isAuthenticated, router]);

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split("T")[0]
          : "",
        gender: profile.gender || "male",
        phoneNumber: profile.phoneNumber || "",
        specialization: profile.specialization || "general_medicine",
        yearsOfExperience: profile.yearsOfExperience || 0,
        bio: profile.bio || "",
        consultationFee: profile.consultationFee || 0,
        isAvailable: profile.isAvailable ?? true,
      });
    }
  }, [profile, reset]);

  // Handle form submission
  const onSubmit = async (data: DoctorProfileFormData) => {
    if (!profile) return;

    try {
      await updateProfile({
        ...data,
        dateOfBirth: data.dateOfBirth
          ? new Date(data.dateOfBirth).toISOString()
          : undefined,
      }).unwrap();

      toast.success("Profile updated successfully");
      setIsEditing(false);
      refetchProfile();
    } catch (error: any) {
      toast.error("Failed to update profile", {
        description: error?.data?.message || "Please try again later.",
      });
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (profile) {
      reset({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        dateOfBirth: profile.dateOfBirth
          ? profile.dateOfBirth.split("T")[0]
          : "",
        gender: profile.gender || "male",
        phoneNumber: profile.phoneNumber || "",
        specialization: profile.specialization || "general_medicine",
        yearsOfExperience: profile.yearsOfExperience || 0,
        bio: profile.bio || "",
        consultationFee: profile.consultationFee || 0,
        isAvailable: profile.isAvailable ?? true,
      });
    }
    setIsEditing(false);
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
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
              <Separator />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (profileError) {
    return (
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Doctor Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional information
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

  if (!profile) {
    return (
      <div className="space-y-6 w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Doctor Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your professional information
            </p>
          </div>
        </div>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Profile not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Doctor Profile</h1>
          <p className="text-muted-foreground mt-2">
            Manage your professional information and settings
          </p>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <Button
              variant="outline"
              onClick={() => setShowChangePassword(true)}
              className="flex items-center gap-2"
            >
              <Lock className="h-4 w-4" />
              Change Password
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                  {profile.firstName?.[0] || "D"}
                  {profile.lastName?.[0] || "R"}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Dr. {profile.firstName} {profile.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.user?.email}
                  </p>
                  <div className="flex gap-1 mt-1">
                    {profile.user?.roles?.map((role) => (
                      <Badge key={role} variant="secondary" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Separator />

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
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
                    value={watch("gender")}
                    onValueChange={(value) =>
                      setValue("gender", value as Gender)
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

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number *</Label>
                  <Input
                    id="phoneNumber"
                    {...register("phoneNumber")}
                    disabled={!isEditing}
                    className={errors.phoneNumber ? "border-red-500" : ""}
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-red-500">
                      {errors.phoneNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Professional Information
              </CardTitle>
              <CardDescription>Your medical practice details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="specialization">Specialization *</Label>
                  <Select
                    value={watch("specialization")}
                    onValueChange={(value) =>
                      setValue("specialization", value as Specialization)
                    }
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      className={errors.specialization ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPECIALIZATIONS.map((spec) => (
                        <SelectItem key={spec.value} value={spec.value}>
                          {spec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.specialization && (
                    <p className="text-sm text-red-500">
                      {errors.specialization.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">
                    Years of Experience *
                  </Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    max="50"
                    {...register("yearsOfExperience", { valueAsNumber: true })}
                    disabled={!isEditing}
                    className={errors.yearsOfExperience ? "border-red-500" : ""}
                  />
                  {errors.yearsOfExperience && (
                    <p className="text-sm text-red-500">
                      {errors.yearsOfExperience.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultationFee">
                    Consultation Fee ($) *
                  </Label>
                  <Input
                    id="consultationFee"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("consultationFee", { valueAsNumber: true })}
                    disabled={!isEditing}
                    className={errors.consultationFee ? "border-red-500" : ""}
                  />
                  {errors.consultationFee && (
                    <p className="text-sm text-red-500">
                      {errors.consultationFee.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell patients about your experience and approach..."
                    {...register("bio")}
                    disabled={!isEditing}
                    rows={3}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500">{errors.bio.message}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    id="isAvailable"
                    type="checkbox"
                    {...register("isAvailable")}
                    disabled={!isEditing}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isAvailable" className="text-sm">
                    Available for new appointments
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile.user?.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm capitalize">
                    {profile.user?.status || "active"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile.user?.createdAt
                      ? format(new Date(profile.user.createdAt), "MMM d, yyyy")
                      : "Unknown"}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Account Roles</Label>
                <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div className="flex gap-1">
                    {profile.user?.roles?.map((role) => (
                      <Badge key={role} variant="outline" className="text-xs">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelEdit}
              disabled={isUpdating}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isUpdating || !isDirty}>
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        )}
      </form>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={showChangePassword}
        onOpenChange={setShowChangePassword}
      />
    </div>
  );
}
