import { Address } from "./apartment";

export interface BusinessInfo {
  businessName?: string;
  businessType?: string;
  taxId?: string;
  licenseNumber?: string;
}

export interface Owner {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  businessInfo?: BusinessInfo;
  status: "active" | "inactive" | "pending" | "suspended";
  user: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOwnerRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  businessInfo?: BusinessInfo;
  password: string;
}

export interface UpdateOwnerRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: Partial<Address>;
  businessInfo?: Partial<BusinessInfo>;
  status?: "active" | "inactive" | "pending" | "suspended";
}
