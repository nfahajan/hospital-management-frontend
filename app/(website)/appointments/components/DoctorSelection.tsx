"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Stethoscope,
} from "lucide-react";
import { useGetAllDoctorsQuery } from "@/redux/features/doctorApi";
import { type Doctor as AppointmentDoctor } from "@/types/appointment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DoctorSelectionProps {
  selectedDoctor: AppointmentDoctor | null;
  onDoctorSelect: (doctor: AppointmentDoctor) => void;
  specialization?: string;
  className?: string;
}

export function DoctorSelection({
  selectedDoctor,
  onDoctorSelect,
  specialization,
  className = "",
}: DoctorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(
    specialization || "all"
  );
  const [selectedAvailability, setSelectedAvailability] = useState("all");

  const {
    data: response,
    isLoading,
    error,
  } = useGetAllDoctorsQuery({
    search: searchTerm || undefined,
    specialization:
      selectedSpecialization === "all" ? undefined : selectedSpecialization,
    isAvailable:
      selectedAvailability === "all"
        ? undefined
        : selectedAvailability === "true",
    page: 1,
    limit: 20,
  });

  const doctors = response?.data?.doctors || [];

  const handleDoctorSelect = (doctor: AppointmentDoctor) => {
    onDoctorSelect(doctor);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getSpecializationLabel = (specialization: string) => {
    const specializations = [
      { value: "cardiology", label: "Cardiology" },
      { value: "dermatology", label: "Dermatology" },
      { value: "neurology", label: "Neurology" },
      { value: "orthopedics", label: "Orthopedics" },
      { value: "pediatrics", label: "Pediatrics" },
      { value: "psychiatry", label: "Psychiatry" },
      { value: "surgery", label: "Surgery" },
      { value: "general_medicine", label: "General Medicine" },
    ];

    const spec = specializations.find((s) => s.value === specialization);
    return spec?.label || specialization;
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load doctors</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Select a Doctor</h2>
          <p className="text-muted-foreground">
            Choose from our available medical professionals
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search doctors by name, specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedSpecialization}
              onValueChange={setSelectedSpecialization}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Specialization" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specializations</SelectItem>
                <SelectItem value="cardiology">Cardiology</SelectItem>
                <SelectItem value="dermatology">Dermatology</SelectItem>
                <SelectItem value="neurology">Neurology</SelectItem>
                <SelectItem value="orthopedics">Orthopedics</SelectItem>
                <SelectItem value="pediatrics">Pediatrics</SelectItem>
                <SelectItem value="psychiatry">Psychiatry</SelectItem>
                <SelectItem value="surgery">Surgery</SelectItem>
                <SelectItem value="general_medicine">
                  General Medicine
                </SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={selectedAvailability}
              onValueChange={setSelectedAvailability}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                <SelectItem value="true">Available</SelectItem>
                <SelectItem value="false">Busy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Selected Doctor */}
      {selectedDoctor && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {getInitials(
                      selectedDoctor.firstName,
                      selectedDoctor.lastName
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {getSpecializationLabel(selectedDoctor.specialization)}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDoctorSelect(null as any)}
              >
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Doctors List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : doctors.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Stethoscope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No doctors found</p>
          </div>
        ) : (
          doctors.map((doctor: AppointmentDoctor) => (
            <Card
              key={doctor._id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedDoctor?._id === doctor._id
                  ? "ring-2 ring-primary border-primary"
                  : ""
              }`}
              onClick={() => handleDoctorSelect(doctor)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Avatar>
                    <AvatarFallback>
                      {getInitials(doctor.firstName, doctor.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-sm truncate">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <Badge
                        variant={doctor.isAvailable ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {doctor.isAvailable ? "Available" : "Busy"}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Stethoscope className="h-3 w-3 mr-1" />
                        {getSpecializationLabel(doctor.specialization)}
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {doctor.yearsOfExperience} years exp.
                      </div>

                      <div className="flex items-center text-xs text-muted-foreground">
                        <DollarSign className="h-3 w-3 mr-1" />$
                        {doctor.consultationFee}
                      </div>
                    </div>

                    {doctor.isAvailable && (
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          Available Now
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More Button */}
      {doctors.length > 0 && doctors.length >= 20 && (
        <div className="text-center">
          <Button variant="outline" onClick={() => {}}>
            Load More Doctors
          </Button>
        </div>
      )}
    </div>
  );
}
