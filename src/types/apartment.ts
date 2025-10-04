export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PropertyDetails {
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  floorNumber?: number;
  totalFloors?: number;
  yearBuilt?: number;
}

export interface Rent {
  amount: number;
  currency: string;
  period: "monthly" | "weekly" | "daily";
}

export interface Utilities {
  included: string[];
  notIncluded: string[];
}

export interface Availability {
  status: "available" | "rented" | "maintenance" | "unavailable";
  availableFrom?: Date;
  leaseTerm?: string;
}

export interface Apartment {
  _id: string;
  title: string;
  description: string;
  address: Address;
  propertyDetails: PropertyDetails;
  amenities: string[];
  rent: Rent;
  utilities: Utilities;
  availability: Availability;
  images: string[];
  owner: string; // Owner ID
  status: "active" | "inactive" | "pending" | "sold";
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApartmentRequest {
  title: string;
  description: string;
  address: Address;
  propertyDetails: PropertyDetails;
  amenities: string[];
  rent: Rent;
  utilities: Utilities;
  availability: Availability;
}

export interface UpdateApartmentRequest {
  title?: string;
  description?: string;
  address?: Partial<Address>;
  propertyDetails?: Partial<PropertyDetails>;
  amenities?: string[];
  rent?: Partial<Rent>;
  utilities?: Partial<Utilities>;
  availability?: Partial<Availability>;
  images?: string[];
  status?: "active" | "inactive" | "pending" | "sold";
}

export interface ApartmentFilters {
  city?: string;
  state?: string;
  minRent?: number;
  maxRent?: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  status?: "available" | "rented" | "maintenance" | "unavailable";
}
