"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import type { MilestoneDTO } from "@fundly/shared-types";

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<MilestoneDTO[]>("/milestones")
      .then(setMilestones)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load milestones"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Financial Milestones</h1>

      {milestones.map((m) => (
        <div
          key={m.key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0.75rem 0",
            borderBottom: "1px solid #eee",
            opacity: m.achieved ? 1 : 0.5,
          }}
        >
          <span>{m.achieved ? "✓" : "○"} {m.label}</span>
          {m.achieved && m.achievedAt && (
            <small>{new Date(m.achievedAt).toLocaleDateString()}</small>
          )}
        </div>
      ))}
    </main>
  );
}