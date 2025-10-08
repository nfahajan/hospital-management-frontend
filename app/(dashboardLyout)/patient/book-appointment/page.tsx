import React from "react";
import BookAppointment from "./components/BookAppointment";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const page = () => {
  return (
    <ErrorBoundary>
      <BookAppointment />
    </ErrorBoundary>
  );
};

export default page;
