export function EmptyState({ message, actionLabel, actionHref }: { message: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div
      style={{
        border: "1px dashed var(--color-border-strong)",
        borderRadius: "var(--radius-md)",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p style={{ margin: actionLabel ? "0 0 0.75rem" : 0 }}>{message}</p>
      {actionLabel && actionHref && (
        <a href={actionHref}>
          <button>{actionLabel}</button>
        </a>
      )}
    </div>
  );
}