import React from "react";
import PatientDashboard from "./components/PatientDashboard";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <PatientDashboard />
    </ErrorBoundary>
  );
};

export default page;
