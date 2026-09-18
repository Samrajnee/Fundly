"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import type { MilestoneDTO, CustomMilestoneDTO } from "@fundly/shared-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function MilestonesPage() {
  const [milestones, setMilestones] = useState<MilestoneDTO[]>([]);
  const [customMilestones, setCustomMilestones] = useState<CustomMilestoneDTO[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    try {
      const [builtIn, custom] = await Promise.all([apiGet<MilestoneDTO[]>("/milestones"), apiGet<CustomMilestoneDTO[]>("/custom-milestones")]);
      setMilestones(builtIn); setCustomMilestones(custom);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load milestones"); }
  }

  useEffect(() => { loadData(); }, []);

  async function onAddCustom() {
    if (!newLabel.trim()) return;
    try { await apiPost("/custom-milestones", { label: newLabel }); setNewLabel(""); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to add milestone"); }
  }

  async function onToggle(id: string) {
    try { await apiPatch(`/custom-milestones/${id}/toggle`, {}); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to update milestone"); }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this milestone?")) return;
    try { await apiDelete(`/custom-milestones/${id}`); loadData(); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to delete milestone"); }
  }

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Financial milestones" />

      <Card style={{ marginBottom: "1.5rem" }}>
        {milestones.map((m, idx) => (
          <div key={m.key} style={{ display: "flex", justifyContent: "space-between", padding: "0.6rem 0", borderBottom: idx < milestones.length - 1 ? "1px solid var(--color-border)" : "none", opacity: m.achieved ? 1 : 0.5 }}>
          <span>{m.achieved ? "Achieved:" : "Not yet:"} {m.label}</span>          </div>
        ))}
      </Card>

      <h2>Your own milestones</h2>
      <p>Anything meaningful to you. Mark it done yourself whenever it happens.</p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onAddCustom()} placeholder="Paid off laptop EMI" />
        <button onClick={onAddCustom}>Add</button>
      </div>

      {customMilestones.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)" }}>No custom milestones yet.</p>
      ) : (
        <Card>
          {customMilestones.map((m, idx) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0", borderBottom: idx < customMilestones.length - 1 ? "1px solid var(--color-border)" : "none" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", margin: 0, opacity: m.achieved ? 1 : 0.7 }}>
                <input type="checkbox" style={{ width: "auto" }} checked={m.achieved} onChange={() => onToggle(m.id)} />
                {m.label}
              </label>
              <button onClick={() => onDelete(m.id)} style={{ background: "transparent", color: "var(--color-danger)", border: "1px solid var(--color-danger-light)" }}>Delete</button>
            </div>
          ))}
        </Card>
      )}
    </main>
  );
}