import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/lib/auth-gate";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "Fundly",
  description: "Plan your pay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <AuthGate>
            <div style={{ display: "flex" }}>
              <Nav />
              <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
            </div>
          </AuthGate>
        </AuthProvider>
      </body>
    </html>
  );
}