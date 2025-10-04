import { EmergencyContact } from "./tenant";

export interface ApplicationDetails {
  moveInDate: Date;
  leaseTerm: string;
  monthlyIncome: number;
  employmentStatus:
    | "employed"
    | "self-employed"
    | "unemployed"
    | "student"
    | "retired";
  employerName?: string;
  employerPhone?: string;
  emergencyContact: EmergencyContact;
  additionalInfo?: string;
}

export interface ApplicationDocuments {
  idProof?: string;
  incomeProof?: string;
  bankStatement?: string;
  references?: string[];
}

export interface Application {
  _id: string;
  tenant: string; // Tenant ID
  apartment: string; // Apartment ID
  applicationDetails: ApplicationDetails;
  documents: ApplicationDocuments;
  status: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  reviewNotes?: string;
  reviewedBy?: string; // User ID
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApplicationRequest {
  apartmentId: string;
  applicationDetails: ApplicationDetails;
}

export interface UpdateApplicationRequest {
  applicationDetails?: Partial<ApplicationDetails>;
  status?: "pending" | "under_review" | "approved" | "rejected" | "withdrawn";
  reviewNotes?: string;
  documents?: Partial<ApplicationDocuments>;
}

export interface ReviewApplicationRequest {
  status: "under_review" | "approved" | "rejected";
  reviewNotes?: string;
}
