import { db } from "@/db";
import { players, teams } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import PlayerManager from "./PlayerManager";
import DeletePlayerButton from "./DeletePlayerButton";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AdminPlayersPage() {
  await requireAdminSession();

  // Fetch teams for the dropdowns
  const allTeams = await db.select({ id: teams.id, name: teams.name }).from(teams).orderBy(teams.name);

  // Fetch players with Left Join to grab their team name
  const allPlayers = await db
    .select({
      id: players.id,
      firstName: players.firstName,
      lastName: players.lastName,
      jerseyNumber: players.jerseyNumber,
      position: players.position,
      teamName: teams.name,
    })
    .from(players)
    .leftJoin(teams, eq(players.teamId, teams.id))
    .orderBy(desc(players.createdAt));

  return (
    <div style={{ maxWidth: '900px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }} className="brand-gradient">
        Player Roster Management
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Add individuals or import bulk comma-separated text to rapidly build rosters.
      </p>

      {/* Embedded Player Tool (Single & Bulk) */}
      <PlayerManager teams={allTeams} />

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Current Players ({allPlayers.length})</h2>

      {allPlayers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No players registered yet. Use the tool above to add some.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--surface-hover)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '16px' }}>Name</th>
                <th style={{ padding: '16px' }}>Team</th>
                <th style={{ padding: '16px' }}>Jersey #</th>
                <th style={{ padding: '16px' }}>Pos</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allPlayers.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {p.firstName} {p.lastName}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--brand-cyan)' }}>
                    {p.teamName || <span style={{ color: "var(--text-muted)", fontStyle: 'italic' }}>Unassigned</span>}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {p.jerseyNumber !== null ? `#${p.jerseyNumber}` : '--'}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {p.position || '--'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <DeletePlayerButton id={p.id} />
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
