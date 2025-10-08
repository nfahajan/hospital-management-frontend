import { Navigation } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import { ReactNode } from "react";

const WebsiteLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default WebsiteLayout;
