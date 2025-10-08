export type AppointmentStatus = "scheduled" | "confirmed" | "completed" | "cancelled" | "no-show"

export type AppointmentType = "consultation" | "follow-up" | "emergency" | "routine-checkup"

export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  reason: string
  type: AppointmentType
  status: AppointmentStatus
  notes?: string
  diagnosis?: string
  prescription?: string
  createdAt: string
  updatedAt: string
}

export function getAppointmentStatusColor(status: AppointmentStatus): string {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800"
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "completed":
      return "bg-gray-100 text-gray-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    case "no-show":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getAppointmentTypeLabel(type: AppointmentType): string {
  switch (type) {
    case "consultation":
      return "Consultation"
    case "follow-up":
      return "Follow-up"
    case "emergency":
      return "Emergency"
    case "routine-checkup":
      return "Routine Checkup"
    default:
      return type
  }
}

export function formatAppointmentDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatAppointmentTime(time: string): string {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function isUpcomingAppointment(date: string, time: string): boolean {
  const appointmentDateTime = new Date(`${date}T${time}`)
  return appointmentDateTime > new Date()
}

export function isPastAppointment(date: string, time: string): boolean {
  const appointmentDateTime = new Date(`${date}T${time}`)
  return appointmentDateTime < new Date()
}

export function isTodayAppointment(date: string): boolean {
  const today = new Date()
  const appointmentDate = new Date(date)
  return (
    appointmentDate.getDate() === today.getDate() &&
    appointmentDate.getMonth() === today.getMonth() &&
    appointmentDate.getFullYear() === today.getFullYear()
  )
}
