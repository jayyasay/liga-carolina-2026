import { db } from "@/db";
import { teams } from "@/db/schema";
import CreateTeamForm from "./CreateTeamForm";
import DeleteTeamButton from "./DeleteTeamButton";
import { count, desc } from "drizzle-orm";
import Link from "next/link";
import { requireAdminSession } from "@/lib/admin-auth";
import Pagination from "@/components/Pagination";

const PAGE_SIZE = 20;

export default async function AdminTeamsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  await requireAdminSession();

  const { page: pageParam } = await searchParams;
  const requestedPage = Number.parseInt(pageParam || "1", 10);
  const totalTeamsResult = await db.select({ count: count() }).from(teams);
  const totalTeams = Number(totalTeamsResult[0]?.count ?? 0);
  const totalPages = Math.max(1, Math.ceil(totalTeams / PAGE_SIZE));
  const currentPage = Number.isFinite(requestedPage) ? Math.min(Math.max(1, requestedPage), totalPages) : 1;

  const allTeams = totalTeams === 0
    ? []
    : await db.select().from(teams).orderBy(desc(teams.createdAt)).limit(PAGE_SIZE).offset((currentPage - 1) * PAGE_SIZE);

  const startItem = totalTeams === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, totalTeams);

  return (
    <div style={{ maxWidth: '800px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', letterSpacing: '-0.02em' }} className="brand-gradient">
        Teams &amp; Rosters
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Manage league teams directly in the database.
      </p>

      {/* Embed the Client Form Component */}
      <CreateTeamForm />

      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Registered Teams ({totalTeams})</h2>
      
      {totalTeams === 0 ? (
        <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No teams registered yet. Add one above.
        </div>
      ) : (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: 'var(--surface-hover)', textAlign: 'left' }}>
              <tr>
                <th style={{ padding: '16px' }}>Team Name</th>
                <th style={{ padding: '16px' }}>Short Name</th>
                <th style={{ padding: '16px' }}>Color</th>
                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allTeams.map((team) => (
                <tr key={team.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>
                    <Link href={`/admin/teams/${team.id}`} style={{ color: 'var(--brand-primary)', textDecoration: 'none' }} className="hover-underline">
                      {team.name}
                    </Link>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {team.shortName?.trim() || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>—</span>}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '16px', height: '16px', 
                        borderRadius: '50%', 
                        background: team.primaryColor || '#000' 
                      }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {team.primaryColor}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <DeleteTeamButton id={team.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
        <div style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          {totalTeams > 0 ? `Showing ${startItem}-${endItem} of ${totalTeams}` : "No teams to paginate."}
        </div>
        <Pagination basePath="/admin/teams" page={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
