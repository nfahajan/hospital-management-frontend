"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Phone,
  Mail,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  useGetAllDoctorsQuery,
  useDeleteDoctorMutation,
} from "@/redux/features/doctorApi";
import {
  type Doctor,
  type DoctorFilters,
  type DoctorsApiResponse,
  SPECIALIZATIONS,
} from "@/types/doctor";

interface DoctorsTableProps {
  onEditDoctor?: (doctor: Doctor) => void;
  onViewDoctor?: (doctor: Doctor) => void;
}

export function DoctorsTable({
  onEditDoctor,
  onViewDoctor,
}: DoctorsTableProps) {
  const [filters, setFilters] = useState<DoctorFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useGetAllDoctorsQuery(filters) as {
    data: DoctorsApiResponse | undefined;
    isLoading: boolean;
    error: any;
    refetch: () => void;
  };
  const [deleteDoctor, { isLoading: isDeleting }] = useDeleteDoctorMutation();

  // Extract the actual data from the API response
  const data = response?.data;
  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: searchTerm || undefined,
        page: 1, // Reset to first page when searching
      }));
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDeleteDoctor = async (doctorId: string, doctorName: string) => {
    try {
      await deleteDoctor(doctorId).unwrap();
      toast.success(`Doctor ${doctorName} deleted successfully`);
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete doctor");
    }
  };

  const handleFilterChange = (key: keyof DoctorFilters, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getSpecializationLabel = (specialization: string) => {
    const spec = SPECIALIZATIONS.find((s) => s.value === specialization);
    return spec?.label || specialization;
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load doctors</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors Management</CardTitle>
          <CardDescription>
            Manage and view all doctors in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search doctors by name, phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.specialization || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "specialization",
                    value === "all" ? undefined : value
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Specializations</SelectItem>
                  {SPECIALIZATIONS.map((spec) => (
                    <SelectItem key={spec.value} value={spec.value}>
                      {spec.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.isAvailable?.toString() || "all"}
                onValueChange={(value) =>
                  handleFilterChange(
                    "isAvailable",
                    value === "all" ? undefined : value === "true"
                  )
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Available</SelectItem>
                  <SelectItem value="false">Not Available</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={7} className="h-20">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : data?.doctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-20 text-center">
                      No doctors found
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.doctors.map((doctor: Doctor) => (
                    <TableRow key={doctor._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {getInitials(doctor.firstName, doctor.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {doctor.firstName} {doctor.lastName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {doctor.user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getSpecializationLabel(
                            doctor.specialization.replace(/_/g, " ")
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Phone className="h-3 w-3 mr-1" />
                            {doctor.phoneNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {doctor.yearsOfExperience} years
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Fee: ${doctor.consultationFee}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={doctor.isAvailable ? "default" : "secondary"}
                        >
                          {doctor.isAvailable ? "Available" : "Not Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onViewDoctor && (
                              <DropdownMenuItem
                                onClick={() => onViewDoctor(doctor)}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            )}
                            {onEditDoctor && (
                              <DropdownMenuItem
                                onClick={() => onEditDoctor(doctor)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onSelect={(e) => e.preventDefault()}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Doctor
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete Dr.{" "}
                                    {doctor.firstName} {doctor.lastName}? This
                                    action cannot be undone and will also delete
                                    their user account.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDeleteDoctor(
                                        doctor._id,
                                        `${doctor.firstName} ${doctor.lastName}`
                                      )
                                    }
                                    className="bg-red-600 hover:bg-red-700"
                                    disabled={isDeleting}
                                  >
                                    {isDeleting ? "Deleting..." : "Delete"}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {data && data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(data.pagination.currentPage - 1) * filters.limit! + 1}{" "}
                to{" "}
                {Math.min(
                  data.pagination.currentPage * filters.limit!,
                  data.pagination.totalDoctors
                )}{" "}
                of {data.pagination.totalDoctors} doctors
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(data.pagination.currentPage - 1)
                  }
                  disabled={!data.pagination.hasPrevPage}
                >
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, data.pagination.totalPages) },
                    (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={
                            page === data.pagination.currentPage
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      );
                    }
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handlePageChange(data.pagination.currentPage + 1)
                  }
                  disabled={!data.pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
