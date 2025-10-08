import { z } from "zod";
import { SPECIALIZATIONS, GENDERS, DAYS_OF_WEEK } from "@/types/doctor";

// Main doctor creation schema
export const createDoctorSchema = z.object({
  // User account fields
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password too long"),

  // Personal information
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name cannot exceed 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name cannot exceed 50 characters"),
  dateOfBirth: z
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
    ),
  gender: z.enum(["male", "female", "other"]),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),

  // Professional information
  specialization: z.enum([
    "cardiology",
    "dermatology",
    "endocrinology",
    "gastroenterology",
    "general_medicine",
    "neurology",
    "oncology",
    "orthopedics",
    "pediatrics",
    "psychiatry",
    "radiology",
    "surgery",
    "urology",
    "other",
  ]),
  yearsOfExperience: z
    .number()
    .min(0, "Years of experience cannot be negative")
    .max(50, "Years of experience cannot exceed 50"),

  // Optional fields
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters").optional(),

  // Professional details
  consultationFee: z.number().min(0, "Consultation fee cannot be negative"),

  // Availability
  isAvailable: z.boolean().optional().default(true),
});

// Update doctor schema (all fields optional except ID)
export const updateDoctorSchema = createDoctorSchema.partial().extend({
  // Remove required fields for updates
  email: z.string().email("Please provide a valid email address").optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .optional(),
});

// Doctor filters schema
export const doctorFiltersSchema = z.object({
  search: z.string().optional(),
  specialization: z
    .enum([
      "cardiology",
      "dermatology",
      "endocrinology",
      "gastroenterology",
      "general_medicine",
      "neurology",
      "oncology",
      "orthopedics",
      "pediatrics",
      "psychiatry",
      "radiology",
      "surgery",
      "urology",
      "other",
    ])
    .optional(),
  isAvailable: z.boolean().optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

// Export types
export type CreateDoctorFormData = z.infer<typeof createDoctorSchema>;
export type UpdateDoctorFormData = z.infer<typeof updateDoctorSchema>;
export type DoctorFiltersFormData = z.infer<typeof doctorFiltersSchema>;
