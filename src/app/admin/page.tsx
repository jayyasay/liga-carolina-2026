import Link from "next/link";
import { db } from "@/db";
import { matches, teams, players } from "@/db/schema";
import { count } from "drizzle-orm";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminDashboardPage() {
  await requireAdminSession();

  const [[{ count: mCount }], [{ count: tCount }], [{ count: pCount }]] = await Promise.all([
    db.select({ count: count() }).from(matches),
    db.select({ count: count() }).from(teams),
    db.select({ count: count() }).from(players),
  ]);

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }} className="brand-gradient">Overview Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '40px' }}>
        Welcome to your administrative control center. Select a module to manage your league.
      </p>

      <div className="dashboard-overview-grid">
         <Link href="/admin/matches" style={{ display: 'block', textDecoration: 'none' }}>
           <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--brand-primary)', transition: 'background 0.2s', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Manage Matches</h2>
                  <span className="badge badge-live" style={{ background: 'var(--surface-hover)', border: 'none', color: 'var(--text-secondary)' }}>{mCount} Total</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Schedule games, update live scores, and upload player stats mapped to specific games.</p>
           </div>
         </Link>

         <Link href="/admin/teams" style={{ display: 'block', textDecoration: 'none' }}>
           <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid var(--brand-cyan)', transition: 'background 0.2s', cursor: 'pointer' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Teams & Franchises</h2>
                  <span className="badge" style={{ background: 'var(--surface-hover)', border: 'none', color: 'var(--text-secondary)' }}>{tCount} Total</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Create new franchises, manage team branding, and open franchise hubs.</p>
           </div>
         </Link>

          <Link href="/admin/players" style={{ display: 'block', textDecoration: 'none', gridColumn: 'span 2' }}>
           <div className="glass-panel" style={{ padding: '32px', borderLeft: '4px solid #fff', transition: 'background 0.2s', cursor: 'pointer' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)' }}>Player Roster Admin</h2>
                  <span className="badge" style={{ background: 'var(--surface-hover)', border: 'none', color: 'var(--text-secondary)' }}>{pCount} Total</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Execute bulk text imports for rapid roster building and trade management.</p>
           </div>
         </Link>
      </div>
      
    </div>
  );
}
