export function AuthShell({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-bg)" }}>
      <div style={{ width: 380, background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", padding: "2rem" }}>
        <h1 style={{ fontSize: "1.5rem" }}>{title}</h1>
        {description && <p>{description}</p>}
        {children}
      </div>
    </main>
  );
}