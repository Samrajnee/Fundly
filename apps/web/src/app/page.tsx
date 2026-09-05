"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState<string>("checking...");

  useEffect(() => {
    fetch("/api/backend/health")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("unreachable"));
  }, []);

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Fundly</h1>
      <p>Backend status: {status}</p>
    </main>
  );
}