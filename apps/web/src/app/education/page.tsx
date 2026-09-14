"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { EducationArticleSummaryDTO } from "@fundly/shared-types";

export default function EducationListPage() {
  const [articles, setArticles] = useState<EducationArticleSummaryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<EducationArticleSummaryDTO[]>("/education")
      .then(setArticles)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load articles"));
  }, []);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <h1>Financial Education</h1>
      <p>Short, plain-language explanations of concepts that come up while planning your money.</p>

      <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {articles.map((a) => (
          <Link key={a.slug} href={`/education/${a.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
            <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
              <small style={{ color: "#666" }}>{a.category} · {a.readMinutes} min read</small>
              <h3 style={{ margin: "0.25rem 0" }}>{a.title}</h3>
              <p style={{ margin: 0 }}>{a.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}