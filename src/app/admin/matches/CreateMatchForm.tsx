"use client";

import { useRef, useState, useTransition } from "react";
import { createMatch } from "./actions";

type TeamInfo = { id: string; name: string; division: string };

const validDivisions = ["Kids Camp", "Midgets", "Juniors", "Seniors", "Open Seniors Division"];

export default function CreateMatchForm({ teams }: { teams: TeamInfo[] }) {
  const [selectedDivision, setSelectedDivision] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  // Only show teams that belong to the chosen division
  const filteredTeams = selectedDivision
    ? teams.filter(t => t.division === selectedDivision)
    : [];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(false);
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const homeTeam = formData.get("homeTeamId")?.toString();
    const awayTeam = formData.get("awayTeamId")?.toString();

    if (!selectedDivision) { setError("Please select a division first."); return; }
    if (!homeTeam || !awayTeam) { setError("Please select both teams."); return; }
    if (homeTeam === awayTeam) { setError("A team cannot play against itself."); return; }

    startTransition(async () => {
      const result = await createMatch(formData);
      if (result.success) {
        setSuccess(true);
        formRef.current?.reset();
        setSelectedDivision("");
      } else {
        setError(result.error || "Unknown Error");
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "40px" }}>
      <h2 style={{ fontSize: "1.25rem", marginBottom: "20px" }}>Schedule New Match</h2>

      {error && <div style={{ color: "#ff3333", marginBottom: "16px", padding: "10px", background: "rgba(255,51,51,0.1)", borderRadius: "4px" }}>{error}</div>}
      {success && <div style={{ color: "var(--brand-cyan)", marginBottom: "16px", padding: "10px", background: "rgba(0,210,255,0.1)", borderRadius: "4px" }}>Match scheduled successfully!</div>}

      {/* Step 1: Division */}
      <div style={{ marginBottom: "20px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)", fontWeight: 600 }}>
          Step 1 — Select Division
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {validDivisions.map(div => (
            <button
              key={div}
              type="button"
              onClick={() => setSelectedDivision(div)}
              style={{
                padding: "8px 16px",
                borderRadius: "4px",
                border: "1px solid",
                cursor: "pointer",
                fontSize: "0.9rem",
                background: selectedDivision === div ? "rgba(0,210,255,0.15)" : "rgba(0,0,0,0.2)",
                borderColor: selectedDivision === div ? "var(--brand-cyan)" : "var(--border-light)",
                color: selectedDivision === div ? "var(--brand-cyan)" : "var(--text-secondary)",
                fontWeight: selectedDivision === div ? 600 : 400,
                transition: "all 0.2s",
              }}
            >
              {div}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Teams + Date (only shown after division selected) */}
      {selectedDivision && (
        <form ref={formRef} onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(0,0,0,0.2)", borderRadius: "4px", fontSize: "0.85rem", color: "var(--brand-cyan)" }}>
            Showing {filteredTeams.length} teams in <strong>{selectedDivision}</strong>
            {filteredTeams.length === 0 && " — No teams registered yet for this division."}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr)", gap: "16px", alignItems: "end", marginBottom: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Home Team</label>
              <select name="homeTeamId" required disabled={filteredTeams.length === 0} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }}>
                <option value="">Select Home...</option>
                {filteredTeams.map(t => <option key={`h-${t.id}`} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            <div style={{ paddingBottom: "10px", color: "var(--text-muted)", fontWeight: "bold" }}>VS</div>

            <div>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Away Team</label>
              <select name="awayTeamId" required disabled={filteredTeams.length === 0} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }}>
                <option value="">Select Away...</option>
                {filteredTeams.map(t => <option key={`a-${t.id}`} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Date & Time</label>
            <input type="datetime-local" name="matchDate" required style={{ width: "100%", maxWidth: "320px", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }} />
          </div>

          <button type="submit" className="primary-btn" disabled={isPending || filteredTeams.length < 2}>
            {isPending ? "Scheduling..." : "Create Schedule"}
          </button>
        </form>
      )}
    </div>
  );
}
