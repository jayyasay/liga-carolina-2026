"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function PublicNav() {
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>

        <div style={{ zIndex: 50, position: 'relative' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className="brand-gradient" style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px', margin: 0, textTransform: 'none' }}>
              <Image src="/logo.jpg" alt="Liga Carolina Logo" width={40} height={40} style={{ borderRadius: '6px', objectFit: 'contain' }} />
              Liga Carolina
            </h1>
          </Link>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Official Game Results and Player Leaders</p>
        </div>

        {/* Desktop Links */}
        <div className="public-desktop-only" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link href="/leaders" className="secondary-btn" style={{ textDecoration: 'none' }}>Top 10 Leaders</Link>
          <Link href="/standings" className="secondary-btn" style={{ textDecoration: 'none' }}>Standings</Link>
          <Link href="/admin" className="primary-btn" style={{ textDecoration: 'none' }}>Admin Login</Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="public-mobile-only" style={{ display: 'flex', alignItems: 'center', zIndex: 50, position: 'relative' }}>
          <button onClick={toggleMenu} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px' }}>
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="public-mobile-only" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-color)', zIndex: 40, padding: '150px 24px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Link href="/leaders" onClick={toggleMenu} className="secondary-btn" style={{ textDecoration: 'none', textAlign: 'center', fontSize: '1.2rem' }}>Top 10 Leaders</Link>
          <Link href="/standings" onClick={toggleMenu} className="secondary-btn" style={{ textDecoration: 'none', textAlign: 'center', fontSize: '1.2rem' }}>Standings</Link>
          <Link href="/admin" onClick={toggleMenu} className="primary-btn" style={{ textDecoration: 'none', textAlign: 'center', fontSize: '1.2rem', marginTop: '16px' }}>Admin Login</Link>
        </div>
      )}

      <style jsx global>{`
        @media (min-width: 769px) {
          .public-mobile-only {
            display: none !important;
          }
        }
        @media (max-width: 768px) {
          .public-desktop-only {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
