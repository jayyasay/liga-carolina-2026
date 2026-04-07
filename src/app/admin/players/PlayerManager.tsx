"use client";

import { useRef, useState, useTransition } from "react";
import { createPlayer, bulkCreatePlayers } from "./actions";

type TeamInfo = { id: string, name: string };

export default function PlayerManager({ teams }: { teams: TeamInfo[] }) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const handleSingleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);

    startTransition(async () => {
      const result = await createPlayer(formData);
      if (result.success) {
        setSuccess("Player created successfully.");
        formRef.current?.reset();
      } else {
        setError(result.error || "An unknown error occurred");
      }
    });
  };

  const handleBulkSubmit = () => {
    setError(null); setSuccess(null);
    if (!textAreaRef.current) return;
    const text = textAreaRef.current.value;
    
    // We need to get the teamId. We can require them to pick it from a standalone select.
    const teamSelect = document.getElementById("bulk-team-select") as HTMLSelectElement;
    if (!teamSelect || !teamSelect.value) {
      setError("Please select a target team for the import.");
      return;
    }

    startTransition(async () => {
      const result = await bulkCreatePlayers(teamSelect.value, text);
      if (result.success) {
        setSuccess(`Successfully imported ${result.count} players.`);
        textAreaRef.current!.value = "";
      } else {
        setError(result.error || "Bulk upload failed");
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
      <div className="admin-tabs-container">
        <button 
          type="button"
          onClick={() => setMode("single")}
          className={`admin-tab ${mode === "single" ? "active" : ""}`}
        >
          Single Player
        </button>
        <button 
          type="button"
          onClick={() => setMode("bulk")}
          className={`admin-tab ${mode === "bulk" ? "active" : ""}`}
        >
          Bulk Import
        </button>
      </div>

      {error && <div style={{ color: '#ff3333', marginBottom: '16px', padding: '10px', background: 'rgba(255,51,51,0.1)', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: 'var(--brand-cyan)', marginBottom: '16px', padding: '10px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '4px' }}>{success}</div>}

      {teams.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)' }}>You must create a team first before adding players.</div>
      ) : mode === "single" ? (
        <form ref={formRef} onSubmit={handleSingleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>First Name</label>
              <input type="text" name="firstName" required className="standard-input" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Last Name</label>
              <input type="text" name="lastName" required className="standard-input" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Team</label>
              <select name="teamId" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                <option value="">Select Team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Jersey Number</label>
              <input type="number" name="jerseyNumber" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Position</label>
              <select name="position" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                <option value="">None</option>
                <option value="PG">Point Guard (PG)</option>
                <option value="SG">Shooting Guard (SG)</option>
                <option value="SF">Small Forward (SF)</option>
                <option value="PF">Power Forward (PF)</option>
                <option value="C">Center (C)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="primary-btn" disabled={isPending}>{isPending ? "Adding..." : "Add Player"}</button>
        </form>
      ) : (
        <div>
          <div style={{ marginBottom: '16px' }}>
             <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Target Team for Roster Upload</label>
             <select id="bulk-team-select" required style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                <option value="">Select Team...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Paste Roster Data</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Format: First Last, Jersey, Position</span>
            </label>
            <textarea 
              ref={textAreaRef}
              rows={8}
              placeholder={"LeBron James, 23, SF\nAnthony Davis, 3, C\nAustin Reaves, 15, SG"}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
            />
          </div>
          <button type="button" onClick={handleBulkSubmit} className="primary-btn" disabled={isPending}>{isPending ? "Importing Roster..." : "Import Bulk Roster"}</button>
        </div>
      )}
    </div>
  );
}
