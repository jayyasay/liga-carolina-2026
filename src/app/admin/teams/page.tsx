import { db } from "@/db";
import { teams } from "@/db/schema";
import CreateTeamForm from "./CreateTeamForm";
import DeleteTeamButton from "./DeleteTeamButton";
import { desc } from "drizzle-orm";
import Link from "next/link";

export default async function AdminTeamsPage() {
  // Query Drizzle directly server-side
  const allTeams = await db.select().from(teams).orderBy(desc(teams.createdAt));

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }} className="brand-gradient">
        Teams &amp; Rosters
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Manage league teams directly in the database.
      </p>

      {/* Embed the Client Form Component */}
      <CreateTeamForm />

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Registered Teams ({allTeams.length})</h2>
      
      {allTeams.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No teams registered yet. Add one above.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--surface-hover)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '16px' }}>Team Name</th>
                <th style={{ padding: '16px' }}>Short Name</th>
                <th style={{ padding: '16px' }}>Color</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allTeams.map((team) => (
                <tr key={team.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>
                    <Link href={`/admin/teams/${team.id}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none' }} className="hover-underline">
                      {team.name}
                    </Link>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {team.shortName}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '16px', height: '16px', 
                        borderRadius: '50%', 
                        background: team.primaryColor || '#000' 
                      }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {team.primaryColor}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <DeleteTeamButton id={team.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
