"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTransition, useState } from "react";
import { logoutAction } from "./login/actions";
import { 
  LayoutDashboard, 
  Trophy, 
  Shield, 
  Users, 
  LogOut, 
  ExternalLink, 
  Menu, 
  X 
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/matches", label: "Manage Matches", icon: Trophy, exact: false },
  { href: "/admin/teams", label: "Teams", icon: Shield, exact: false },
  { href: "/admin/players", label: "Players & Rosters", icon: Users, exact: false },
];

export default function AdminNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  // 1. Hide sidebar/nav entirely on login page
  if (pathname === "/admin/login") {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg-color)" }}>
        {children}
      </div>
    );
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <div style={{ display: "flex", minHeight: "100dvh", background: "var(--bg-color)" }} className="admin-shell">
      {/* Mobile Top Bar */}
      <div style={{
        display: "none",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "60px",
        background: "var(--surface-base)",
        borderBottom: "1px solid var(--border-light)",
        zIndex: 200,
        alignItems: "center",
        padding: "0 20px",
        justifyContent: "space-between",
      }} className="mobile-only-flex">
        <h2 className="brand-gradient" style={{ fontSize: "1.1rem", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Image src="/logo.jpg" alt="Liga Carolina Logo" width={24} height={24} style={{ borderRadius: "4px", objectFit: "contain" }} />
          Liga Carolina
        </h2>
        <button 
          onClick={toggleMobileMenu}
          style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* ── Sidebar ── */}
      <aside style={{
        width: "260px",
        flexShrink: 0,
        background: "var(--surface-base)",
        borderRight: "1px solid var(--border-light)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        transform: isMobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease",
      }} className="responsive-sidebar">
        {/* Brand */}
        <div style={{ padding: "28px 24px", borderBottom: "1px solid var(--border-light)", flexShrink: 0 }}>
          <h2 className="brand-gradient" style={{ fontSize: "1.25rem", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Image src="/logo.jpg" alt="Liga Carolina Logo" width={28} height={28} style={{ borderRadius: "4px", objectFit: "contain" }} />
            Liga Carolina
          </h2>
          <span className="badge badge-live" style={{ fontSize: "0.65rem" }}>Admin Portal</span>
        </div>

        {/* Nav Links — scrollable middle */}
        <nav style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: "4px", flex: 1, overflowY: "auto" }}>
          {navItems.map(item => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 14px",
                  borderRadius: "var(--border-radius-sm)",
                  background: active ? "rgba(26, 115, 232, 0.12)" : "transparent",
                  color: active ? "var(--brand-blue)" : "var(--text-secondary)",
                  fontWeight: active ? 600 : 500,
                  textDecoration: "none",
                  transition: "background 0.15s, color 0.15s",
                  borderLeft: `3px solid ${active ? "var(--brand-blue)" : "transparent"}`,
                  fontSize: "0.95rem",
                }}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ── Fixed Bottom User Section ── */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid var(--border-light)",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", background: "var(--surface-hover)", borderRadius: "var(--border-radius-sm)", marginBottom: "4px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--brand-cyan)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.9rem", flexShrink: 0 }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)" }}>Administrator</div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Full Access</div>
            </div>
          </div>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "9px", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-light)", color: "var(--text-secondary)", fontSize: "0.85rem", textDecoration: "none", transition: "background 0.15s" }}>
            <ExternalLink size={14} />
            Public Site
          </Link>
          <button
            onClick={handleLogout}
            disabled={isPending}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "9px", borderRadius: "var(--border-radius-sm)", border: "1px solid var(--border-light)", background: "transparent", color: "var(--text-secondary)", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, transition: "background 0.15s" }}
          >
            <LogOut size={14} />
            {isPending ? "Signing out..." : "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 90,
          }}
          className="mobile-only"
        />
      )}

      {/* ── Main Content — offset by sidebar width, independently scrollable ── */}
      <main style={{ marginLeft: "260px", flex: 1, padding: "40px", height: "100dvh", overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch" }} className="admin-main">
        {children}
      </main>

      <style jsx global>{`
        @media (min-width: 1025px) {
          .admin-shell {
            height: 100dvh;
            overflow: hidden;
          }
          .responsive-sidebar {
            transform: translateX(0) !important;
          }
          .mobile-only, .mobile-only-flex {
            display: none !important;
          }
        }
        @media (max-width: 1024px) {
          .admin-shell {
            display: block !important;
            height: auto !important;
            overflow: visible !important;
          }
          .mobile-only-flex {
            display: flex !important;
          }
          .admin-main {
            margin-left: 0 !important;
            height: auto !important;
            overflow: visible !important;
            min-height: calc(100dvh - 80px);
            padding: 80px 20px 20px !important;
          }
        }
      `}</style>
    </div>
  );
}
