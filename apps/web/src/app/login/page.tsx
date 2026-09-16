"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      await apiPost("/auth/login", values);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <main style={{ maxWidth: 400, margin: "4rem auto", padding: "2rem" }}>
      <h1>Log in to Fundly</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Email
          <input type="email" {...register("email", { required: true })} />
        </label>
        <label>
          Password
          <input type="password" {...register("password", { required: true })} />
        </label>
        <button type="submit">Log In</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p style={{ marginTop: "1rem" }}>
        Don't have an account? <a href="/signup">Sign up</a>
      </p>
      <p>
        <a href="/forgot-password">Forgot your password?</a>
    </p>
    </main>
  );
}