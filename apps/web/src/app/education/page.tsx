"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { EducationArticleSummaryDTO } from "@fundly/shared-types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export default function EducationListPage() {
  const [articles, setArticles] = useState<EducationArticleSummaryDTO[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<EducationArticleSummaryDTO[]>("/education").then(setArticles).catch((err) => setError(err instanceof Error ? err.message : "Failed to load articles"));
  }, []);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;

  return (
    <main style={{ maxWidth: 680, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Financial education" description="Short, plain-language explanations of concepts that come up while planning your money." />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}>
        {articles.map((a) => (
          <Link key={a.slug} href={`/education/${a.slug}`} style={{ textDecoration: "none" }}>
            <Card>
              <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "0 0 0.3rem" }}>{a.category}, {a.readMinutes} min read</p>              <h3 style={{ margin: "0 0 0.3rem" }}>{a.title}</h3>
              <p style={{ margin: 0 }}>{a.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}