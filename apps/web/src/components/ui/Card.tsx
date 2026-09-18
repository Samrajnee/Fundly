export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div className="glass-surface" style={{ padding: "1.25rem 1.5rem", ...style }}>
      {children}
    </div>
  );
}