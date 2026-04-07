import Link from 'next/link';

export default async function TeamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const teamId = resolvedParams.id;
  
  // Static mockup data based on previous setup
  const team = {
    id: teamId,
    name: teamId === 't6' ? 'Lakers' : 'Warriors',
    short_name: teamId === 't6' ? 'LAL' : 'GSW',
    logo: teamId === 't6' ? '⭐️' : '🏀',
    primary_color: teamId === 't6' ? '#FDB927' : '#006BB6',
    roster: teamId === 't6' ? [
      { name: "L. James", jersey: 23, pos: "SF" },
      { name: "A. Davis", jersey: 3, pos: "C" },
      { name: "D. Russell", jersey: 1, pos: "PG" },
      { name: "A. Reaves", jersey: 15, pos: "SG" },
      { name: "R. Hachimura", jersey: 28, pos: "PF" },
      { name: "J. Hayes", jersey: 11, pos: "C" },
      { name: "S. Dinwiddie", jersey: 26, pos: "PG" },
    ] : [
      { name: "S. Curry", jersey: 30, pos: "PG" },
      { name: "K. Thompson", jersey: 11, pos: "SG" },
      { name: "A. Wiggins", jersey: 22, pos: "SF" },
      { name: "D. Green", jersey: 23, pos: "PF" },
      { name: "K. Looney", jersey: 5, pos: "C" },
      { name: "J. Kuminga", jersey: 0, pos: "PF" },
      { name: "B. Podziemski", jersey: 2, pos: "SG" },
    ]
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Return Navigation */}
      <div style={{ marginBottom: '32px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          &larr; Back to Matches
        </Link>
      </div>

      {/* Team Header */}
      <div className="glass-panel" style={{ padding: '40px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '30px' }}>
        <div style={{ fontSize: '5rem', background: 'var(--surface-hover)', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: `4px solid ${team.primary_color}` }}>
          {team.logo}
        </div>
        <div>
          <h1 style={{ fontSize: '3rem', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            {team.name}
            <span style={{ fontSize: '1.2rem', padding: '4px 12px', background: 'var(--surface-hover)', borderRadius: 'var(--border-radius-sm)', color: 'var(--text-muted)' }}>
              {team.short_name}
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '1.1rem' }}>Active Roster</p>
        </div>
      </div>

      {/* Roster Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--brand-primary)' }}>Team Players</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '80px', textAlign: 'center' }}>Jersey</th>
                <th>Player Name</th>
                <th>Pos</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {team.roster.sort((a, b) => a.jersey - b.jersey).map((player) => (
                <tr key={player.name}>
                  <td style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--brand-cyan)' }}>
                    #{player.jersey}
                  </td>
                  <td style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                    {player.name}
                  </td>
                  <td>{player.pos}</td>
                  <td style={{ textAlign: 'right' }}>
                     <span className="badge badge-completed" style={{ background: 'rgba(107, 201, 38, 0.15)', color: 'var(--brand-cyan)', border: 'none' }}>Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
