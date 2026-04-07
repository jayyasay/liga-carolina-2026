import Link from 'next/link';
import { db } from "@/db";
import { matches, teams } from "@/db/schema";
import PublicNav from "@/components/PublicNav";
import { eq } from "drizzle-orm";

const validDivisions = ["Kids Camp", "Midgets", "Juniors", "Seniors", "Open Seniors Division"];

export default async function StandingsPage({ searchParams }: { searchParams: Promise<{ division?: string }> }) {
    const resolvedParams = await searchParams;
    const filterDivision = resolvedParams.division;

    // Fetch the small slices of data this page actually needs, in parallel.
    const [allTeams, completedMatches] = await Promise.all([
        db.select({
            id: teams.id,
            name: teams.name,
            division: teams.division,
            primaryColor: teams.primaryColor,
        }).from(teams),
        db.select({
            homeTeamId: matches.homeTeamId,
            awayTeamId: matches.awayTeamId,
            homeScore: matches.homeScore,
            awayScore: matches.awayScore,
        }).from(matches).where(eq(matches.status, "COMPLETED")),
    ]);

    // 3. Initialize Standings Map
    const standingsMap: Record<string, { id: string, name: string, division: string, color: string | null, wins: number, losses: number }> = {};

    allTeams.forEach(t => {
        standingsMap[t.id] = {
            id: t.id,
            name: t.name,
            division: t.division || "Open Seniors Division",
            color: t.primaryColor,
            wins: 0,
            losses: 0
        };
    });

    // 4. Calculate Wins / Losses Algorithm
    completedMatches.forEach(m => {
        const homeId = m.homeTeamId;
        const awayId = m.awayTeamId;
        if (!homeId || !awayId || !standingsMap[homeId] || !standingsMap[awayId]) return;

        const hScore = m.homeScore || 0;
        const aScore = m.awayScore || 0;

        if (hScore > aScore) {
            standingsMap[homeId].wins += 1;
            standingsMap[awayId].losses += 1;
        } else if (aScore > hScore) {
            standingsMap[awayId].wins += 1;
            standingsMap[homeId].losses += 1;
        }
    });

    // 5. Array Conversion & Filtering
    let finalStandings = Object.values(standingsMap);

    if (filterDivision && validDivisions.includes(filterDivision)) {
        finalStandings = finalStandings.filter(t => t.division === filterDivision);
    }

    // Sort logically: Most Wins first, then fewest Losses
    finalStandings.sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.losses - b.losses;
    });

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>

            <PublicNav />

            {/* Division Filter Bar */}
            <div style={{ marginBottom: '40px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link href="/standings" className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none', background: !filterDivision ? 'rgba(0,0,0,0.0)' : 'var(--surface-hover)', borderColor: !filterDivision ? 'var(--brand-primary)' : 'transparent', color: !filterDivision ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                    Overall League
                </Link>
                {validDivisions.map(div => (
                    <Link key={div} href={`/standings?division=${encodeURIComponent(div)}`} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none', background: filterDivision === div ? 'rgba(0,0,0,0.0)' : 'var(--surface-hover)', borderColor: filterDivision === div ? 'var(--brand-cyan)' : 'transparent', color: filterDivision === div ? 'var(--brand-cyan)' : 'var(--text-secondary)' }}>
                        {div}
                    </Link>
                ))}
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: 'var(--surface-hover)' }}>
                        <tr>
                            <th style={{ padding: '16px', width: '60px', textAlign: 'center' }}>Rank</th>
                            <th style={{ padding: '16px' }}>Team</th>
                            <th style={{ padding: '16px' }}>Division</th>
                            <th style={{ padding: '16px', textAlign: 'center', width: '100px' }}>Wins (W)</th>
                            <th style={{ padding: '16px', textAlign: 'center', width: '100px' }}>Losses (L)</th>
                            <th style={{ padding: '16px', textAlign: 'center', width: '100px' }}>Win %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalStandings.map((team, idx) => {
                            const totalGames = team.wins + team.losses;
                            const winPct = totalGames > 0 ? (team.wins / totalGames).toFixed(3) : ".000";

                            return (
                                <tr key={team.id} style={{ borderTop: '1px solid var(--border-light)', transition: 'background 0.2s' }} className="hover-row">
                                    <td style={{ padding: '16px', textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: idx === 0 ? 'var(--brand-primary)' : 'var(--text-secondary)' }}>
                                        {idx + 1}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: team.color || 'var(--text-muted)' }}></div>
                                            <span style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{team.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span className="badge" style={{ background: 'var(--surface-hover)', border: '1px solid var(--border-light)' }}>
                                            {team.division}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: team.wins > 0 ? 'var(--brand-cyan)' : 'var(--text-muted)' }}>
                                        {team.wins}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                                        {team.losses}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center', fontFamily: 'monospace', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                        {winPct}
                                    </td>
                                </tr>
                            );
                        })}
                        {finalStandings.length === 0 && (
                            <tr>
                                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                    No active teams found for this division view.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .hover-row:hover {
          background: rgba(255,255,255,0.03);
        }
      `}} />

        </div>
    );
}
