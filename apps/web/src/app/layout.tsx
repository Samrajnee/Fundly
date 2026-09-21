import type { Metadata } from "next";
import { Familjen_Grotesk, Public_Sans } from "next/font/google";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { AuthGate } from "@/lib/auth-gate";
import { Nav } from "@/components/Nav";

const familjenGrotesk = Familjen_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Fundly",
  description: "Plan your pay",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${familjenGrotesk.variable} ${publicSans.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <div className="theme-toggle-fixed">
            <ThemeToggle />
          </div>

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
