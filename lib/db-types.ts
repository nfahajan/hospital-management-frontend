// Database type definitions for Healthcare Appointment System

export type UserRole = "patient" | "doctor" | "admin"

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed" | "no-show"

export type Gender = "Male" | "Female" | "Other" | "Prefer not to say"

export interface User {
  id: string
  email: string
  role: UserRole
  first_name: string
  last_name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  user_id: string
  date_of_birth: string | null
  gender: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  medical_history: string | null
  allergies: string | null
  current_medications: string | null
  insurance_provider: string | null
  insurance_policy_number: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface Doctor {
  id: string
  user_id: string
  specialization: string
  license_number: string
  years_of_experience: number | null
  education: string | null
  bio: string | null
  consultation_fee: number | null
  rating: number
  total_reviews: number
  is_available: boolean
  created_at: string
  updated_at: string
  user?: User
}

export interface DoctorSchedule {
  id: string
  doctor_id: string
  day_of_week: number // 0 = Sunday, 6 = Saturday
  start_time: string
  end_time: string
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string
  appointment_date: string
  appointment_time: string
  duration_minutes: number
  status: AppointmentStatus
  reason_for_visit: string
  notes: string | null
  prescription: string | null
  diagnosis: string | null
  cancellation_reason: string | null
  cancelled_by: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Doctor
}

export interface Review {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  related_appointment_id: string | null
  created_at: string
}
