import { z } from "zod";
import {
  GENDERS,
  BLOOD_GROUPS,
  RELATIONSHIPS,
  COUNTRIES,
} from "@/types/patient";

// Base schemas
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please provide a valid email address");

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(100, "Password cannot exceed 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one number"
  );

const nameSchema = z
  .string()
  .min(1, "Name is required")
  .min(2, "Name must be at least 2 characters long")
  .max(50, "Name cannot exceed 50 characters")
  .regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces");

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number");

const dateOfBirthSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      return birthDate <= today;
    },
    {
      message: "Date of birth cannot be in the future",
    }
  )
  .refine(
    (date) => {
      if (!date) return false;
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 0 && age <= 120;
    },
    {
      message: "Please enter a valid date of birth",
    }
  );

const genderSchema = z.enum(["male", "female", "other"]);

const bloodGroupSchema = z.enum([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

// Create patient schema
export const createPatientSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  dateOfBirth: dateOfBirthSchema,
  gender: genderSchema,
  phoneNumber: phoneSchema,
  bloodGroup: bloodGroupSchema.optional(),
});

// Update patient schema - only fields supported by backend
export const updatePatientSchema = z.object({
  firstName: nameSchema.optional(),
  lastName: nameSchema.optional(),
  dateOfBirth: dateOfBirthSchema.optional(),
  gender: genderSchema.optional(),
  phoneNumber: phoneSchema.optional(),
  bloodGroup: bloodGroupSchema.optional(),
});

// Patient filters schema
export const patientFiltersSchema = z.object({
  search: z.string().optional(),
  gender: genderSchema.optional(),
  bloodGroup: bloodGroupSchema.optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

// Export types
export type CreatePatientFormData = z.infer<typeof createPatientSchema>;
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;
export type PatientFiltersFormData = z.infer<typeof patientFiltersSchema>;
