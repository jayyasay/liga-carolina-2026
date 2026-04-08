import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, TrendingUp, TrendingDown, Users, Trophy } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { fetchPublicTeamProfile } from "@/lib/public-profile-data";

function formatMatchDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function getTeamResult(
  match: {
    homeTeamId: string | null;
    awayTeamId: string | null;
    homeScore: number | null;
    awayScore: number | null;
  },
  teamId: string
) {
  const isHome = match.homeTeamId === teamId;
  const teamScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
  const opponentScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
  if (teamScore > opponentScore) return "W";
  if (teamScore < opponentScore) return "L";
  return "T";
}

function getTeamBadge(teamName: string, shortName: string | null) {
  const trimmed = shortName?.trim();
  if (trimmed) return trimmed.slice(0, 3).toUpperCase();
  return teamName
    .split(/\s+/)
    .map(part => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 3)
    .toUpperCase() || teamName.slice(0, 3).toUpperCase();
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await fetchPublicTeamProfile(id);

  if (!profile) {
    return { title: "Team not found — Liga Carolina" };
  }

  return {
    title: `${profile.team.name} — Team Profile | Liga Carolina`,
    description: `Roster, recent matches, and record for ${profile.team.name}.`,
  };
}

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = await params;
  const profile = await fetchPublicTeamProfile(teamId);

  if (!profile) notFound();

  const { team, roster, record, recentMatches } = profile;

  const trimmedShortName = team.shortName?.trim() || "";
  const initials = getTeamBadge(team.name, team.shortName);
  const teamAccent = team.primaryColor || "var(--brand-primary)";

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <PublicNav />

      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Link href="/standings" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ChevronLeft size={16} />
          Back to Standings
        </Link>
        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Public Team Profile
        </span>
      </div>

      <section className="glass-panel" style={{ overflow: "hidden", marginBottom: 32 }}>
        <div style={{ height: 8, background: teamAccent }} />
        <div style={{ padding: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 104, height: 104, borderRadius: "24px", background: "var(--surface-hover)", border: `2px solid ${teamAccent}`, display: "grid", placeItems: "center", color: teamAccent, fontSize: 32, fontWeight: 900, letterSpacing: "0.08em" }}>
              {initials}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.05 }}>
                  {team.name}
                </h1>
                {trimmedShortName && (
                  <span className="badge" style={{ background: "var(--surface-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                    {trimmedShortName}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                <span>{team.division}</span>
                <span>•</span>
                <span>{roster.length} players</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            <div style={{ padding: 18, borderRadius: 16, background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                <Trophy size={14} />
                Record
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900 }}>{record.wins}-{record.losses}</div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                <TrendingUp size={14} />
                Win %
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900 }}>{record.winPct}</div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                <Users size={14} />
                Games
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900 }}>{record.gamesPlayed}</div>
            </div>
            <div style={{ padding: 18, borderRadius: 16, background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                <TrendingDown size={14} />
                Losses
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 900 }}>{record.losses}</div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
        <section className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Full Roster</h2>
              <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>Click a player to view their profile.</p>
            </div>
            <span className="badge" style={{ background: "var(--surface-hover)", color: "var(--text-muted)", border: "1px solid var(--border-light)" }}>
              {roster.length}
            </span>
          </div>

          <div style={{ display: "grid", gap: 10, padding: 20 }}>
            {roster.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>No players are registered for this team yet.</div>
            ) : (
              roster.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "var(--surface-base)",
                    border: "1px solid var(--border-light)",
                    display: "grid",
                    gridTemplateColumns: "auto minmax(0, 1fr) auto",
                    gap: 14,
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 999, background: teamAccent, color: "white", display: "grid", placeItems: "center", fontWeight: 900 }}>
                    {player.jerseyNumber != null ? `#${player.jerseyNumber}` : "NA"}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                      {player.firstName} {player.lastName}
                    </div>
                    {player.position && (
                      <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                        {player.position}
                      </div>
                    )}
                  </div>
                  <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>View</span>
                </Link>
              ))
            )}
          </div>
        </section>

        <section className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Recent Matches</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>Latest completed games and outcomes.</p>
          </div>

          <div style={{ display: "grid", gap: 12, padding: 20 }}>
            {recentMatches.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>No completed matches are available yet.</div>
            ) : (
              recentMatches.map((match) => {
                const result = getTeamResult(match, team.id);
                const isHome = match.homeTeamId === team.id;
                const opponentName = isHome ? match.awayTeamName : match.homeTeamName;
                const opponentColor = isHome ? match.awayTeamColor : match.homeTeamColor;

                return (
                  <Link
                    key={match.id}
                    href={`/matches/${match.id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      padding: 16,
                      borderRadius: 16,
                      background: "var(--surface-base)",
                      border: "1px solid var(--border-light)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <span className="badge" style={{ background: result === "W" ? "rgba(43,163,43,0.12)" : result === "L" ? "rgba(255,77,77,0.12)" : "var(--surface-hover)", color: result === "W" ? "#2ba32b" : result === "L" ? "#ff4d4d" : "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                          {result}
                        </span>
                        <div style={{ fontWeight: 700 }}>{formatMatchDate(match.matchDate)}</div>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{match.status}</span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 999, background: opponentColor || "var(--text-muted)", flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {opponentName}
                        </span>
                      </div>
                      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-primary)" }}>
                        {isHome ? match.homeScore : match.awayScore}
                        <span style={{ color: "var(--text-muted)", margin: "0 6px" }}>-</span>
                        {isHome ? match.awayScore : match.homeScore}
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </section>
      </div>

    </div>
  );
}
