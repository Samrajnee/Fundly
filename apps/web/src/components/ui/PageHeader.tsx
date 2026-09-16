export function PageHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div style={{ marginBottom: "1.75rem" }}>
      <h1 style={{ marginBottom: description ? "0.4rem" : 0 }}>{title}</h1>
      {description && <p style={{ margin: 0, maxWidth: 520 }}>{description}</p>}
    </div>
  );
}