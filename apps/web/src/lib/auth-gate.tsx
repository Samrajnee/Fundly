"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./auth-context";

const PUBLIC_ROUTES = ["/login", "/signup"];

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (!loading && !user && !isPublicRoute) {
      router.push("/login");
    }
  }, [loading, user, isPublicRoute, router]);

  if (loading) return <main style={{ padding: "2rem" }}>Loading...</main>;
  if (!user && !isPublicRoute) return null;

  return <>{children}</>;
}