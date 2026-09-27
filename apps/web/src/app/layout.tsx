import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/lib/auth-gate";
import { Nav } from "@/components/Nav";

const fraunces = localFont({
  src: [
    { path: "../fonts/fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/fraunces-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-display",
});

const publicSans = localFont({
  src: [
    { path: "../fonts/public-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../fonts/public-sans-500.woff2", weight: "500", style: "normal" },
    { path: "../fonts/public-sans-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Fundly",
  description: "Plan your pay",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${publicSans.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <AuthGate>
              <div className="app-shell">
                <Nav />
                <div className="app-main">{children}</div>
              </div>
            </AuthGate>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}