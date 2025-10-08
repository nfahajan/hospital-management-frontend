"use client";

import React from "react";
import Link from "next/link";
import { UserPlus, Heart, Shield, CheckCircle } from "lucide-react";
import { PatientRegistrationForm } from "./PatientRegistrationForm";

const Register = () => {
  return (
    <div className="min-h-screen pt-10 bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Side - Benefits */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <UserPlus className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Join Our Healthcare Community
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Create your patient account and get access to comprehensive
                  healthcare services, appointment booking, and personalized
                  medical care.
                </p>
              </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="lg:sticky lg:top-8">
              <PatientRegistrationForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
