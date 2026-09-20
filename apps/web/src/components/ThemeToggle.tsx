"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle({
  variant = "fixed",
}: {
  variant?: "fixed" | "inline";
}) {
  const { theme, toggleTheme } = useTheme();

  const baseStyle: React.CSSProperties =
    variant === "fixed"
      ? {
          position: "fixed",
          top: "1.25rem",
          right: "1.25rem",
          zIndex: 90,
        }
      : {
          position: "relative",
          marginLeft: "auto",
        };

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        theme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      className="glass-surface"
      style={{
        ...baseStyle,
        width: 38,
        height: 38,
        padding: 0,
        borderRadius: "50%",
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-ink)",
        flexShrink: 0,
      }}
    >
      {theme === "light" ? (
        /* Light mode → show moon → clicking switches to dark */
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M20.5 14.5a8.5 8.5 0 1 1-9-13 7 7 0 0 0 9 13z" />
        </svg>
      ) : (
        /* Dark mode → show sun → clicking switches to light */
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      )}
    </button>
  );
}
