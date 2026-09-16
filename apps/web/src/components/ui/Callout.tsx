export function Callout({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "muted" }) {
  return (
    <div
      style={{
        background: tone === "muted" ? "var(--color-surface-alt)" : "var(--color-clay-light)",
        borderRadius: "var(--radius-md)",
        padding: "0.9rem 1.1rem",
        fontSize: "0.9rem",
        color: tone === "muted" ? "var(--color-text-secondary)" : "var(--color-clay-dark)",
        marginBottom: "1.25rem",
      }}
    >
      {children}
    </div>
  );
}