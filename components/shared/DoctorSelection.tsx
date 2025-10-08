"use client";

import React, { useState, useEffect } from "react";
import { Search, Star, DollarSign, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllDoctorsQuery } from "@/redux/features/doctorApi";
import { type Doctor as AppointmentDoctor } from "@/types/appointment";
import { cn } from "@/lib/utils";
import { Doctor } from "@/types/doctor";

interface DoctorSelectionProps {
  selectedDoctor: AppointmentDoctor | null;
  onDoctorSelect: (doctor: AppointmentDoctor | null) => void;
  className?: string;
}

export function DoctorSelection({
  selectedDoctor,
  onDoctorSelect,
  className = "",
}: DoctorSelectionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("all");

  // Fetch doctors from API
  const {
    data: doctorsResponse,
    isLoading,
    error,
  } = useGetAllDoctorsQuery({
    search: searchQuery || undefined,
    specialization:
      selectedSpecialization === "all" ? undefined : selectedSpecialization,
    isAvailable: true,
    page: 1,
    limit: 50,
  });

  const doctors = doctorsResponse?.data?.doctors || [];

  // Get unique specializations for filter
  const specializations = Array.from(
    new Set(doctors.map((doctor: Doctor) => doctor.specialization))
  ).sort() as string[];

  const handleDoctorSelect = (doctor: AppointmentDoctor) => {
    onDoctorSelect(doctor);
  };

  if (error) {
    return (
      <div className={cn("space-y-4", className)}>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Failed to load doctors. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedSpecialization}
              onValueChange={setSelectedSpecialization}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                {specializations.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctors List */}
      <div className="space-y-4">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : doctors.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <p>No doctors found matching your criteria.</p>
                <p className="text-sm mt-1">
                  Try adjusting your search or filters.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          doctors.map((doctor: Doctor) => (
            <Card
              key={doctor._id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedDoctor?._id === doctor._id && "ring-2 ring-primary"
              )}
              onClick={() => handleDoctorSelect(doctor)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Doctor Avatar */}
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                    {doctor.firstName.charAt(0)}
                    {doctor.lastName.charAt(0)}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {doctor.specialization.replace(/_/g, " ")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Available
                        </Badge>
                        <div className="text-right">
                          <p className="text-sm font-medium text-primary">
                            ${doctor.consultationFee}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            consultation
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Doctor Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {doctor.yearsOfExperience || "N/A"} years exp.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Selected Doctor Summary */}
      {selectedDoctor && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-lg font-bold text-primary">
                {selectedDoctor.firstName.charAt(0)}
                {selectedDoctor.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">
                  Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                </h4>
                <p className="text-sm text-muted-foreground capitalize">
                  {selectedDoctor.specialization.replace(/_/g, " ")} • $
                  {selectedDoctor.consultationFee}
                </p>
              </div>
              <Badge variant="default">Selected</Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
