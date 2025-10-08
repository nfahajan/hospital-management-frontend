"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoctorCalendarProps {
  doctorId: number
}

// Mock availability data - in production, this would come from the database
const generateAvailability = (doctorId: number) => {
  const availability: Record<string, string[]> = {}
  const today = new Date()

  // Generate availability for next 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    // Skip Sundays
    if (date.getDay() === 0) continue

    // Generate time slots based on doctor's schedule
    const slots: string[] = []
    const startHour = doctorId % 2 === 0 ? 8 : 9
    const endHour = doctorId % 3 === 0 ? 16 : 17

    for (let hour = startHour; hour < endHour; hour++) {
      // Randomly mark some slots as booked
      if (Math.random() > 0.3) {
        slots.push(`${hour.toString().padStart(2, "0")}:00`)
        if (hour < endHour - 1) {
          slots.push(`${hour.toString().padStart(2, "0")}:30`)
        }
      }
    }

    availability[dateStr] = slots
  }

  return availability
}

export function DoctorCalendar({ doctorId }: DoctorCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [availability] = useState(() => generateAvailability(doctorId))

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    setSelectedDate(null)
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    setSelectedDate(null)
  }

  const getDayAvailability = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toISOString().split("T")[0]
    return availability[dateStr] || []
  }

  const handleDateClick = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const dateStr = date.toISOString().split("T")[0]
    setSelectedDate(dateStr)
  }

  const renderCalendarDays = () => {
    const days = []

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />)
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dateStr = date.toISOString().split("T")[0]
      const slots = getDayAvailability(day)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const hasAvailability = slots.length > 0
      const isSelected = selectedDate === dateStr

      days.push(
        <button
          key={day}
          onClick={() => !isPast && hasAvailability && handleDateClick(day)}
          disabled={isPast || !hasAvailability}
          className={cn(
            "aspect-square p-2 text-sm rounded-lg transition-colors relative",
            "hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed",
            isToday && "ring-2 ring-primary",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary",
            !isSelected && hasAvailability && !isPast && "bg-green-50 hover:bg-green-100",
            !hasAvailability && "bg-muted",
          )}
        >
          <span className="font-medium">{day}</span>
          {hasAvailability && !isPast && (
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
              <div className="w-1 h-1 rounded-full bg-green-600" />
            </div>
          )}
        </button>,
      )
    }

    return days
  }

  const selectedSlots = selectedDate ? availability[selectedDate] || [] : []

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div>
        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">{renderCalendarDays()}</div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-50 border border-green-200" />
          <span className="text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted" />
          <span className="text-muted-foreground">No availability</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-primary" />
          <span className="text-muted-foreground">Today</span>
        </div>
      </div>

      {/* Time Slots */}
      {selectedDate && selectedSlots.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-4">
            Available Time Slots -{" "}
            {new Date(selectedDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {selectedSlots.map((slot) => (
              <Button key={slot} variant="outline" size="sm" className="w-full bg-transparent">
                {slot}
              </Button>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mt-4">Sign in or create an account to book an appointment</p>
        </Card>
      )}
    </div>
  )
}
