"use client";

import { Provider } from "react-redux";
import { AuthProvider } from "@/contexts/AuthContext";
import { store } from "@/redux/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Provider store={store}>{children}</Provider>
    </AuthProvider>
  );
}
