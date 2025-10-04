import { Address } from "./apartment";

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Tenant {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  dateOfBirth: Date;
  emergencyContact: EmergencyContact;
  status: "active" | "inactive" | "pending";
  user: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  dateOfBirth: Date;
  emergencyContact: EmergencyContact;
  password: string;
}

export interface UpdateTenantRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Partial<Address>;
  dateOfBirth?: Date;
  emergencyContact?: Partial<EmergencyContact>;
  status?: "active" | "inactive" | "pending";
}
