"use client";

import { useState, useTransition } from "react";
import MatchStatsUploader from "./MatchStatsUploader";
import { saveManualBoxScore } from "./saveManualBoxScore";

type Player = { id: string, firstName: string, lastName: string, teamId: string, jerseyNumber: number | null };
type StatEntry = { playerId: string, teamId: string, points: number, rebounds: number, assists: number, blocks: number, steals: number };

export default function BoxScoreManager({
  matchId,
  homeTeam,
  awayTeam,
  roster,
  existingStats
}: {
  matchId: string;
  homeTeam: { id: string, name: string | null };
  awayTeam: { id: string, name: string | null };
  roster: Player[];
  existingStats: any[];
}) {
  const [tab, setTab] = useState<"manual" | "csv">("manual");
  const [isPending, startTransition] = useTransition();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize state map for every player on roster
  const [statsMap, setStatsMap] = useState<Record<string, StatEntry>>(() => {
     const init: Record<string, StatEntry> = {};
     roster.forEach(p => {
         const es = existingStats.find(s => s.playerId === p.id);
         init[p.id] = {
             playerId: p.id,
             teamId: p.teamId,
             points: es?.points ?? 0,
             rebounds: (es?.defensiveRebounds ?? 0) + (es?.offensiveRebounds ?? 0), // combine for display
             assists: es?.assists ?? 0,
             blocks: es?.blocks ?? 0,
             steals: es?.steals ?? 0,
         };
     });
     return init;
  });

  const handleUpdate = (playerId: string, field: keyof StatEntry, value: string) => {
      setStatsMap(prev => ({
          ...prev,
          [playerId]: { ...prev[playerId], [field]: parseInt(value) || 0 }
      }));
  };

  const handleSaveAll = () => {
      setSuccessMsg(null);
      setErrorMsg(null);
      const rowsToSave = Object.values(statsMap);
      startTransition(async () => {
          const res = await saveManualBoxScore(matchId, rowsToSave);
          if (res.success) {
              setSuccessMsg(`Saved ${res.count} player stat rows to the database.`);
              setTimeout(() => setSuccessMsg(null), 5000);
          } else {
              setErrorMsg(res.error || "Save failed — check console for details.");
          }
      });
  };

  const homePlayers = roster.filter(p => p.teamId === homeTeam.id);
  const awayPlayers = roster.filter(p => p.teamId === awayTeam.id);

  const renderTeamTable = (teamName: string | null, players: Player[]) => (
      <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--brand-primary)' }}>{teamName} Roster</h3>
          <div style={{ overflowX: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--surface-hover)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <tr>
                          <th style={{ padding: '12px' }}>Player</th>
                          <th style={{ padding: '12px', width: '80px' }}>PTS</th>
                          <th style={{ padding: '12px', width: '80px' }}>REB</th>
                          <th style={{ padding: '12px', width: '80px' }}>AST</th>
                          <th style={{ padding: '12px', width: '80px' }}>BLK</th>
                          <th style={{ padding: '12px', width: '80px' }}>STL</th>
                      </tr>
                  </thead>
                  <tbody>
                      {players.map(p => {
                          const state = statsMap[p.id];
                          return (
                              <tr key={p.id} style={{ borderTop: '1px solid var(--border-light)' }}>
                                  <td style={{ padding: '12px', fontSize: '0.9rem' }}>
                                     <strong style={{ color: 'white' }}>{p.firstName} {p.lastName}</strong>
                                     <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>#{p.jerseyNumber}</span>
                                  </td>
                                  <td style={{ padding: '8px' }}>
                                      <input type="number" value={state.points || ''} onChange={e => handleUpdate(p.id, 'points', e.target.value)} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-light)', color: 'white', borderRadius: '4px' }} />
                                  </td>
                                  <td style={{ padding: '8px' }}>
                                      <input type="number" value={state.rebounds || ''} onChange={e => handleUpdate(p.id, 'rebounds', e.target.value)} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-light)', color: 'white', borderRadius: '4px' }} />
                                  </td>
                                  <td style={{ padding: '8px' }}>
                                      <input type="number" value={state.assists || ''} onChange={e => handleUpdate(p.id, 'assists', e.target.value)} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-light)', color: 'white', borderRadius: '4px' }} />
                                  </td>
                                  <td style={{ padding: '8px' }}>
                                      <input type="number" value={state.blocks || ''} onChange={e => handleUpdate(p.id, 'blocks', e.target.value)} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-light)', color: 'white', borderRadius: '4px' }} />
                                  </td>
                                  <td style={{ padding: '8px' }}>
                                      <input type="number" value={state.steals || ''} onChange={e => handleUpdate(p.id, 'steals', e.target.value)} style={{ width: '100%', padding: '6px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-light)', color: 'white', borderRadius: '4px' }} />
                                  </td>
                              </tr>
                          );
                      })}
                      {players.length === 0 && (
                          <tr><td colSpan={6} style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)' }}>No players found on this roster.</td></tr>
                      )}
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-light)', paddingBottom: '16px' }}>
        <button 
          onClick={() => setTab("manual")}
          style={{ background: 'none', border: 'none', color: tab === "manual" ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: tab === "manual" ? 600 : 400, cursor: 'pointer', fontSize: '1.1rem' }}
        >
          Manual Box Score Input
        </button>
        <button 
          onClick={() => setTab("csv")}
          style={{ background: 'none', border: 'none', color: tab === "csv" ? 'var(--brand-primary)' : 'var(--text-secondary)', fontWeight: tab === "csv" ? 600 : 400, cursor: 'pointer', fontSize: '1.1rem' }}
        >
          Bulk CSV Tool
        </button>
      </div>

      {tab === "csv" ? (
         <MatchStatsUploader matchId={matchId} homeTeamId={homeTeam.id} awayTeamId={awayTeam.id} />
      ) : (
         <div>
            {errorMsg && <div style={{ color: '#ff3333', marginBottom: '16px', padding: '10px', background: 'rgba(255,51,51,0.1)', borderRadius: '4px' }}>{errorMsg}</div>}
            {successMsg && <div style={{ color: 'var(--brand-cyan)', marginBottom: '16px', padding: '10px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '4px' }}>{successMsg}</div>}
            
            {renderTeamTable(homeTeam.name, homePlayers)}
            {renderTeamTable(awayTeam.name, awayPlayers)}
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
               <button onClick={handleSaveAll} disabled={isPending} className="primary-btn" style={{ padding: '12px 32px' }}>
                   {isPending ? "Syncing Grid..." : "Save Box Score to Database"}
               </button>
            </div>
         </div>
      )}
    </div>
  );
}
