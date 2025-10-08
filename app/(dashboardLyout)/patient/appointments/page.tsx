import React from "react";
import PatientAppointments from "./components/PatientAppointment";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <PatientAppointments />
    </ErrorBoundary>
  );
};

export default page;
