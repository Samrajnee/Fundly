"use client";

import Link from "next/link";

export default function FirstSalaryModePage() {
  return (
    <main style={{ maxWidth: 560, margin: "2rem auto", padding: "2rem" }}>
      <h1>Congratulations on your first salary! 🎉</h1>
      <p>Here's how Fundly will help you turn it into a plan, not just a number in your account.</p>

      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <strong>Necessities</strong>
          <p>Rent, food, transport, bills — the things you must pay every month, no matter what.</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <strong>Lifestyle</strong>
          <p>Dining out, entertainment, shopping — the fun stuff. Enjoying your money matters too.</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <strong>Savings & Investments</strong>
          <p>Money set aside for the future — building an emergency fund first, then investing for growth.</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <strong>Goals</strong>
          <p>Anything you're saving toward on purpose — a trip, a gadget, a bike.</p>
        </div>
        <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
          <strong>Buffer</strong>
          <p>A small cushion for surprises, so one unexpected expense doesn't derail your whole plan.</p>
        </div>
      </div>

      <p style={{ marginTop: "1.5rem" }}>
        Next, enter your salary details and we'll generate your first breakdown automatically.
      </p>

      <Link href="/salary-planner">
        <button style={{ marginTop: "1rem" }}>Create My First Salary Plan →</button>
      </Link>
    </main>
  );
}