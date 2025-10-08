import { ArrowRight, Calendar, CheckCircle2, Heart } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

const Banner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-card to-background">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          <div className="flex flex-col gap-6">
            <Badge className="w-fit bg-primary/10 text-primary hover:bg-primary/20">
              Trusted by 50,000+ Patients
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-balance md:text-5xl lg:text-6xl">
              Your Health, Our Priority
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              Experience world-class healthcare with easy appointment booking,
              expert doctors, and comprehensive medical services. Your journey
              to better health starts here.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild className="text-base">
                <Link href="/appointments">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Appointment
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base bg-transparent"
              >
                <Link href="/register">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">24/7 Support</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Expert Doctors</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Easy Booking</span>
              </div>
            </div>
          </div>
          <div className="relative max-h-[600px]">
            <div className="aspect-square max-h-[600px] overflow-hidden h-full rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <Image
                src="/male-dermatologist.jpg"
                alt="Professional healthcare"
                width={600}
                height={600}
                className="h-full w-full overflow-hidden object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 rounded-xl bg-background p-4 shadow-lg border border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">98%</p>
                  <p className="text-sm text-muted-foreground">
                    Patient Satisfaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Banner;
