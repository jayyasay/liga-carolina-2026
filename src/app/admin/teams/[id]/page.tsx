import { db } from "@/db";
import { teams, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import TeamDetailManager from "./TeamDetailManager";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function TeamDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminSession();

  const resolvedParams = await params;
  const teamId = resolvedParams.id;
  
  const teamResult = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  const team = teamResult[0];

  if (!team) notFound();

  const roster = await db.select().from(players).where(eq(players.teamId, teamId));

  return (
    <div style={{ maxWidth: "900px", paddingBottom: "60px" }}>
      <div style={{ marginBottom: "32px" }}>
        <Link href="/admin/teams" style={{ color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          &larr; Back to Teams
        </Link>
      </div>

      {/* Team Header */}
      <div className="glass-panel" style={{ padding: "40px", marginBottom: "40px", display: "flex", alignItems: "center", gap: "30px", borderTop: `4px solid ${team.primaryColor || "var(--brand-primary)"}` }}>
        <div style={{ fontSize: "3rem", background: "var(--surface-hover)", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: `4px solid ${team.primaryColor || "var(--brand-primary)"}` }}>
          {team.shortName.charAt(0)}
        </div>
        <div>
          <h1 style={{ fontSize: "2.5rem", margin: "0 0 8px 0", display: "flex", alignItems: "center", gap: "16px" }}>
            {team.name}
            <span style={{ fontSize: "1.1rem", padding: "4px 12px", background: "var(--surface-hover)", borderRadius: "var(--border-radius-sm)", color: "var(--text-muted)" }}>
              {team.shortName}
            </span>
          </h1>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <span className="badge" style={{ background: "var(--surface-hover)", border: "1px solid var(--border-light)" }}>{team.division}</span>
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{roster.length} players on roster</span>
          </div>
        </div>
      </div>

      {/* Interactive Manager */}
      <TeamDetailManager
        team={{ id: team.id, name: team.name, shortName: team.shortName, primaryColor: team.primaryColor, division: team.division || "Open Seniors Division" }}
        roster={roster.map(p => ({ id: p.id, firstName: p.firstName, lastName: p.lastName, jerseyNumber: p.jerseyNumber, position: p.position }))}
      />
    </div>
  );
}
