"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

const PUBLIC_ROUTES = ["/login", "/signup"];
const ONBOARDING_ROUTES = ["/onboarding", "/onboarding/first-salary"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
  const isOnboardingRoute = ONBOARDING_ROUTES.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicRoute) {
      router.push("/login");
      return;
    }

    if (user && !user.hasCompletedOnboarding && !isPublicRoute && !isOnboardingRoute) {
      router.push("/onboarding");
    }
  }, [loading, user, isPublicRoute, isOnboardingRoute, router]);

  if (loading) return <main style={{ padding: "2rem" }}>Loading...</main>;
  if (!user && !isPublicRoute) return null;

  return <>{children}</>;
}