"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stethoscope } from "lucide-react";
import { toast } from "sonner";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/ui/date-picker";

import {
  createDoctorSchema,
  type CreateDoctorFormData,
} from "@/lib/validations/doctor";
import { SPECIALIZATIONS, GENDERS, DAYS_OF_WEEK } from "@/types/doctor";
import { useCreateDoctorMutation } from "@/redux/features/doctorApi";

interface AddDoctorFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddDoctorForm({ onSuccess, onCancel }: AddDoctorFormProps) {
  const [createDoctor, { isLoading }] = useCreateDoctorMutation();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const form = useForm<CreateDoctorFormData>({
    resolver: zodResolver(createDoctorSchema),
    defaultValues: {
      email: "",
      password: "",
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

  const onSubmit = async (data: CreateDoctorFormData) => {
    console.log("Form submitted with data:", data);
    try {
      await createDoctor(data).unwrap();
      toast.success("Doctor created successfully!");
      onSuccess?.();
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create doctor");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(
      "Form submit event triggered, current step:",
      currentStep,
      "total steps:",
      totalSteps
    );
    // Only submit if we're on the last step
    if (currentStep === totalSteps) {
      console.log("On final step, submitting form");
      // Validate only the current step before submitting
      const isValid = await validateCurrentStep();
      if (isValid) {
        form.handleSubmit(onSubmit)(e);
      } else {
        console.log("Final step validation failed");
      }
    } else {
      console.log(
        "Form submission prevented - not on last step. Current:",
        currentStep,
        "Total:",
        totalSteps
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Prevent Enter key from submitting form unless we're on the last step
    if (e.key === "Enter" && currentStep < totalSteps) {
      e.preventDefault();
      console.log("Enter key prevented - not on last step");
    }
  };

  const nextStep = async () => {
    console.log(
      "Next button clicked, current step:",
      currentStep,
      "total steps:",
      totalSteps
    );
    if (currentStep < totalSteps) {
      console.log("Validating current step before proceeding");
      // Validate only the current step's fields
      const isValid = await validateCurrentStep();
      console.log("Validation result:", isValid);
      if (isValid) {
        console.log("Moving to next step:", currentStep + 1);
        setCurrentStep(currentStep + 1);
      } else {
        console.log("Validation failed, staying on current step");
      }
    } else {
      console.log("Already on final step, cannot go to next step");
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    console.log(
      "Validating step",
      currentStep,
      "with fields:",
      fieldsToValidate
    );

    try {
      // Get current form values
      const formValues = form.getValues();
      console.log("Current form values:", formValues);

      // Check if fields are filled
      const stepErrors = fieldsToValidate.filter((field) => {
        const fieldValue = getNestedValue(formValues, field);
        console.log(`Checking field: ${field}, Value:`, fieldValue);

        // Check if field is empty or invalid
        if (
          fieldValue === undefined ||
          fieldValue === null ||
          fieldValue === ""
        ) {
          console.log(`Field ${field} is empty`);
          return true;
        }

        // Handle string fields
        if (typeof fieldValue === "string" && fieldValue.trim() === "") {
          console.log(`Field ${field} is empty string`);
          return true;
        }

        // Handle number fields
        if (typeof fieldValue === "number" && isNaN(fieldValue)) {
          console.log(`Field ${field} is NaN`);
          return true;
        }

        console.log(`Field ${field} is valid`);
        return false;
      });

      if (stepErrors.length > 0) {
        console.log("Step validation failed for fields:", stepErrors);

        // Create user-friendly field names
        const getFieldDisplayName = (fieldPath: string): string => {
          const fieldNames: { [key: string]: string } = {
            email: "Email Address",
            password: "Password",
            firstName: "First Name",
            lastName: "Last Name",
            dateOfBirth: "Date of Birth",
            gender: "Gender",
            phoneNumber: "Phone Number",
            specialization: "Specialization",
            yearsOfExperience: "Years of Experience",
            consultationFee: "Consultation Fee",
            isAvailable: "Availability Status",
          };
          return fieldNames[fieldPath] || fieldPath;
        };

        // Show specific error message
        const errorMessages = stepErrors.map((field) => {
          const fieldName = getFieldDisplayName(field);
          const fieldValue = getNestedValue(formValues, field);

          return `${fieldName} is required`;
        });

        if (errorMessages.length === 1) {
          toast.error(errorMessages[0]);
        } else {
          toast.error(`Please fill in: ${errorMessages.join(", ")}`);
        }
        return false;
      }

      console.log("Step validation passed!");
      return true;
    } catch (error) {
      console.error("Validation error:", error);
      toast.error(
        "Please complete all required fields before proceeding to the next step."
      );
      return false;
    }
  };

  const getFieldsForStep = (step: number): string[] => {
    switch (step) {
      case 1: // Account Information
        return ["email", "password"];
      case 2: // Personal Details
        return [
          "firstName",
          "lastName",
          "dateOfBirth",
          "gender",
          "phoneNumber",
        ];
      case 3: // Professional Information
        return [
          "specialization",
          "yearsOfExperience",
          "consultationFee",
          "isAvailable",
        ];
      default:
        return [];
    }
  };

  const getNestedError = (errors: any, fieldPath: string): any => {
    const parts = fieldPath.split(".");
    let current = errors;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  };

  const getNestedValue = (values: any, fieldPath: string): any => {
    const parts = fieldPath.split(".");
    let current = values;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  };

  const hasStepErrors = (step: number): boolean => {
    const fieldsToCheck = getFieldsForStep(step);
    const errors = form.formState.errors;

    return fieldsToCheck.some((field) => {
      const fieldError = getNestedError(errors, field);
      return fieldError !== undefined;
    });
  };

  const hasFieldError = (fieldPath: string): boolean => {
    const errors = form.formState.errors;
    const fieldError = getNestedError(errors, fieldPath);
    return fieldError !== undefined;
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1:
        return "Account Information";
      case 2:
        return "Personal Details";
      case 3:
        return "Professional Information";
      default:
        return "";
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1:
        return "Create the doctor's account credentials";
      case 2:
        return "Enter personal and contact information";
      case 3:
        return "Add professional qualifications, experience, and availability";
      default:
        return "";
    }
  };

  return (
    <div className="max-w-4xl w-full mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Add New Doctor</h2>
          <Badge variant="outline" className="text-sm">
            Step {currentStep} of {totalSteps}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const hasErrors = hasStepErrors(stepNumber);

            return (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                    ? hasErrors
                      ? "bg-red-500"
                      : "bg-primary"
                    : "bg-muted"
                }`}
              />
            );
          })}
        </div>
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              {getStepTitle(currentStep)}
            </h3>
            {hasStepErrors(currentStep) && (
              <Badge variant="destructive" className="text-xs">
                Has Errors
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {getStepDescription(currentStep)}
          </p>
        </div>
      </div>

      <Form {...form}>
        {hasStepErrors(currentStep) && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>
              Please complete all required fields marked with red borders before
              proceeding to the next step.
            </AlertDescription>
          </Alert>
        )}
        <form
          onSubmit={handleFormSubmit}
          onKeyDown={handleKeyDown}
          className="space-y-6"
        >
          {/* Step 1: Account Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Create the doctor's login credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="doctor@hospital.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Minimum 8 characters"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Personal Details */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Personal Details
                </CardTitle>
                <CardDescription>
                  Enter personal and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <DatePicker
                            date={
                              field.value ? new Date(field.value) : undefined
                            }
                            onDateChange={(date) => {
                              field.onChange(
                                date ? date.toISOString().split("T")[0] : ""
                              );
                            }}
                            placeholder="Select date of birth"
                            toDate={new Date()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDERS.map((gender) => (
                              <SelectItem
                                key={gender.value}
                                value={gender.value}
                              >
                                {gender.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Professional Information */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Professional Information
                </CardTitle>
                <CardDescription>
                  Add professional qualifications and experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select specialization" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SPECIALIZATIONS.map((spec) => (
                              <SelectItem key={spec.value} value={spec.value}>
                                {spec.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="yearsOfExperience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="50"
                            placeholder="5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="consultationFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Consultation Fee ($)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="150.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Availability Status</FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value === "true")
                          }
                          defaultValue={field.value ? "true" : "false"}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select availability" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="true">Available</SelectItem>
                            <SelectItem value="false">Not Available</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description about the doctor's background and expertise..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6">
            <div className="flex items-center space-x-2">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    prevStep();
                  }}
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Next button clicked, preventing default");
                    nextStep();
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Creating Doctor..." : "Create Doctor"}
                </Button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
