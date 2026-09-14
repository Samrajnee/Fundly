"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { EducationArticleDTO } from "@fundly/shared-types";

export default function EducationArticlePage() {
  const params = useParams<{ slug: string }>();
  const [article, setArticle] = useState<EducationArticleDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<EducationArticleDTO>(`/education/${params.slug}`)
      .then(setArticle)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load article"));
  }, [params.slug]);

  if (error) return <main style={{ padding: "2rem" }}><p style={{ color: "red" }}>{error}</p></main>;
  if (!article) return <main style={{ padding: "2rem" }}>Loading...</main>;

  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "2rem" }}>
      <Link href="/education">← All articles</Link>
      <small style={{ display: "block", color: "#666", marginTop: "1rem" }}>
        {article.category} · {article.readMinutes} min read
      </small>
      <h1>{article.title}</h1>
      <p style={{ lineHeight: 1.6 }}>{article.content}</p>
    </main>
  );
}