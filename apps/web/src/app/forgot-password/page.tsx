"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";

interface FormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const result = await apiPost<{ message: string }>("/password-reset/request", values);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "4rem auto", padding: "2rem" }}>
      <h1>Forgot your password?</h1>
      <p>Enter your email and we'll send you a reset link.</p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Email
          <input type="email" {...register("email", { required: true })} />
        </label>
        <button type="submit">Send Reset Link</button>
      </form>

      {message && <p style={{ color: "#3a3" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        <Link href="/login">Back to login</Link>
      </p>
    </main>
  );
}