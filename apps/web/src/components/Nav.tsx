"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const NAV_GROUPS = [
  {
    label: "Overview",
    links: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/health-score", label: "Financial Health Score" },
      { href: "/net-worth", label: "Net Worth" },
      { href: "/milestones", label: "Milestones" },
    ],
  },
  {
    label: "Salary",
    links: [
      { href: "/salary-planner", label: "Salary Planner" },
      { href: "/salary-history", label: "Salary History" },
      { href: "/salary-increment", label: "Increment Planner" },
    ],
  },
  {
    label: "Spending",
    links: [
      { href: "/expenses", label: "Expense Tracker" },
      { href: "/recurring", label: "Recurring Expenses" },
      { href: "/budget", label: "Budget & Safe-to-Spend" },
      { href: "/spending-insights", label: "Spending Insights" },
      { href: "/lifestyle-inflation", label: "Lifestyle Inflation" },
    ],
  },
  {
    label: "Planning",
    links: [
      { href: "/goals", label: "Goals" },
      { href: "/ai-goal-planner", label: "AI Goal Planner" },
      { href: "/emergency-fund", label: "Emergency Fund" },
      { href: "/monthly-plan", label: "Monthly Plan" },
      { href: "/monthly-review", label: "Monthly Review" },
    ],
  },
  {
    label: "Assets & Protection",
    links: [
      { href: "/investments", label: "Investments" },
      { href: "/debts", label: "Debt & EMI" },
      { href: "/insurance", label: "Insurance" },
    ],
  },
  {
    label: "AI Tools",
    links: [
      { href: "/ask-fundly", label: "Ask Fundly" },
      { href: "/what-if", label: "What-If Simulator" },
    ],
  },
  {
    label: "Learn",
    links: [{ href: "/education", label: "Financial Education" }],
  },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <nav
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid #ddd",
        height: "100vh",
        overflowY: "auto",
        padding: "1rem",
        position: "sticky",
        top: 0,
      }}
    >
      <Link href="/dashboard" style={{ fontWeight: "bold", fontSize: "1.1rem", display: "block", marginBottom: "1.5rem" }}>
        Fundly
      </Link>

      {NAV_GROUPS.map((group) => (
        <div key={group.label} style={{ marginBottom: "1.25rem" }}>
          <small style={{ color: "#999", textTransform: "uppercase", letterSpacing: "0.03em" }}>{group.label}</small>
          <div style={{ display: "flex", flexDirection: "column", marginTop: "0.25rem" }}>
            {group.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  padding: "0.35rem 0",
                  fontWeight: pathname === link.href ? "bold" : "normal",
                  textDecoration: "none",
                  color: pathname === link.href ? "#000" : "#333",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div style={{ marginTop: "1.5rem", borderTop: "1px solid #eee", paddingTop: "1rem" }}>
        <Link href="/settings" style={{ display: "block", padding: "0.35rem 0" }}>
          Settings
        </Link>
        <button
          onClick={async () => {
            await logout();
            router.push("/login");
          }}
          style={{ marginTop: "0.5rem" }}
        >
          Log Out
        </button>
      </div>
    </nav>
  );
}