"use client";

import { useState, useTransition } from "react";
import { setPlayerOfTheGame } from "./setPlayerOfTheGame";
import { Trophy, CheckCircle2, AlertCircle } from "lucide-react";

type Player = { id: string; firstName: string; lastName: string; jerseyNumber: number | null; teamId: string };

export default function PlayerOfTheGameSelector({
  matchId,
  roster,
  homeTeam,
  awayTeam,
  currentPlayerOfTheGameId,
}: {
  matchId: string;
  roster: Player[];
  homeTeam: { id: string; name: string | null };
  awayTeam: { id: string; name: string | null };
  currentPlayerOfTheGameId: string | null;
}) {
  const [selected, setSelected] = useState<string>(currentPlayerOfTheGameId || "");
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const homePlayers = roster.filter(p => p.teamId === homeTeam.id);
  const awayPlayers = roster.filter(p => p.teamId === awayTeam.id);

  const handleSave = () => {
    setSuccess(false);
    setError(null);
    startTransition(async () => {
      const res = await setPlayerOfTheGame(matchId, selected || null);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(res.error || "Failed to save");
      }
    });
  };

  const currentPlayer = roster.find(p => p.id === selected);

  return (
    <div className="glass-panel" style={{ padding: "24px", marginBottom: "40px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px", flexWrap: "wrap", gap: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ padding: "10px", background: "rgba(255,183,0,0.1)", borderRadius: "12px", color: "#ffb700" }}>
            <Trophy size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.25rem", margin: "0 0 4px 0" }}>Player of the Game</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              Select the standout performer for this match.
            </p>
          </div>
        </div>
        {currentPlayer && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>Currently Selected</div>
            <div style={{ fontWeight: 700, color: "var(--brand-primary)", fontSize: "1.1rem" }}>
              {currentPlayer.firstName} {currentPlayer.lastName}
              {currentPlayer.jerseyNumber != null && <span style={{ color: "var(--text-muted)", marginLeft: "6px", fontSize: "0.9rem" }}>#{currentPlayer.jerseyNumber}</span>}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ff3333", marginBottom: "12px", padding: "10px 16px", background: "rgba(255,51,51,0.1)", borderRadius: "8px", fontSize: "0.9rem" }}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}
      {success && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--brand-cyan)", marginBottom: "12px", padding: "10px 16px", background: "rgba(0,210,255,0.1)", borderRadius: "8px", fontSize: "0.9rem" }}>
          <CheckCircle2 size={16} />
          Player of the Game saved!
        </div>
      )}

      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
          <label style={{ display: "block", marginBottom: "8px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Select Player</label>
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            style={{ width: "100%", height: "44px", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.25)", color: "white", fontSize: "0.95rem" }}
          >
            <option value="">— No Selection —</option>
            <optgroup label={homeTeam.name || "Home Team"}>
              {homePlayers.sort((a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99)).map(p => (
                <option key={p.id} value={p.id}>
                  #{p.jerseyNumber ?? "--"} {p.firstName} {p.lastName}
                </option>
              ))}
            </optgroup>
            <optgroup label={awayTeam.name || "Away Team"}>
              {awayPlayers.sort((a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99)).map(p => (
                <option key={p.id} value={p.id}>
                  #{p.jerseyNumber ?? "--"} {p.firstName} {p.lastName}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="primary-btn"
            style={{ padding: "10px 24px", whiteSpace: "nowrap", height: "44px" }}
          >
            {isPending ? "Saving..." : "Save Selection"}
          </button>
          {selected && (
            <button
              onClick={() => { setSelected(""); }}
              disabled={isPending}
              className="secondary-btn"
              style={{ padding: "10px 16px", whiteSpace: "nowrap", height: "44px" }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
