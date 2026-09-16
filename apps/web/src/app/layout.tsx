import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/lib/auth-gate";
import { Nav } from "@/components/Nav";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fundly",
  description: "Plan your pay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`}>
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