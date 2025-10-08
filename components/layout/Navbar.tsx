"use client";
import logo from "../../../public/assets/mainlogo.png";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-20 flex  items-center">
              <Image
                src={logo}
                alt="logo"
                width={100}
                height={100}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex text-sm items-center space-x-8">
            <Link
              href="/jobs"
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Jobs
            </Link>
            <Link
              href="/companies"
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Companies
            </Link>

            <Link
              href="/about"
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-primary transition-colors font-medium"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user?.name || user?.email}
                </span>
                <Button variant="outline" onClick={handleLogout}>
                  Sign Out
                </Button>
                <Button asChild>
                  <Link
                    href={
                      user?.role === "jobSeeker"
                        ? "/jobseeker/dashboard"
                        : user?.role === "employer"
                          ? "/employer/dashboard"
                          : "/admin/dashboard"
                    }
                  >
                    Dashboard
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/jobs"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Find Jobs
              </Link>
              <Link
                href="/companies"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Companies
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-primary transition-colors font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>

              <div className="pt-4 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.name || user?.email}
                    </span>
                    <Button
                      variant="outline"
                      onClick={handleLogout}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                    <Button asChild className="w-full">
                      <Link
                        href={
                          user?.role === "jobSeeker"
                            ? "/jobseeker/dashboard"
                            : "/employer/dashboard"
                        }
                      >
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2">
                    <Button variant="outline" asChild className="w-full">
                      <Link
                        href="/auth/login"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link
                        href="/auth/register"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
