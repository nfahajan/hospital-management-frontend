import { Navigation } from "./Navbar";
import Features from "./Features";
import Specialties from "./Specialties";
import Stats from "./Stats";
import CTA from "./CTA";
import { Footer } from "./Footer";
import Banner from "./Banner";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Banner Section */}
      <Banner />

      {/* Features Section */}
      <Features />

      {/* Specialties Section */}
      <Specialties />

      {/* Stats Section */}
      <Stats />
      {/* CTA Section */}
      <CTA />
    </div>
  );
}
