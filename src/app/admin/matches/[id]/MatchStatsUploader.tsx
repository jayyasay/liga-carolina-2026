"use client";

import { useState, useTransition } from "react";
import { uploadMatchStats } from "./actions";

export default function MatchStatsUploader({ matchId, homeTeamId, awayTeamId }: { matchId: string, homeTeamId: string, awayTeamId: string }) {
  const [csvData, setCsvData] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpload = () => {
    setError(null); setSuccess(null);
    if (!csvData) {
      setError("Please paste the CSV data first.");
      return;
    }

    startTransition(async () => {
       const result = await uploadMatchStats(matchId, homeTeamId, awayTeamId, csvData);
       if (result.success) {
           setSuccess(`Success! Uploaded ${result.count} player stat rows securely mapped to this match.`);
           setCsvData("");
       } else {
           setError(result.error || "Unknown Upload Error");
       }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Attach Player Stats</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          Stats injected here will be explicitly locked to this match record.
          Ensure names map to rosters.
        </p>
      </div>

      {error && <div style={{ color: '#ff3333', marginBottom: '16px', padding: '10px', background: 'rgba(255,51,51,0.1)', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: 'var(--brand-cyan)', marginBottom: '16px', padding: '10px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '4px' }}>{success}</div>}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>CSV Data Payload</label>
          <span style={{ color: 'var(--brand-primary)', fontSize: '0.85rem' }}>Format: Name, PTS, REB, AST, BLK, STL (BLK/STL optional)</span>
        </div>
        <textarea
          rows={8}
          placeholder={"Name, PTS, REB, AST, BLK, STL\nLeBron James, 28, 8, 11, 1, 2\nAnthony Davis, 24, 14, 3, 4, 1"}
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          style={{ width: '100%', padding: '16px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.3)', color: 'white', fontFamily: 'monospace', fontSize: '0.9rem', resize: 'vertical' }}
        />
      </div>

      <button onClick={handleUpload} disabled={isPending} className="primary-btn" style={{ width: '100%', padding: '12px' }}>
        {isPending ? "Parsing..." : "Upload Statistics to Database"}
      </button>
    </div>
  );
}
