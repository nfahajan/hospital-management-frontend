import { Activity, Heart, Stethoscope, Users } from "lucide-react";
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "../ui/card";

const Specialties = () => {
  return (
    <section className="bg-card py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Our Medical Specialties
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Comprehensive healthcare services across multiple specializations
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "Cardiology",
              icon: Heart,
              description: "Heart & cardiovascular care",
            },
            {
              name: "Neurology",
              icon: Activity,
              description: "Brain & nervous system",
            },
            {
              name: "Pediatrics",
              icon: Users,
              description: "Child healthcare",
            },
            {
              name: "Orthopedics",
              icon: Stethoscope,
              description: "Bone & joint care",
            },
          ].map((specialty) => {
            const Icon = specialty.icon;
            return (
              <Card
                key={specialty.name}
                className="text-center hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{specialty.name}</CardTitle>
                  <CardDescription>{specialty.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Specialties;
