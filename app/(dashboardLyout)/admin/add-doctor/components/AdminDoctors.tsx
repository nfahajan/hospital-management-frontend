"use client";

import React, { useState } from "react";
import { Plus, Users, Stethoscope, Calendar, TrendingUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { DoctorsTable } from "./DoctorsTable";
import { AddDoctorForm } from "./AddDoctorForm";
import { EditDoctorForm } from "./EditDoctorForm";
import { type Doctor } from "@/types/doctor";

export default function AdminDoctors() {
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [isEditDoctorOpen, setIsEditDoctorOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  const handleAddDoctorSuccess = () => {
    setIsAddDoctorOpen(false);
    // The table will automatically refetch due to Redux cache invalidation
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditDoctorOpen(true);
  };

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    // TODO: Implement view functionality
    console.log("View doctor:", doctor);
  };

  const handleEditDoctorSuccess = () => {
    setIsEditDoctorOpen(false);
    setSelectedDoctor(null);
    // The table will automatically refetch due to Redux cache invalidation
  };

  const handleEditDoctorCancel = () => {
    setIsEditDoctorOpen(false);
    setSelectedDoctor(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Doctors Management
          </h1>
          <p className="text-muted-foreground">
            Manage doctors, their profiles, and availability
          </p>
        </div>
        <Dialog open={isAddDoctorOpen} onOpenChange={setIsAddDoctorOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Create a new doctor account with all necessary information
              </DialogDescription>
            </DialogHeader>
            <AddDoctorForm
              onSuccess={handleAddDoctorSuccess}
              onCancel={() => setIsAddDoctorOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Content */}
      <DoctorsTable
        onEditDoctor={handleEditDoctor}
        onViewDoctor={handleViewDoctor}
      />

      {/* Edit Doctor Dialog */}
      {selectedDoctor && (
        <Dialog open={isEditDoctorOpen} onOpenChange={setIsEditDoctorOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Doctor Profile</DialogTitle>
              <DialogDescription>
                Update doctor information and settings
              </DialogDescription>
            </DialogHeader>
            <EditDoctorForm
              doctor={selectedDoctor}
              onSuccess={handleEditDoctorSuccess}
              onCancel={handleEditDoctorCancel}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Doctor Dialog */}
      {selectedDoctor && !isEditDoctorOpen && (
        <Dialog
          open={!!selectedDoctor && !isEditDoctorOpen}
          onOpenChange={() => setSelectedDoctor(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedDoctor.firstName} {selectedDoctor.lastName}
              </DialogTitle>
              <DialogDescription>
                Doctor profile details and management
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium">Contact Information</h4>
                  <p className="text-sm text-muted-foreground">
                    Email: {selectedDoctor.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Phone: {selectedDoctor.phoneNumber}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Professional Info</h4>
                  <p className="text-sm capitalize text-muted-foreground">
                    Specialization: {selectedDoctor.specialization.replace(
                      /_/g,
                      " "
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Experience: {selectedDoctor.yearsOfExperience} years
                  </p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDoctor(null)}
                >
                  Close
                </Button>
                <Button onClick={() => handleEditDoctor(selectedDoctor)}>
                  Edit Doctor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
