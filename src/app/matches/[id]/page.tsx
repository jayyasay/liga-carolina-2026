import { db } from "@/db";
import { matches, teams, players, playerMatchStats } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import Link from "next/link";
import { notFound } from "next/navigation";
import MatchShareButton from "@/components/MatchShareButton";
import { Trophy, ChevronLeft, Award } from "lucide-react";

export default async function PublicMatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: matchId } = await params;

  const homeTeams = alias(teams, "homeTeams");
  const awayTeams = alias(teams, "awayTeams");
  const potgPlayers = alias(players, "potgPlayers");

  const results = await db
    .select({
      id: matches.id,
      matchDate: matches.matchDate,
      venue: matches.venue,
      status: matches.status,
      homeScore: matches.homeScore,
      awayScore: matches.awayScore,
      homeTeamId: matches.homeTeamId,
      awayTeamId: matches.awayTeamId,
      homeTeamName: homeTeams.name,
      awayTeamName: awayTeams.name,
      homeTeamColor: homeTeams.primaryColor,
      awayTeamColor: awayTeams.primaryColor,
      homeTeamShort: homeTeams.shortName,
      awayTeamShort: awayTeams.shortName,
      playerOfTheGameId: matches.playerOfTheGameId,
      potgFirstName: potgPlayers.firstName,
      potgLastName: potgPlayers.lastName,
      potgJersey: potgPlayers.jerseyNumber,
      potgPosition: potgPlayers.position,
      potgTeamId: potgPlayers.teamId,
    })
    .from(matches)
    .leftJoin(homeTeams, eq(matches.homeTeamId, homeTeams.id))
    .leftJoin(awayTeams, eq(matches.awayTeamId, awayTeams.id))
    .leftJoin(potgPlayers, eq(matches.playerOfTheGameId, potgPlayers.id))
    .where(eq(matches.id, matchId))
    .limit(1);

  const match = results[0];
  if (!match || !match.homeTeamId || !match.awayTeamId) notFound();

  // Always fetch rosters for both teams
  const roster = await db
    .select({
      id: players.id,
      firstName: players.firstName,
      lastName: players.lastName,
      jerseyNumber: players.jerseyNumber,
      position: players.position,
      teamId: players.teamId,
    })
    .from(players)
    .where(or(eq(players.teamId, match.homeTeamId), eq(players.teamId, match.awayTeamId)));

  // Fetch stats if any
  const stats = await db
    .select({
      playerId: playerMatchStats.playerId,
      teamId: playerMatchStats.teamId,
      points: playerMatchStats.points,
      assists: playerMatchStats.assists,
      steals: playerMatchStats.steals,
      blocks: playerMatchStats.blocks,
      offensiveRebounds: playerMatchStats.offensiveRebounds,
      defensiveRebounds: playerMatchStats.defensiveRebounds,
    })
    .from(playerMatchStats)
    .where(eq(playerMatchStats.matchId, matchId));

  const hasStats = stats.length > 0;

  // Build a stat lookup map
  const statsMap = new Map(stats.map(s => [s.playerId, s]));

  const statusBadgeClass = match.status === 'LIVE' ? 'badge-live' : match.status === 'COMPLETED' ? 'badge-completed' : '';
  const statusLabel = match.status === 'COMPLETED' ? 'FINAL' : match.status;

  // Determine which team the POTG belongs to
  const potgTeamName = match.potgTeamId === match.homeTeamId
    ? match.homeTeamName
    : match.potgTeamId === match.awayTeamId
    ? match.awayTeamName
    : null;

  const renderTeamSection = (teamId: string, teamName: string | null, teamColor: string | null) => {
    const teamPlayers = roster
      .filter(p => p.teamId === teamId)
      .sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999));

    return (
      <div className="glass-panel" style={{ overflow: "hidden", marginBottom: "32px" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "14px", height: "14px", borderRadius: "50%", background: teamColor || "var(--text-muted)", flexShrink: 0 }}></div>
          <h3 style={{ margin: 0, fontSize: "1.2rem" }}>{teamName}</h3>
          <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "0.85rem" }}>{teamPlayers.length} players</span>
        </div>

        {teamPlayers.length === 0 ? (
          <div style={{ padding: "32px", textAlign: "center", color: "var(--text-secondary)" }}>No players registered for this team.</div>
        ) : (
          <div className="table-container" style={{ marginBottom: 0 }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "var(--surface-hover)", textAlign: "left", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                <tr>
                  <th style={{ padding: "12px 16px", width: "60px", textAlign: "center" }}>#</th>
                  <th style={{ padding: "12px 16px" }}>Player</th>
                  <th style={{ padding: "12px 16px", width: "50px" }}>Pos</th>
                  {hasStats && <>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>PTS</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>REB</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>AST</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>STL</th>
                    <th style={{ padding: "12px 16px", textAlign: "center" }}>BLK</th>
                  </>}
                </tr>
              </thead>
              <tbody>
                {teamPlayers.map(p => {
                  const s = statsMap.get(p.id);
                  const isHero = p.id === match.playerOfTheGameId;
                  const totalReb = (s?.offensiveRebounds ?? 0) + (s?.defensiveRebounds ?? 0);
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--border-light)", background: isHero ? "rgba(255,183,0,0.06)" : undefined }}>
                      <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--brand-cyan)", fontWeight: "bold" }}>
                        {p.jerseyNumber != null ? `#${p.jerseyNumber}` : "--"}
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {p.firstName} {p.lastName}
                          {isHero && (
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "0.7rem", color: "#ffb700", background: "rgba(255,183,0,0.15)", border: "1px solid rgba(255,183,0,0.3)", padding: "2px 8px", borderRadius: "10px", fontWeight: 700 }}>
                              <Award size={10} />
                              MVP
                            </span>
                          )}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{p.position || "--"}</td>
                      {hasStats && <>
                        <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: s?.points ? "bold" : "normal", color: s?.points ? "var(--brand-primary)" : "var(--text-muted)", fontSize: s?.points ? "1.05rem" : "1rem" }}>{s?.points ?? 0}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-secondary)" }}>{totalReb}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-secondary)" }}>{s?.assists ?? 0}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-secondary)" }}>{s?.steals ?? 0}</td>
                        <td style={{ padding: "12px 16px", textAlign: "center", color: "var(--text-secondary)" }}>{s?.blocks ?? 0}</td>
                      </>}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!hasStats && match.status === 'COMPLETED' && (
          <div style={{ padding: "12px 24px", background: "rgba(0,0,0,0.15)", borderTop: "1px solid var(--border-light)", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
            Stats have not been recorded for this match yet.
          </div>
        )}
      </div>
    );
  };

  // ── Stats Leaders Calculation ──
  const getLeader = (key: 'points' | 'assists' | 'steals' | 'rebounds') => {
    if (!hasStats) return null;
    let topVal = -1;
    let leaderId: string | null = null;

    stats.forEach(s => {
      const val = key === 'rebounds' ? (s.offensiveRebounds ?? 0) + (s.defensiveRebounds ?? 0) : (s[key] ?? 0);
      if (val > topVal) {
        topVal = val;
        leaderId = s.playerId;
      }
    });

    if (!leaderId || topVal <= 0) return null;
    const player = roster.find(p => p.id === leaderId);
    return player ? { name: `${player.firstName} ${player.lastName}`, value: topVal } : null;
  };

  const highlights = {
    points: getLeader('points'),
    rebounds: getLeader('rebounds'),
    assists: getLeader('assists'),
    steals: getLeader('steals'),
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link href="/" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
          <ChevronLeft size={16} />
          Back to Matches
        </Link>
        <MatchShareButton
          homeTeam={match.homeTeamName || ""}
          awayTeam={match.awayTeamName || ""}
          homeScore={match.homeScore}
          awayScore={match.awayScore}
          homeColor={match.homeTeamColor}
          awayColor={match.awayTeamColor}
          status={match.status}
          division={null}
          matchDate={match.matchDate.toLocaleDateString()}
          potgName={match.potgFirstName ? `${match.potgFirstName} ${match.potgLastName}` : null}
          potgJersey={match.potgJersey}
          highlights={highlights}
        />
      </div>

      {/* Scoreboard */}
      <div className="glass-panel scoreboard-header" style={{ padding: "40px", marginBottom: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className={`badge ${statusBadgeClass}`} style={{ marginBottom: "20px", ...(match.status === "SCHEDULED" && { background: "var(--surface-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }) }}>
          {statusLabel}
        </span>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "40px", width: "100%", maxWidth: "800px" }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: match.homeTeamColor || "var(--surface-hover)", margin: "0 auto 16px auto", border: "3px solid var(--border-light)" }}></div>
            <h2 style={{ fontSize: "1.8rem", margin: 0 }}>{match.homeTeamName}</h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>{match.homeTeamShort}</div>
          </div>

          <div style={{ textAlign: "center" }} className="scoreboard-middle">
            {match.status !== "SCHEDULED" ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px", justifyContent: "center" }}>
                <span className="scoreboard-score" style={{ fontSize: "4rem", fontWeight: 900, color: match.homeScore! >= match.awayScore! ? "var(--text-primary)" : "var(--text-muted)" }}>{match.homeScore}</span>
                <span style={{ fontSize: "2rem", color: "var(--text-muted)" }}>—</span>
                <span className="scoreboard-score" style={{ fontSize: "4rem", fontWeight: 900, color: match.awayScore! >= match.homeScore! ? "var(--text-primary)" : "var(--text-muted)" }}>{match.awayScore}</span>
              </div>
            ) : (
              <div style={{ fontSize: "2rem", color: "var(--text-muted)", padding: "0 24px" }}>VS</div>
            )}
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "12px" }}>
              {match.matchDate.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: match.awayTeamColor || "var(--surface-hover)", margin: "0 auto 16px auto", border: "3px solid var(--border-light)" }}></div>
            <h2 style={{ fontSize: "1.8rem", margin: 0 }}>{match.awayTeamName}</h2>
            <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>{match.awayTeamShort}</div>
          </div>
        </div>
      </div>

      {/* Player of the Game section */}
      {match.potgFirstName && (
        <div className="glass-panel potg-banner" style={{ padding: "28px 32px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "28px", background: "linear-gradient(135deg, rgba(255,183,0,0.08), rgba(255,100,0,0.04))", borderColor: "rgba(255,183,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "center", minWidth: "60px" }}>
             <Trophy size={48} color="#ffb700" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#ffb700", marginBottom: "6px" }}>Player of the Game</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1, marginBottom: "4px" }}>
              {match.potgFirstName} {match.potgLastName}
              {match.potgJersey != null && <span style={{ color: "var(--text-muted)", fontWeight: 400, fontSize: "1.2rem", marginLeft: "10px" }}>#{match.potgJersey}</span>}
            </div>
            <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              {match.potgPosition && <span style={{ marginRight: "12px" }}>{match.potgPosition}</span>}
              {potgTeamName && <span>{potgTeamName}</span>}
            </div>
          </div>
          {/* POTG stats from statsMap */}
          {statsMap.has(match.playerOfTheGameId!) && (() => {
            const s = statsMap.get(match.playerOfTheGameId!)!;
            const reb = (s.offensiveRebounds ?? 0) + (s.defensiveRebounds ?? 0);
            return (
              <div style={{ display: "flex", gap: "24px", textAlign: "center" }} className="potg-stats">
                {[{ label: "PTS", value: s.points }, { label: "REB", value: reb }, { label: "AST", value: s.assists }].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontSize: "2rem", fontWeight: 900, color: "#ffb700" }}>{value ?? 0}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>{label}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Team Sections — always shown with full roster */}
      <div>
        {renderTeamSection(match.homeTeamId, match.homeTeamName, match.homeTeamColor)}
        {renderTeamSection(match.awayTeamId, match.awayTeamName, match.awayTeamColor)}
      </div>

    </div>
  );
}
