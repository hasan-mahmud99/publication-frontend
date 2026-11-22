import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Food Manufacturing ERP",
  description: "Manufacturing, inventory and distribution management",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
