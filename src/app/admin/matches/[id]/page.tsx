import { db } from "@/db";
import { matches, teams, players, playerMatchStats } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import Link from "next/link";
import { notFound } from "next/navigation";
import ScoreController from "./ScoreController";
import BoxScoreManager from "./BoxScoreManager";
import PlayerOfTheGameSelector from "./PlayerOfTheGameSelector";
import ScheduledMatchEditor from "./ScheduledMatchEditor";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();

  const resolvedParams = await params;
  const matchId = resolvedParams.id;

  const homeTeams = alias(teams, "homeTeams");
  const awayTeams = alias(teams, "awayTeams");

  const matchResults = await db
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
      homeTeamColor: homeTeams.primaryColor,
      awayTeamColor: awayTeams.primaryColor,
      playerOfTheGameId: matches.playerOfTheGameId,
    })
    .from(matches)
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .where(eq(matches.id, matchId))
    .limit(1);

  const matchData = matchResults[0];

  if (!matchData || !matchData.homeTeamId || !matchData.awayTeamId) {
    notFound();
  }

  // Fetch roster and stats in parallel once the match context is known.
  const activeRosterQuery = db
      .select({ 
          id: players.id, 
          firstName: players.firstName, 
          lastName: players.lastName, 
          teamId: players.teamId, 
          jerseyNumber: players.jerseyNumber 
      })
      .from(players)
      .where(or(eq(players.teamId, matchData.homeTeamId), eq(players.teamId, matchData.awayTeamId)));
  const existingStatsQuery = db
      .select()
      .from(playerMatchStats)
      .where(eq(playerMatchStats.matchId, matchId));

  const [activeRosterRaw, existingStats] = await Promise.all([activeRosterQuery, existingStatsQuery]);
  const activeRoster = activeRosterRaw.filter((p): p is typeof p & { teamId: string } => p.teamId !== null);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '60px' }}>
      {/* Return Navigation */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/admin/matches" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} className="hover-underline">
          &larr; Back to Schedule
        </Link>
      </div>

       {/* Dynamic Scoreboard Header */}
       <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: matchData.homeTeamColor || 'var(--surface-hover)', margin: '0 auto 16px auto', border: '3px solid var(--border-light)' }}></div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{matchData.homeTeamName}</h2>
         </div>

         <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <span className={`badge ${matchData.status === 'LIVE' ? 'badge-live' : matchData.status === 'COMPLETED' ? 'badge-completed' : ''}`} style={{ 
                      ...(matchData.status === 'SCHEDULED' && { background: 'var(--surface-hover)', color: 'var(--text-secondary)', border: '1px solid var(--border-light)' })
            }}>
                {matchData.status}
            </span>
            <div style={{ fontSize: '3rem', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '4px' }}>
                <span style={{ color: matchData.homeScore! > matchData.awayScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{matchData.homeScore}</span>
                <span style={{ color: 'var(--text-muted)' }}> - </span>
                <span style={{ color: matchData.awayScore! > matchData.homeScore! ? 'var(--brand-primary)' : 'var(--text-primary)' }}>{matchData.awayScore}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {matchData.matchDate.toLocaleDateString()} &middot; {matchData.matchDate.toLocaleTimeString([], { timeStyle: "short" })}
            </div>
         </div>

         <div style={{ flex: 1, textAlign: 'center' }}>
             <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: matchData.awayTeamColor || 'var(--surface-hover)', margin: '0 auto 16px auto', border: '3px solid var(--border-light)' }}></div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>{matchData.awayTeamName}</h2>
         </div>
       </div>

       {matchData.status === "SCHEDULED" && (
        <ScheduledMatchEditor matchId={matchId} initialMatchDateIso={matchData.matchDate.toISOString()} />
       )}

       {/* Score Controls */}
       <ScoreController 
        matchId={matchId} 
        defaultHomeScore={matchData.homeScore} 
        defaultAwayScore={matchData.awayScore} 
        currentStatus={matchData.status} 
       />

       {/* Player of the Game Selector */}
       <PlayerOfTheGameSelector
         matchId={matchId}
         roster={activeRoster}
         homeTeam={{ id: matchData.homeTeamId, name: matchData.homeTeamName }}
         awayTeam={{ id: matchData.awayTeamId, name: matchData.awayTeamName }}
         currentPlayerOfTheGameId={matchData.playerOfTheGameId}
       />

       {/* Comprehensive Stat Injector */}
       <BoxScoreManager
         matchId={matchId}
         homeTeam={{ id: matchData.homeTeamId, name: matchData.homeTeamName }}
         awayTeam={{ id: matchData.awayTeamId, name: matchData.awayTeamName }}
         roster={activeRoster}
         existingStats={existingStats}
       />

       <style dangerouslySetInnerHTML={{__html: `
        .hover-underline:hover {
          text-decoration: underline !important;
        }
      `}} />
    </div>
  );
}
