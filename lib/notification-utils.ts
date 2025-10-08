export type NotificationType = "appointment" | "reminder" | "cancellation" | "update" | "system"

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  createdAt: string
  appointmentId?: string
}

export function createAppointmentNotification(
  userId: string,
  appointmentId: string,
  title: string,
  message: string,
): Notification {
  return {
    id: `notif-${Date.now()}`,
    userId,
    type: "appointment",
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId,
  }
}

export function createReminderNotification(
  userId: string,
  appointmentId: string,
  appointmentDate: string,
  appointmentTime: string,
): Notification {
  return {
    id: `notif-${Date.now()}`,
    userId,
    type: "reminder",
    title: "Appointment Reminder",
    message: `You have an appointment scheduled for ${appointmentDate} at ${appointmentTime}`,
    read: false,
    createdAt: new Date().toISOString(),
    appointmentId,
  }
}

export function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case "appointment":
      return "calendar"
    case "reminder":
      return "bell"
    case "cancellation":
      return "x-circle"
    case "update":
      return "info"
    case "system":
      return "settings"
    default:
      return "bell"
  }
}
