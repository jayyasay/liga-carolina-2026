import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";

export const metadata = { title: "Admin Login — Liga Stats" };

export default async function LoginPage() {
  const session = await getSession();
  if (session.isLoggedIn) redirect("/admin");

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className="brand-gradient" style={{ fontSize: "2.5rem", letterSpacing: "4px", marginBottom: "8px" }}>LIGA STATS</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Admin Portal &mdash; Restricted Access</p>
        </div>

        {/* Card */}
        <div className="glass-panel" style={{ padding: "40px" }}>
          <h2 style={{ fontSize: "1.5rem", marginBottom: "8px", color: "var(--text-primary)" }}>Sign In</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "32px" }}>
            Enter your admin credentials to access the dashboard.
          </p>
          <LoginForm />
        </div>

        <p style={{ textAlign: "center", marginTop: "24px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          <a href="/" style={{ color: "var(--brand-primary)", textDecoration: "none" }}>← Back to public site</a>
        </p>
      </div>
    </div>
  );
}
