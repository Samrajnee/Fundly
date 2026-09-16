"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { MilestoneDTO, CustomMilestoneDTO } from "@fundly/shared-types";

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [customMilestones, setCustomMilestones] = useState<CustomMilestoneDTO[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const [builtIn, custom] = await Promise.all([
        apiGet<MilestoneDTO[]>("/milestones"),
        apiGet<CustomMilestoneDTO[]>("/custom-milestones"),
      ]);
      setMilestones(builtIn);
      setCustomMilestones(custom);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load milestones");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function onAddCustom() {
    if (!newLabel.trim()) return;
    try {
      await apiPost("/custom-milestones", { label: newLabel });
      setNewLabel("");
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add milestone");
    }
  }

  async function onToggle(id: string) {
    try {
      await apiPatch(`/custom-milestones/${id}/toggle`, {});
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update milestone");
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this milestone?")) return;
    try {
      await apiDelete(`/custom-milestones/${id}`);
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete milestone");
    }
  }

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 560, margin: "0 auto", padding: "2rem" }}>
      <h1>Financial Milestones</h1>

      <h2>Milestones</h2>
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

      <h2 style={{ marginTop: "2rem" }}>Your Own Milestones</h2>
      <p style={{ fontSize: "0.9rem", color: "#666" }}>
        Anything meaningful to you - mark it done yourself whenever it happens.
      </p>

      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddCustom()}
          placeholder="e.g. Paid off laptop EMI"
          style={{ flex: 1 }}
        />
        <button onClick={onAddCustom}>Add</button>
      </div>

      <div style={{ marginTop: "1rem" }}>
        {customMilestones.length === 0 ? (
          <p style={{ color: "#999" }}>No custom milestones yet.</p>
        ) : (
          customMilestones.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0.75rem 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: m.achieved ? 1 : 0.6 }}>
                <input type="checkbox" checked={m.achieved} onChange={() => onToggle(m.id)} />
                {m.label}
                {m.achieved && m.achievedAt && (
                  <small style={{ marginLeft: "0.5rem" }}>{new Date(m.achievedAt).toLocaleDateString()}</small>
                )}
              </label>
              <button onClick={() => onDelete(m.id)} style={{ color: "#d33" }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  );
}