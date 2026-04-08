import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Flame, Target, Dumbbell, Zap, CalendarDays } from "lucide-react";
import PublicNav from "@/components/PublicNav";
import { fetchPublicPlayerProfile } from "@/lib/public-profile-data";

function formatMatchDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await fetchPublicPlayerProfile(id);

  if (!profile) {
    return { title: "Player not found — Liga Carolina" };
  }

  return {
    title: `${profile.player.firstName} ${profile.player.lastName} — Player Profile | Liga Carolina`,
    description: `Player stats and recent performances for ${profile.player.firstName} ${profile.player.lastName}.`,
  };
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: playerId } = await params;
  const profile = await fetchPublicPlayerProfile(playerId);

  if (!profile) notFound();

  const { player, totals, recentPerformances } = profile;
  const teamAccent = player.teamColor || "var(--brand-primary)";
  const displayName = `${player.firstName} ${player.lastName}`;

  const statCards = [
    { label: "Points", value: totals.points, icon: Flame, color: "#ff4d4d" },
    { label: "Assists", value: totals.assists, icon: Target, color: "#2ba32b" },
    { label: "Rebounds", value: totals.rebounds, icon: Dumbbell, color: "#4d94ff" },
    { label: "Steals", value: totals.steals, icon: Zap, color: "#ffb700" },
  ];
  const ppg = totals.gamesPlayed > 0 ? totals.ppg ?? totals.points / totals.gamesPlayed : 0;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <PublicNav />

      <div style={{ marginBottom: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <Link href="/leaders" style={{ color: "var(--text-secondary)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ChevronLeft size={16} />
          Back to Leaders
        </Link>
        <span style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-muted)" }}>
          Public Player Profile
        </span>
      </div>

      <section className="glass-panel" style={{ overflow: "hidden", marginBottom: 32 }}>
        <div style={{ height: 8, background: teamAccent }} />
        <div style={{ padding: 32, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 104, height: 104, borderRadius: "24px", background: "var(--surface-hover)", border: `2px solid ${teamAccent}`, display: "grid", placeItems: "center", color: teamAccent, fontSize: 30, fontWeight: 900 }}>
              #{player.jerseyNumber ?? "NA"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3.2rem)", lineHeight: 1.05 }}>
                  {displayName}
                </h1>
                {player.position && (
                  <span className="badge" style={{ background: "var(--surface-hover)", color: "var(--text-secondary)", border: "1px solid var(--border-light)" }}>
                    {player.position}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", color: "var(--text-secondary)", fontSize: "0.95rem", alignItems: "center" }}>
                {player.teamId ? (
                  <Link href={`/teams/${player.teamId}`} style={{ color: teamAccent, textDecoration: "none", fontWeight: 700 }}>
                    {player.teamName || "Unassigned Team"}
                  </Link>
                ) : (
                  <span style={{ fontWeight: 700, color: teamAccent }}>{player.teamName || "Unassigned Team"}</span>
                )}
                <span>•</span>
                <span>{player.division || "Division TBD"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
            {statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ padding: 18, borderRadius: 16, background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                  <Icon size={14} color={color} />
                  {label}
                </div>
                <div style={{ fontSize: "2rem", fontWeight: 900 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 0.95fr)", gap: 24, alignItems: "start" }}>
        <section className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Player Info</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>Current roster details from the live database.</p>
          </div>

          <div style={{ padding: 24, display: "grid", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
              <InfoCard label="Name" value={displayName} />
              <InfoCard label="Jersey" value={player.jerseyNumber != null ? `#${player.jerseyNumber}` : "Unassigned"} />
              <InfoCard label="Team" value={player.teamName || "Unassigned"} />
            </div>

            <div style={{ padding: 18, borderRadius: 16, background: "var(--surface-base)", border: "1px solid var(--border-light)" }}>
              <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Season Totals</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(90px, 1fr))", gap: 12 }}>
                <MiniStat label="PTS" value={totals.points} />
                <MiniStat label="AST" value={totals.assists} />
                <MiniStat label="REB" value={totals.rebounds} />
                <MiniStat label="STL" value={totals.steals} />
                <MiniStat label="PPG" value={totals.gamesPlayed > 0 ? ppg.toFixed(1) : "—"} />
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel" style={{ overflow: "hidden" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)" }}>
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Recent Performance</h2>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)", fontSize: "0.9rem" }}>Latest games and box score impact.</p>
          </div>

          <div style={{ display: "grid", gap: 12, padding: 20 }}>
            {recentPerformances.length === 0 ? (
              <div style={{ padding: 24, textAlign: "center", color: "var(--text-muted)" }}>No game logs have been recorded for this player yet.</div>
            ) : (
              recentPerformances.map((performance) => {
                const result = performance.result ?? "T";
                const resultColor = result === "W" ? "#2ba32b" : result === "L" ? "#ff4d4d" : "var(--text-muted)";
                const opponentName = performance.opponentName || "Opponent";

                return (
                  <Link
                    key={performance.matchId}
                    href={`/matches/${performance.matchId}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      borderRadius: 16,
                      padding: 16,
                      background: "var(--surface-base)",
                      border: "1px solid var(--border-light)",
                      display: "grid",
                      gap: 10,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <span className="badge" style={{ background: result === "W" ? "rgba(43,163,43,0.10)" : result === "L" ? "rgba(255,77,77,0.10)" : "var(--surface-hover)", color: resultColor, border: `1px solid ${resultColor}33` }}>
                        {result}
                      </span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                        <CalendarDays size={12} style={{ display: "inline", marginRight: 6, verticalAlign: "-1px" }} />
                        {formatMatchDate(performance.matchDate)}
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{opponentName}</div>
                        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{performance.status || "Completed"}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(70px, 1fr))", gap: 10, width: "100%", flex: 1, minWidth: 0, textAlign: "center" }}>
                        <MiniStat label="PTS" value={performance.points} compact />
                        <MiniStat label="AST" value={performance.assists} compact />
                        <MiniStat label="REB" value={performance.rebounds} compact />
                        <MiniStat label="STL" value={performance.steals} compact />
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

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: 16, borderRadius: 16, background: "var(--surface-base)", border: "1px solid var(--border-light)" }}>
      <div style={{ color: "var(--text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>{value}</div>
    </div>
  );
}

function MiniStat({ label, value, compact = false }: { label: string; value: number | string; compact?: boolean }) {
  return (
    <div style={{ padding: compact ? 10 : 14, borderRadius: 14, background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>
      <div style={{ fontSize: compact ? 10 : 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: compact ? "1rem" : "1.35rem", fontWeight: 900, lineHeight: 1 }}>{value}</div>
    </div>
  );
}
