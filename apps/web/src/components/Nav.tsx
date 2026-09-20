"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/ThemeToggle";

const NAV_GROUPS = [
  {
    label: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/health-score", label: "Financial health score" },
      { href: "/net-worth", label: "Net worth" },
      { href: "/milestones", label: "Milestones" },
    ],
  },
  {
    label: "Salary",
    links: [
      { href: "/salary-planner", label: "Salary planner" },
      { href: "/salary-history", label: "Salary history" },
      { href: "/salary-increment", label: "Increment planner" },
    ],
  },
  {
    label: "Spending",
    links: [
      { href: "/expenses", label: "Expense tracker" },
      { href: "/recurring", label: "Recurring expenses" },
      { href: "/budget", label: "Budget and safe-to-spend" },
      { href: "/spending-insights", label: "Spending insights" },
      { href: "/lifestyle-inflation", label: "Lifestyle inflation" },
    ],
  },
  {
    label: "Planning",
    links: [
      { href: "/goals", label: "Goals" },
      { href: "/ai-goal-planner", label: "AI goal planner" },
      { href: "/emergency-fund", label: "Emergency fund" },
      { href: "/monthly-plan", label: "Monthly plan" },
      { href: "/monthly-review", label: "Monthly review" },
    ],
  },
  {
    label: "Assets and protection",
    links: [
      { href: "/investments", label: "Investments" },
      { href: "/debts", label: "Debt and EMI" },
      { href: "/insurance", label: "Insurance" },
    ],
  },
  {
    label: "AI tools",
    links: [
      { href: "/ask-fundly", label: "Ask Fundly" },
      { href: "/what-if", label: "What-if simulator" },
    ],
  },
  {
    label: "Learn",
    links: [{ href: "/education", label: "Financial education" }],
  },
];

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  function goTo(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <div className="mobile-topbar">
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          style={{
            width: 36,
            height: 36,
            padding: 0,
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid var(--color-border-strong)",
            color: "var(--color-ink)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <HamburgerIcon />
        </button>
        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "1.1rem", color: "var(--color-ink)" }}>
          Fundly
        </span>
        <ThemeToggle variant="inline" />
      </div>

      <div className={`nav-overlay ${open ? "open" : ""}`} onClick={() => setOpen(false)} />

      <nav className={`glass-surface app-nav ${open ? "open" : ""}`}>
        <div style={{ marginBottom: "1.75rem", padding: "0 0.5rem" }}>
          <Link href="/dashboard" style={{ fontFamily: "var(--font-heading)", fontWeight: 500, fontSize: "1.15rem", color: "var(--color-ink)" }}>
            Fundly
          </Link>
        </div>

        {NAV_GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: "1.4rem" }}>
            <p
              style={{
                fontSize: "0.7rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                margin: "0 0 0.4rem",
                padding: "0 0.5rem",
              }}
            >
              {group.label}
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {group.links.map((link) => {
                const active = pathname === link.href;
                return (
                  <button
                    key={link.href}
                    onClick={() => goTo(link.href)}
                    style={{
                      display: "block",
                      textAlign: "left",
                      padding: "0.5rem 0.5rem",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "0.88rem",
                      fontWeight: active ? 600 : 400,
                      textDecoration: "none",
                      color: active ? "var(--color-accent-dark)" : "var(--color-text-secondary)",
                      background: active ? "var(--color-accent-light)" : "transparent",
                      border: "none",
                      width: "100%",
                    }}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "1.5rem", borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
          <button
            onClick={() => goTo("/settings")}
            style={{
              display: "block",
              width: "100%",
              textAlign: "left",
              padding: "0.5rem 0.5rem",
              fontSize: "0.88rem",
              color: "var(--color-text-secondary)",
              background: "transparent",
              border: "none",
            }}
          >
            Settings
          </button>
          <button
            onClick={async () => {
              setOpen(false);
              await logout();
              router.push("/login");
            }}
            style={{
              marginTop: "0.6rem",
              width: "100%",
              background: "transparent",
              color: "var(--color-text-secondary)",
              border: "1px solid var(--color-border-strong)",
            }}
          >
            Log out
          </button>
        </div>
      </nav>
    </>
  );
}