import { z } from "zod";

// User profile update schema
export const updateUserSchema = z.object({
  email: z.string().email("Please provide a valid email address").optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Please provide a valid phone number")
    .optional(),
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .optional(),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .optional(),
  dateOfBirth: z
    .string()
    .refine(
      (date) => {
        if (!date) return true; // Optional field
        const parsedDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - parsedDate.getFullYear();
        return age >= 13 && age <= 120; // Reasonable age range
      },
      { message: "Please provide a valid date of birth" }
    )
    .optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

// User status update schema
export const updateUserStatusSchema = z.object({
  status: z.enum(["pending", "approved", "blocked", "declined", "hold"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});

// User roles update schema
export const updateUserRolesSchema = z.object({
  roles: z
    .array(z.string())
    .min(1, "At least one role is required")
    .refine(
      (roles) => {
        const validRoles = [
          "admin",
          "superadmin",
          "doctor",
          "patient",
          "client",
        ];
        return roles.every((role) => validRoles.includes(role));
      },
      { message: "All roles must be valid" }
    ),
  permissions: z.array(z.string()).optional().default([]),
});

// User filters schema
export const userFiltersSchema = z.object({
  search: z.string().optional(),
  status: z
    .enum(["pending", "approved", "blocked", "declined", "hold"])
    .optional(),
  roles: z.array(z.string()).optional(),
  auth_type: z.enum(["standard", "google", "facebook"]).optional(),
  page: z.number().min(1).optional().default(1),
  limit: z.number().min(1).max(100).optional().default(10),
});

// Bulk status update schema
export const bulkUpdateUserStatusSchema = z.object({
  userIds: z.array(z.string()).min(1, "At least one user must be selected"),
  status: z.enum(["pending", "approved", "blocked", "declined", "hold"], {
    errorMap: () => ({ message: "Please select a valid status" }),
  }),
  reason: z.string().max(500, "Reason cannot exceed 500 characters").optional(),
});

// User search schema
export const userSearchSchema = z.object({
  query: z.string().min(1, "Search query is required"),
  filters: userFiltersSchema.optional(),
});

// Export types
export type UpdateUserStatusFormData = z.infer<typeof updateUserStatusSchema>;
export type UpdateUserRolesFormData = z.infer<typeof updateUserRolesSchema>;
export type UserFiltersFormData = z.infer<typeof userFiltersSchema>;
export type BulkUpdateUserStatusFormData = z.infer<
  typeof bulkUpdateUserStatusSchema
>;
export type UserSearchFormData = z.infer<typeof userSearchSchema>;
