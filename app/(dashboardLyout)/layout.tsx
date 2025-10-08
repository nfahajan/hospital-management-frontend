import { ReactNode } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
export const metadata = {
  title: "Dashboard",
  description: "This is the dashboard page",
};
const layout = ({ children }: { children: ReactNode }) => {
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default layout;
