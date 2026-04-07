"use client";

import { useTransition, useRef, useState } from "react";
import { updateMatchScore } from "../actions";

export default function ScoreController({ 
  matchId, 
  defaultHomeScore, 
  defaultAwayScore, 
  currentStatus 
}: { 
  matchId: string;
  defaultHomeScore: number | null;
  defaultAwayScore: number | null;
  currentStatus: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<boolean>(false);
  const homeRef = useRef<HTMLInputElement>(null);
  const awayRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const handleUpdate = () => {
    setSuccess(false);
    if (!homeRef.current || !awayRef.current || !statusRef.current) return;
    
    const hScore = parseInt(homeRef.current.value, 10) || 0;
    const aScore = parseInt(awayRef.current.value, 10) || 0;
    const st = statusRef.current.value as any;

    startTransition(async () => {
      const res = await updateMatchScore(matchId, hScore, aScore, st);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Score & Status Controller</span>
        {success && <span style={{ fontSize: '0.8rem', color: 'var(--brand-cyan)' }}>Updated Successfully</span>}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', alignItems: 'end', marginBottom: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Home Team Score</label>
          <input ref={homeRef} type="number" defaultValue={defaultHomeScore || 0} style={{ width: '100%', padding: '12px', fontSize: '1.25rem', textAlign: 'center', fontWeight: 'bold', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
        </div>
        
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Away Team Score</label>
          <input ref={awayRef} type="number" defaultValue={defaultAwayScore || 0} style={{ width: '100%', padding: '12px', fontSize: '1.25rem', textAlign: 'center', fontWeight: 'bold', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</label>
           <select ref={statusRef} defaultValue={currentStatus || "SCHEDULED"} style={{ width: '100%', height: '53px', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live Now</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELED">Canceled</option>
          </select>
        </div>
      </div>

      <button onClick={handleUpdate} disabled={isPending} className="secondary-btn" style={{ width: '100%' }}>
        {isPending ? "Validating..." : "Push Score & State Update"}
      </button>
    </div>
  );
}
