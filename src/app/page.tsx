import Link from 'next/link';
import { db } from "@/db";
import { matches, teams, players } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { Trophy } from 'lucide-react';

const validDivisions = ["Kids Camp", "Midgets", "Juniors", "Seniors", "Open Seniors Division"];

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ division?: string }> }) {
  const resolvedParams = await searchParams;
  const filterDivision = resolvedParams.division;

  const homeTeams = alias(teams, "homeTeams");
  const awayTeams = alias(teams, "awayTeams");
  const potgPlayers = alias(players, "potgPlayers");

  const allMatchesRaw = await db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
      homeTeamName: homeTeams.name,
      awayTeamName: awayTeams.name,
      division: homeTeams.division,
      playerOfTheGameId: matches.playerOfTheGameId,
      potgFirstName: potgPlayers.firstName,
      potgLastName: potgPlayers.lastName,
      potgJersey: potgPlayers.jerseyNumber,
    })
    .from(matches)
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .leftJoin(potgPlayers, eq(matches.playerOfTheGameId, potgPlayers.id))
    .orderBy(desc(matches.matchDate));

  let finalMatches = allMatchesRaw;
  if (filterDivision && validDivisions.includes(filterDivision)) {
     finalMatches = allMatchesRaw.filter(m => m.division === filterDivision);
  }

  const upcomingMatches = finalMatches.filter(m => m.status === 'SCHEDULED' || m.status === 'LIVE');
  const completedMatches = finalMatches.filter(m => m.status === 'COMPLETED');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="brand-gradient" style={{ fontSize: '2rem' }}>LIGA STATS</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Premium Basketball Dashboard</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Link href="/leaders" className="secondary-btn" style={{ textDecoration: 'none' }}>Top 10 Leaders</Link>
          <Link href="/standings" className="secondary-btn" style={{ textDecoration: 'none' }}>Standings</Link>
          <Link href="/admin" className="primary-btn" style={{ textDecoration: 'none' }}>Admin Login</Link>
        </div>
      </header>

      {/* Division Filter Bar */}
      <div style={{ marginBottom: '40px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
         <Link href="/" className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none', background: !filterDivision ? 'var(--brand-primary)' : 'var(--surface-hover)', borderColor: !filterDivision ? 'var(--brand-primary)' : 'transparent', color: !filterDivision ? 'white' : 'var(--text-secondary)' }}>
             All Divisions
         </Link>
         {validDivisions.map(div => (
             <Link key={div} href={`/?division=${encodeURIComponent(div)}`} className="secondary-btn" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none', background: filterDivision === div ? 'var(--brand-primary)' : 'var(--surface-hover)', borderColor: filterDivision === div ? 'var(--brand-primary)' : 'transparent', color: filterDivision === div ? 'white' : 'var(--text-secondary)' }}>
                 {div}
             </Link>
         ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '40px' }}>
        
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-primary)' }}></span>
              UPCOMING & LIVE MATCHES
            </h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {upcomingMatches.length === 0 && (
               <div style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                 No upcoming matches found for this view.
               </div>
            )}
            {upcomingMatches.map(match => (
              <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="glass-panel hover-card match-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', cursor: 'pointer', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                       {match.status === 'LIVE' && <span className="badge badge-live">Live Now</span>}
                       {match.status === 'SCHEDULED' && <span className="badge" style={{ background: 'var(--surface-hover)', color: 'var(--text-secondary)' }}>Scheduled</span>}
                       <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>{match.division}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{match.matchDate.toLocaleDateString()} {match.matchDate.toLocaleTimeString([], {timeStyle: 'short'})}</div>
                  </div>
                  
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '1.5rem', fontWeight: 'bold' }} className="match-score-section">
                    <div style={{ textAlign: 'right', flex: 1 }}>{match.homeTeamName}</div>
                    {match.status === 'LIVE' ? (
                       <div style={{ background: 'var(--surface-hover)', padding: '6px 16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-light)', minWidth: '100px', textAlign: 'center' }}>
                          <span style={{ color: match.homeScore! > match.awayScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{match.homeScore}</span>
                          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>-</span>
                          <span style={{ color: match.awayScore! > match.homeScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{match.awayScore}</span>
                       </div>
                    ) : (
                       <div style={{ color: 'var(--text-muted)', fontSize: '1rem', fontFamily: 'var(--font-sans)', minWidth: '40px', textAlign: 'center' }}>VS</div>
                    )}
                    <div style={{ textAlign: 'left', flex: 1 }}>{match.awayTeamName}</div>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="view-detail-link">View Details &rarr;</div>
              </div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>COMPLETED</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {completedMatches.length === 0 && (
               <div style={{ color: 'var(--text-secondary)', padding: '20px', textAlign: 'center', border: '1px dashed var(--border-light)', borderRadius: '8px' }}>
                 No matches have been completed yet.
               </div>
            )}
            {completedMatches.map(match => (
              <Link key={match.id} href={`/matches/${match.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div className="glass-panel hover-card match-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '16px' }}>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <div style={{ marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                       <span className="badge badge-completed">Final</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--brand-cyan)', textTransform: 'uppercase', letterSpacing: '1px' }}>{match.division}</span>
                    </div>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: match.potgFirstName ? '8px' : '0' }}>
                      {match.matchDate.toLocaleDateString()}
                    </div>
                    {/* Player of the Game tag */}
                    {match.potgFirstName && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: 'rgba(255,183,0,0.1)', border: '1px solid rgba(255,183,0,0.3)', borderRadius: '20px' }}>
                        <Trophy size={14} color="#ffb700" />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ffb700' }}>
                          {match.potgFirstName} {match.potgLastName}
                          {match.potgJersey != null && <span style={{ fontWeight: 400, marginLeft: '4px', opacity: 0.8 }}>#{match.potgJersey}</span>}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', fontSize: '1.5rem', fontWeight: 'bold' }} className="match-score-section">
                    <div style={{ textAlign: 'right', flex: 1, color: match.homeScore! > match.awayScore! ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {match.homeTeamName}
                    </div>
                    <div style={{ background: 'var(--surface-hover)', padding: '6px 16px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-light)', minWidth: '100px', textAlign: 'center' }}>
                      <span style={{ color: match.homeScore! > match.awayScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{match.homeScore}</span>
                      <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>-</span>
                      <span style={{ color: match.awayScore! > match.homeScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{match.awayScore}</span>
                    </div>
                    <div style={{ textAlign: 'left', flex: 1, color: match.awayScore! > match.homeScore! ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {match.awayTeamName}
                    </div>
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }} className="view-detail-link">
                    Box Score &rarr;
                  </div>
              </div>
              </Link>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
