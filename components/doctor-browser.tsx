"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, MapPin, Star, Clock } from "lucide-react"
import { DoctorCalendar } from "@/components/doctor-calendar"

// Mock doctor data
const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    experience: "15 years",
    rating: 4.9,
    reviews: 234,
    location: "Medical Center, Downtown",
    image: "/female-doctor.png",
    availability: "Mon-Fri, 9AM-5PM",
    nextAvailable: "Tomorrow, 10:00 AM",
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Cardiology",
    experience: "12 years",
    rating: 4.8,
    reviews: 189,
    location: "Heart Institute, Uptown",
    image: "/male-doctor.png",
    availability: "Mon-Sat, 8AM-4PM",
    nextAvailable: "Today, 2:00 PM",
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Dermatology",
    experience: "10 years",
    rating: 4.9,
    reviews: 312,
    location: "Skin Care Clinic, Midtown",
    image: "/female-dermatologist.png",
    availability: "Tue-Sat, 10AM-6PM",
    nextAvailable: "Tomorrow, 11:00 AM",
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Dermatology",
    experience: "8 years",
    rating: 4.7,
    reviews: 156,
    location: "Wellness Center, Eastside",
    image: "/male-dermatologist.jpg",
    availability: "Mon-Fri, 9AM-5PM",
    nextAvailable: "Today, 4:00 PM",
  },
  {
    id: 5,
    name: "Dr. Priya Patel",
    specialty: "Pediatrics",
    experience: "14 years",
    rating: 5.0,
    reviews: 428,
    location: "Children's Hospital, Central",
    image: "/female-pediatrician.png",
    availability: "Mon-Fri, 8AM-6PM",
    nextAvailable: "Tomorrow, 9:00 AM",
  },
  {
    id: 6,
    name: "Dr. Robert Martinez",
    specialty: "Pediatrics",
    experience: "11 years",
    rating: 4.8,
    reviews: 267,
    location: "Family Care Center, Westside",
    image: "/male-pediatrician.png",
    availability: "Mon-Sat, 9AM-5PM",
    nextAvailable: "Today, 3:00 PM",
  },
  {
    id: 7,
    name: "Dr. Lisa Anderson",
    specialty: "Orthopedics",
    experience: "16 years",
    rating: 4.9,
    reviews: 298,
    location: "Sports Medicine Center, North",
    image: "/female-orthopedic-surgeon.jpg",
    availability: "Mon-Thu, 8AM-4PM",
    nextAvailable: "Tomorrow, 10:00 AM",
  },
  {
    id: 8,
    name: "Dr. David Kim",
    specialty: "Orthopedics",
    experience: "13 years",
    rating: 4.8,
    reviews: 221,
    location: "Bone & Joint Clinic, South",
    image: "/male-orthopedic-surgeon.jpg",
    availability: "Tue-Fri, 9AM-5PM",
    nextAvailable: "Today, 1:00 PM",
  },
]

const specialties = ["All", "Cardiology", "Dermatology", "Pediatrics", "Orthopedics"]

export function DoctorBrowser() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All")
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)

  const filteredDoctors =
    selectedSpecialty === "All" ? doctors : doctors.filter((doc) => doc.specialty === selectedSpecialty)

  return (
    <div className="space-y-8">
      {/* Specialty Filter */}
      <Tabs value={selectedSpecialty} onValueChange={setSelectedSpecialty} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
          {specialties.map((specialty) => (
            <TabsTrigger key={specialty} value={specialty}>
              {specialty}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedSpecialty} className="mt-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={doctor.image || "/placeholder.svg"} alt={doctor.name} />
                      <AvatarFallback>
                        {doctor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg leading-tight">{doctor.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {doctor.specialty}
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{doctor.rating}</span>
                    <span className="text-muted-foreground">({doctor.reviews} reviews)</span>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{doctor.experience} experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="line-clamp-1">{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{doctor.availability}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-3">
                      Next available: <span className="font-medium text-foreground">{doctor.nextAvailable}</span>
                    </p>
                    <Button
                      className="w-full"
                      variant={selectedDoctor === doctor.id ? "secondary" : "default"}
                      onClick={() => setSelectedDoctor(selectedDoctor === doctor.id ? null : doctor.id)}
                    >
                      {selectedDoctor === doctor.id ? "Hide Calendar" : "View Availability"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Calendar View */}
      {selectedDoctor && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{doctors.find((d) => d.id === selectedDoctor)?.name} - Availability Calendar</CardTitle>
              <CardDescription>
                Select a date to view available time slots. Green indicates available slots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DoctorCalendar doctorId={selectedDoctor} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
