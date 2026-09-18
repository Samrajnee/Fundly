"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

interface AccountFormValues { name: string; email: string; }
interface PasswordFormValues { currentPassword: string; newPassword: string; }
interface AiUsage { userCallsToday: number; userDailyLimit: number; userCallsThisMonth: number; }

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [usage, setUsage] = useState<AiUsage | null>(null);

  const accountForm = useForm<AccountFormValues>({ defaultValues: { name: user?.name ?? "", email: user?.email ?? "" } });
  const passwordForm = useForm<PasswordFormValues>();

  useEffect(() => { apiGet<AiUsage>("/ai/usage").then(setUsage).catch(() => setUsage(null)); }, []);

  async function onUpdateAccount(values: AccountFormValues) {
    setAccountError(null); setAccountMessage(null);
    try { await apiPatch("/account", values); await refresh(); setAccountMessage("Account updated."); }
    catch (err) { setAccountError(err instanceof Error ? err.message : "Failed to update account"); }
  }

  async function onChangePassword(values: PasswordFormValues) {
    setPasswordError(null); setPasswordMessage(null);
    try { await apiPost("/account/change-password", values); passwordForm.reset(); setPasswordMessage("Password changed."); }
    catch (err) { setPasswordError(err instanceof Error ? err.message : "Failed to change password"); }
  }

  return (
    <main style={{ maxWidth: 500, margin: "0 auto", padding: "2.5rem" }}>
      <PageHeader title="Account settings" />

      <Card style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Profile</h3>
        <form onSubmit={accountForm.handleSubmit(onUpdateAccount)}>
          <label>Name<input type="text" {...accountForm.register("name", { required: true })} /></label>
          <label>Email<input type="email" {...accountForm.register("email", { required: true })} /></label>
          <button type="submit">Save changes</button>
        </form>
        {accountMessage && <p style={{ color: "var(--color-success)" }}>{accountMessage}</p>}
        {accountError && <p style={{ color: "var(--color-danger)" }}>{accountError}</p>}
      </Card>

      <Card style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ marginTop: 0 }}>Change password</h3>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)}>
          <label>Current password<input type="password" {...passwordForm.register("currentPassword", { required: true })} /></label>
          <label>New password (min 8 characters)<input type="password" {...passwordForm.register("newPassword", { required: true, minLength: 8 })} /></label>
          <button type="submit">Change password</button>
        </form>
        {passwordMessage && <p style={{ color: "var(--color-success)" }}>{passwordMessage}</p>}
        {passwordError && <p style={{ color: "var(--color-danger)" }}>{passwordError}</p>}
      </Card>

      {usage && (
        <Card>
          <h3 style={{ marginTop: 0 }}>AI usage</h3>
          <p style={{ margin: "0 0 0.3rem" }}>Today: {usage.userCallsToday} of {usage.userDailyLimit} requests used</p>
          <p style={{ margin: "0 0 0.5rem" }}>This month: {usage.userCallsThisMonth} requests</p>
          <div style={{ background: "var(--color-surface-alt)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{ width: `${Math.min((usage.userCallsToday / usage.userDailyLimit) * 100, 100)}%`, background: usage.userCallsToday >= usage.userDailyLimit ? "var(--color-danger)" : "var(--color-success)", height: "100%" }} />
          </div>
        </Card>
      )}
    </main>
  );
}