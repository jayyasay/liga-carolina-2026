import { db } from "@/db";
import { players, teams, playerMatchStats } from "@/db/schema";
import { eq, sum } from "drizzle-orm";
import Link from "next/link";
import PublicNav from "@/components/PublicNav";
import { 
  BarChart2, 
  Flame, 
  Dumbbell, 
  Target, 
  Zap, 
  Medal,
} from "lucide-react";

const DIVISIONS = ["Kids Camp", "Midgets", "Juniors", "Seniors", "Open Seniors Division"] as const;
type Division = typeof DIVISIONS[number];

const STAT_CATEGORIES = [
  { key: "points", label: "Points", col: "PTS", icon: Flame, color: "#ff4d4d" },
  { key: "rebounds", label: "Rebounds", col: "REB", icon: Dumbbell, color: "#4d94ff" },
  { key: "assists", label: "Assists", col: "AST", icon: Target, color: "#2ba32b" },
  { key: "steals", label: "Steals", col: "STL", icon: Zap, color: "#ffb700" },
] as const;

export const metadata = { title: "Top 10 Leaders — Liga Carolina" };

export default async function LeadersPage({ searchParams }: { searchParams: Promise<{ division?: string }> }) {
  const { division: selectedDiv } = await searchParams;
  const activeDiv: Division = selectedDiv && (DIVISIONS as readonly string[]).includes(selectedDiv)
    ? selectedDiv as Division
    : DIVISIONS[3]; // default Seniors

  // Aggregate per player: sum each stat across all matches
  const rawStats = await db
    .select({
      playerId: playerMatchStats.playerId,
      firstName: players.firstName,
      lastName: players.lastName,
      jerseyNumber: players.jerseyNumber,
      position: players.position,
      teamName: teams.name,
      teamColor: teams.primaryColor,
      division: teams.division,
      totalPoints: sum(playerMatchStats.points),
      totalAssists: sum(playerMatchStats.assists),
      totalSteals: sum(playerMatchStats.steals),
      totalOffReb: sum(playerMatchStats.offensiveRebounds),
      totalDefReb: sum(playerMatchStats.defensiveRebounds),
    })
    .from(playerMatchStats)
    .innerJoin(players, eq(playerMatchStats.playerId, players.id))
    .innerJoin(teams, eq(players.teamId, teams.id))
    .where(eq(teams.division, activeDiv))
    .groupBy(
      playerMatchStats.playerId,
      players.firstName,
      players.lastName,
      players.jerseyNumber,
      players.position,
      teams.name,
      teams.primaryColor,
      teams.division,
    );

  const divisionStats = rawStats
    .map(r => ({
      ...r,
      totalPoints: Number(r.totalPoints ?? 0),
      totalAssists: Number(r.totalAssists ?? 0),
      totalSteals: Number(r.totalSteals ?? 0),
      totalRebounds: Number(r.totalOffReb ?? 0) + Number(r.totalDefReb ?? 0),
    }));

  const top10 = (key: "totalPoints" | "totalAssists" | "totalSteals" | "totalRebounds") =>
    [...divisionStats].sort((a, b) => b[key] - a[key]).slice(0, 10);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 20px" }}>
      <PublicNav />

      {/* Division tabs */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "40px" }}>
        {DIVISIONS.map(div => (
          <Link
            key={div}
            href={`/leaders?division=${encodeURIComponent(div)}`}
            style={{
              padding: "8px 16px",
              borderRadius: "6px",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: activeDiv === div ? 700 : 400,
              background: activeDiv === div ? "var(--brand-primary)" : "var(--surface-base)",
              color: activeDiv === div ? "white" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: activeDiv === div ? "var(--brand-primary)" : "var(--border-light)",
              transition: "all 0.15s",
            }}
          >
            {div}
          </Link>
        ))}
      </div>

      {divisionStats.length === 0 ? (
        <div className="glass-panel" style={{ padding: "60px", textAlign: "center", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
             <BarChart2 size={48} opacity={0.3} />
          </div>
          <h3 style={{ marginBottom: "8px" }}>No stats yet for {activeDiv}</h3>
          <p>Stats will appear here after matches are completed and results are entered.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 520px), 1fr))", gap: "32px" }}>
          {STAT_CATEGORIES.map(cat => {
            const leaders = top10(cat.key === "rebounds" ? "totalRebounds" : cat.key === "points" ? "totalPoints" : cat.key === "assists" ? "totalAssists" : "totalSteals");
            const getValue = (r: typeof leaders[0]) =>
              cat.key === "rebounds" ? r.totalRebounds :
              cat.key === "points" ? r.totalPoints :
              cat.key === "assists" ? r.totalAssists :
              r.totalSteals;

            const Icon = cat.icon;

            return (
              <div key={cat.key} className="glass-panel" style={{ overflow: "hidden" }}>
                {/* Category Header */}
                <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-light)", display: "flex", alignItems: "center", gap: "12px", background: "var(--surface-hover)" }}>
                  <div style={{ padding: "8px", background: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                    <Icon size={20} color={cat.color} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--text-primary)" }}>{cat.label} Leaders</h3>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>{activeDiv} · Top 10</div>
                  </div>
                </div>

                {leaders.length === 0 ? (
                  <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                    No {cat.label.toLowerCase()} recorded yet.
                  </div>
                ) : (
                  <div className="table-container" style={{ marginBottom: 0 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ background: "var(--surface-hover)", fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          <th style={{ padding: "10px 16px", width: "40px", textAlign: "center" }}>Rank</th>
                          <th style={{ padding: "10px 16px" }}>Player</th>
                          <th style={{ padding: "10px 16px" }}>Team</th>
                          <th style={{ padding: "10px 16px", textAlign: "right", width: "70px" }}>{cat.col}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaders.map((player, idx) => {
                          const val = getValue(player);
                          const isFirst = idx === 0;
                          return (
                            <tr key={`${player.playerId}-${cat.key}`} style={{ borderTop: "1px solid var(--border-light)", background: isFirst ? "rgba(254,102,0,0.03)" : undefined }}>
                              <td style={{ padding: "12px 16px", textAlign: "center" }}>
                                {idx < 3 ? (
                                  <Medal size={idx === 0 ? 20 : 18} color={idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : "#CD7F32"} />
                                ) : (
                                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600 }}>#{idx + 1}</span>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                                  {player.firstName} {player.lastName}
                                  {player.jerseyNumber != null && (
                                    <span style={{ color: "var(--text-muted)", fontWeight: 400, marginLeft: "6px", fontSize: "0.8rem" }}>#{player.jerseyNumber}</span>
                                  )}
                                </div>
                                {player.position && (
                                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{player.position}</div>
                                )}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: player.teamColor || "var(--text-muted)", flexShrink: 0 }}></div>
                                  <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{player.teamName}</span>
                                </div>
                              </td>
                              <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                <span style={{ fontSize: isFirst ? "1.4rem" : "1.1rem", fontWeight: 900, color: isFirst ? "var(--brand-primary)" : "var(--text-primary)", fontFamily: "var(--font-display)" }}>
                                  {val}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
