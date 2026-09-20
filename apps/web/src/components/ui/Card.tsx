export function Card({
  children,
  style,
  onClick,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div className="glass-surface" style={{ padding: "1.25rem 1.5rem", ...style }} onClick={onClick}>
      {children}
    </div>
  );
}