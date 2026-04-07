import { db } from "@/db";
import { matches, teams } from "@/db/schema";
import { desc, eq, asc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import Link from "next/link";
import CreateMatchForm from "./CreateMatchForm";
import DeleteMatchButton from "./DeleteMatchButton";
import { requireAdminSession } from "@/lib/admin-auth";

const validDivisions = ["Kids Camp", "Midgets", "Juniors", "Seniors", "Open Seniors Division"];
type Division = typeof validDivisions[number];

export default async function AdminMatchesPage({ searchParams }: { searchParams: Promise<{ division?: string }> }) {
  await requireAdminSession();

  const { division: filterDivision } = await searchParams;
  const activeDivision: Division | null = filterDivision && validDivisions.includes(filterDivision as Division)
    ? (filterDivision as Division)
    : null;
  const divisionFilter = activeDivision as Division | null | any;

  const allTeams = await db.select({ id: teams.id, name: teams.name, division: teams.division }).from(teams).orderBy(asc(teams.name));

  const homeTeams = alias(teams, "homeTeams");
  const awayTeams = alias(teams, "awayTeams");

  const baseMatchesQuery = db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeTeamName: homeTeams.name,
      awayTeamName: awayTeams.name,
      homeTeamColor: homeTeams.primaryColor,
      awayTeamColor: awayTeams.primaryColor,
      division: homeTeams.division,
    })
    .from(matches)
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id));

  const filteredMatches = activeDivision
    ? await baseMatchesQuery.where(eq(homeTeams.division, divisionFilter)).orderBy(desc(matches.matchDate))
    : await baseMatchesQuery.orderBy(desc(matches.matchDate));

  return (
    <div style={{ maxWidth: '1000px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }} className="brand-gradient">
        Match Scheduling
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Create upcoming games, update live statuses, and connect box scores.
      </p>

      <CreateMatchForm teams={allTeams} />

      {/* Division Filter Bar */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', alignItems: 'center' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '4px' }}>Filter:</span>
        <Link href="/admin/matches" style={{ padding: '5px 12px', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', background: !filterDivision ? 'rgba(0,210,255,0.15)' : 'var(--surface-hover)', border: `1px solid ${!filterDivision ? 'var(--brand-cyan)' : 'transparent'}`, color: !filterDivision ? 'var(--brand-cyan)' : 'var(--text-secondary)' }}>
          All
        </Link>
        {validDivisions.map(div => (
          <Link key={div} href={`/admin/matches?division=${encodeURIComponent(div)}`} style={{ padding: '5px 12px', borderRadius: '4px', fontSize: '0.85rem', textDecoration: 'none', background: filterDivision === div ? 'rgba(0,210,255,0.15)' : 'var(--surface-hover)', border: `1px solid ${filterDivision === div ? 'var(--brand-cyan)' : 'transparent'}`, color: filterDivision === div ? 'var(--brand-cyan)' : 'var(--text-secondary)' }}>
            {div}
          </Link>
        ))}
      </div>

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
        Schedule ({filteredMatches.length}{filterDivision ? ` in ${filterDivision}` : ' total'})
      </h2>
      
      {filteredMatches.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {filterDivision ? `No matches found for ${filterDivision}.` : 'No matches scheduled yet.'}
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--surface-hover)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '16px' }}>Date</th>
                <th style={{ padding: '16px' }}>Division</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Home</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Score</th>
                <th style={{ padding: '16px', textAlign: 'left' }}>Away</th>
                <th style={{ padding: '16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatches.map((m) => (
                <tr key={m.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                    {m.matchDate.toLocaleDateString()} {m.matchDate.toLocaleTimeString([], {timeStyle: 'short'})}
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                      {m.division || '—'}
                    </span>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    {m.homeTeamName}
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: m.homeTeamColor || '#000', marginLeft: '8px' }}></span>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold' }}>
                    {m.status === 'COMPLETED' || m.status === 'LIVE' ? (
                      <span style={{ padding: '4px 8px', background: 'var(--surface-hover)', borderRadius: '4px' }}>
                        <span style={{ color: m.homeScore! > m.awayScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{m.homeScore}</span>
                        <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>-</span>
                        <span style={{ color: m.awayScore! > m.homeScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{m.awayScore}</span>
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>VS</span>
                    )}
                  </td>

                  <td style={{ padding: '16px', textAlign: 'left', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: m.awayTeamColor || '#000', marginRight: '8px' }}></span>
                    {m.awayTeamName}
                  </td>

                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span className={`badge ${m.status === 'LIVE' ? 'badge-live' : m.status === 'COMPLETED' ? 'badge-completed' : ''}`} style={{ 
                      ...(m.status === 'SCHEDULED' && { background: 'var(--surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' })
                    }}>
                      {m.status}
                    </span>
                  </td>

                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Link href={`/admin/matches/${m.id}`} className="primary-btn" style={{ padding: '4px 12px', fontSize: '0.85rem', textDecoration: 'none' }}>
                        Manage
                      </Link>
                      <DeleteMatchButton id={m.id} />
                    </div>
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
