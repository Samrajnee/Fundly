"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiPatch, apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface AccountFormValues {
  name: string;
  email: string;
}

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
}

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [accountMessage, setAccountMessage] = useState<string | null>(null);
  const [accountError, setAccountError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const accountForm = useForm<AccountFormValues>({
    defaultValues: { name: user?.name ?? "", email: user?.email ?? "" },
  });

  const passwordForm = useForm<PasswordFormValues>();

  async function onUpdateAccount(values: AccountFormValues) {
    setAccountError(null);
    setAccountMessage(null);
    try {
      await apiPatch("/account", values);
      await refresh();
      setAccountMessage("Account updated.");
    } catch (err) {
      setAccountError(err instanceof Error ? err.message : "Failed to update account");
    }
  }

  async function onChangePassword(values: PasswordFormValues) {
    setPasswordError(null);
    setPasswordMessage(null);
    try {
      await apiPost("/account/change-password", values);
      passwordForm.reset();
      setPasswordMessage("Password changed successfully.");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to change password");
    }
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "2rem" }}>
      <h1>Account Settings</h1>

      <section style={{ marginTop: "1.5rem" }}>
        <h2>Profile</h2>
        <form
          onSubmit={accountForm.handleSubmit(onUpdateAccount)}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <label>
            Name
            <input type="text" {...accountForm.register("name", { required: true })} />
          </label>
          <label>
            Email
            <input type="email" {...accountForm.register("email", { required: true })} />
          </label>
          <button type="submit">Save Changes</button>
        </form>
        {accountMessage && <p style={{ color: "#3a3" }}>{accountMessage}</p>}
        {accountError && <p style={{ color: "red" }}>{accountError}</p>}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>Change Password</h2>
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <label>
            Current Password
            <input type="password" {...passwordForm.register("currentPassword", { required: true })} />
          </label>
          <label>
            New Password (min 8 characters)
            <input type="password" {...passwordForm.register("newPassword", { required: true, minLength: 8 })} />
          </label>
          <button type="submit">Change Password</button>
        </form>
        {passwordMessage && <p style={{ color: "#3a3" }}>{passwordMessage}</p>}
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
      </section>
    </main>
  );
}