import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, Award, Calendar, Clock, Shield, Users } from "lucide-react";
const Features = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Why Choose MediCare Plus?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            We provide comprehensive healthcare services with a patient-first
            approach
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Easy Appointment Booking</CardTitle>
              <CardDescription className="leading-relaxed">
                Book appointments with your preferred doctors in just a few
                clicks. Choose your date and time slot that works best for you.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Expert Medical Team</CardTitle>
              <CardDescription className="leading-relaxed">
                Our team of highly qualified doctors and specialists are
                dedicated to providing you with the best medical care possible.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>24/7 Emergency Care</CardTitle>
              <CardDescription className="leading-relaxed">
                Round-the-clock emergency services ensure you get immediate
                medical attention whenever you need it most.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription className="leading-relaxed">
                Your medical records and personal information are protected with
                industry-leading security measures.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Advanced Facilities</CardTitle>
              <CardDescription className="leading-relaxed">
                State-of-the-art medical equipment and modern facilities for
                accurate diagnosis and effective treatment.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Accredited Excellence</CardTitle>
              <CardDescription className="leading-relaxed">
                Nationally recognized and accredited healthcare facility with
                multiple awards for patient care excellence.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Features;
