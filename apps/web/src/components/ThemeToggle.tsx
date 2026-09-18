"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="glass-surface"
      style={{
        position: "fixed",
        top: "1.25rem",
        right: "1.25rem",
        zIndex: 50,
        width: 40,
        height: 40,
        padding: 0,
        borderRadius: "50%",
        border: "1px solid var(--glass-border)",
        background: "var(--glass-bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-ink)",
      }}
    >
      {theme === "light" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.5" />
          <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 14.5a8.5 8.5 0 1 1-9-13 7 7 0 0 0 9 13z" />
        </svg>
      )}
    </button>
  );
}