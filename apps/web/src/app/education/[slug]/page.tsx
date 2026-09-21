"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { EducationArticleDTO } from "@fundly/shared-types";
import { PageHeader } from "@/components/ui/PageHeader";

export default function EducationArticlePage() {
  const params = useParams<{ slug: string }>();
  const [article, setArticle] = useState<EducationArticleDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<EducationArticleDTO>(`/education/${params.slug}`).then(setArticle).catch((err) => setError(err instanceof Error ? err.message : "Failed to load article"));
  }, [params.slug]);

  if (error) return <main style={{ padding: "2.5rem" }}><p style={{ color: "var(--color-danger)" }}>{error}</p></main>;
  if (!article) return <main style={{ padding: "2.5rem" }}>Loading</main>;

  return (
    <main style={{ maxWidth: 620, margin: "0 auto", padding: "2.5rem" }}>
    <Link href="/education" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", textDecoration: "none" }}>
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
  Back to Financial Education
</Link>      <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", margin: "1rem 0 0.3rem" }}>{article.category}, {article.readMinutes} min read</p>      
      <PageHeader title={article.title} />
      <p style={{ lineHeight: 1.75 }}>{article.content}</p>
    </main>
  );
}