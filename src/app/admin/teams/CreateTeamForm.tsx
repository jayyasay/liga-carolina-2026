"use client";

import { useRef, useState, useTransition } from "react";
import { createTeam, bulkCreateTeamsWithRoster } from "./actions";

export default function CreateTeamForm() {
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
      const result = await createTeam(formData);
      if (result.success) {
        setSuccess("Team created successfully.");
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

     startTransition(async () => {
         const result = await bulkCreateTeamsWithRoster(text);
         if (result.success) {
            setSuccess(`Successfully imported ${result.teamsCount} teams and ${result.playersCount} players in one batch!`);
            textAreaRef.current!.value = "";
         } else {
            setError(result.error || "Bulk upload error");
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
          Add Single Team
        </button>
        <button 
          type="button"
          onClick={() => setMode("bulk")}
          className={`admin-tab ${mode === "bulk" ? "active" : ""}`}
        >
          Bulk League Importer
        </button>
      </div>

      {error && <div style={{ color: '#ff3333', marginBottom: '16px', padding: '10px', background: 'rgba(255,51,51,0.1)', borderRadius: '4px' }}>{error}</div>}
      {success && <div style={{ color: 'var(--brand-cyan)', marginBottom: '16px', padding: '10px', background: 'rgba(0, 210, 255, 0.1)', borderRadius: '4px' }}>{success}</div>}

      {mode === "single" ? (
        <form ref={formRef} onSubmit={handleSingleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" name="name" required placeholder="e.g. Los Angeles Lakers" style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Short Name (Abbr)</label>
              <input type="text" name="shortName" required placeholder="e.g. LAL" maxLength={10} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Division</label>
              <select name="division" style={{ width: '100%', height: '42px', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white' }}>
                 <option value="Open Seniors Division">Open Seniors Division (Default)</option>
                 <option value="Seniors">Seniors</option>
                 <option value="Juniors">Juniors</option>
                 <option value="Midgets">Midgets</option>
                 <option value="Kids Camp">Kids Camp</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Primary Color</label>
              <input type="color" name="primaryColor" defaultValue="#00d2ff" style={{ width: '100%', height: '42px', padding: '4px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', cursor: 'pointer' }} />
            </div>
          </div>
          <button type="submit" className="primary-btn" disabled={isPending}>{isPending ? "Adding Team..." : "Save Team"}</button>
        </form>
      ) : (
        <div>
           <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <span>Paste Master Roster Data</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Format: Team, Short, Color, [Division?], First, Last, Jersey, Pos</span>
            </label>
            <textarea 
              ref={textAreaRef}
              rows={8}
              placeholder={"Heat, MIA, #98002E, Adrian, Lopez, 3, PG\nHeat, MIA, #98002E, Victor, Ramos, 12, SG\n\n-- OR with Division --\nLakers, LAL, #FDB927, Seniors, LeBron, James, 23, SF"}
              style={{ width: '100%', padding: '12px', borderRadius: '4px', border: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', color: 'white', fontFamily: 'monospace' }}
            />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>
               Division is optional — the system auto-detects it. If your 4th column matches a known division (Kids Camp, Midgets, Juniors, Seniors, Open Seniors Division), it will be used. Otherwise it defaults to Open Seniors Division. Repeat team info on every row.
            </p>
          </div>
          <button type="button" onClick={handleBulkSubmit} className="primary-btn" disabled={isPending}>{isPending ? "Building League Architecture..." : "Run Bulk Importer"}</button>
        </div>
      )}

    </div>
  );
}
