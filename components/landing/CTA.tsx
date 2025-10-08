import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";

const CTA = () => {
  return (
    <section className="bg-primary py-16 md:py-24">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-primary-foreground text-balance md:text-4xl">
          Ready to Take Control of Your Health?
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/90 text-pretty">
          Join thousands of satisfied patients and experience healthcare
          excellence
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" variant="secondary" asChild className="text-base">
            <Link href="/appointments">
              <Calendar className="mr-2 h-5 w-5" />
              Book Your Appointment
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            asChild
            className="text-base bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href="/register">
              Create Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTA;
