"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(loginAction, null);

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {state?.error && (
        <div style={{ padding: "12px 16px", background: "rgba(254,102,0,0.1)", border: "1px solid rgba(254,102,0,0.3)", borderRadius: "8px", color: "var(--brand-primary)", fontSize: "0.9rem" }}>
          {state.error}
        </div>
      )}

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Username
        </label>
        <input
          name="username"
          type="text"
          autoComplete="username"
          required
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", fontSize: "1rem", outline: "none" }}
        />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>
          Password
        </label>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "var(--surface-hover)", color: "var(--text-primary)", fontSize: "1rem", outline: "none" }}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="primary-btn"
        style={{ width: "100%", padding: "14px", fontSize: "1rem", marginTop: "8px" }}
      >
        {isPending ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
