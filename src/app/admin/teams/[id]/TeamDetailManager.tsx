"use client";

import { useRef, useState, useTransition } from "react";
import { updateTeam, addPlayerToTeam, updatePlayer, deletePlayerFromTeam } from "./actions";

type Player = { id: string; firstName: string; lastName: string; jerseyNumber: number | null; position: string | null };
type Team = { id: string; name: string; shortName: string; primaryColor: string | null; division: string };

function PlayerRow({ player, teamId }: { player: Player; teamId: string }) {
  const [editing, setEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!formRef.current) return;
    const fd = new FormData(formRef.current);
    startTransition(async () => {
      const res = await updatePlayer(player.id, teamId, fd);
      if (res.success) setEditing(false);
      else setError(res.error || "Update failed");
    });
  };

  const handleDelete = () => {
    if (!confirm("Remove this player?")) return;
    startTransition(async () => {
      await deletePlayerFromTeam(player.id, teamId);
    });
  };

  const inputStyle = { width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.3)", color: "white", fontSize: "0.9rem" };

  if (editing) {
    return (
      <>
        <tr style={{ borderTop: "1px solid var(--border-light)", background: "rgba(0,210,255,0.04)" }}>
          <td colSpan={4} style={{ padding: "0" }}>
            <form ref={formRef} onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "70px 1fr 1fr 80px 80px 120px", gap: "8px", padding: "12px 16px", alignItems: "center" }}>
                <div style={{ textAlign: "center", color: "var(--brand-cyan)", fontWeight: "bold" }}>Edit</div>
                <div>
                  <input type="text" name="firstName" required defaultValue={player.firstName} placeholder="First" style={inputStyle} />
                </div>
                <div>
                  <input type="text" name="lastName" required defaultValue={player.lastName} placeholder="Last" style={inputStyle} />
                </div>
                <div>
                  <input type="number" name="jerseyNumber" defaultValue={player.jerseyNumber ?? ""} placeholder="#" min={0} max={99} style={inputStyle} />
                </div>
                <div>
                  <select name="position" defaultValue={player.position || ""} style={inputStyle}>
                    <option value="">--</option>
                    <option value="PG">PG</option>
                    <option value="SG">SG</option>
                    <option value="SF">SF</option>
                    <option value="PF">PF</option>
                    <option value="C">C</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button type="submit" disabled={isPending} style={{ padding: "6px 10px", background: "rgba(0,210,255,0.15)", color: "var(--brand-cyan)", border: "1px solid rgba(0,210,255,0.4)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                    {isPending ? "..." : "Save"}
                  </button>
                  <button type="button" onClick={() => { setEditing(false); setError(null); }} style={{ padding: "6px 10px", background: "rgba(0,0,0,0.2)", color: "var(--text-secondary)", border: "1px solid var(--border-light)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}>
                    Cancel
                  </button>
                </div>
              </div>
              {error && <div style={{ padding: "4px 16px 12px", color: "#ff4444", fontSize: "0.8rem" }}>{error}</div>}
            </form>
          </td>
        </tr>
      </>
    );
  }

  return (
    <tr style={{ borderTop: "1px solid var(--border-light)" }}>
      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: "bold", color: "var(--brand-cyan)", fontSize: "1.1rem", width: "70px" }}>
        {player.jerseyNumber !== null ? `#${player.jerseyNumber}` : "--"}
      </td>
      <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>
        {player.firstName} {player.lastName}
      </td>
      <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{player.position || "--"}</td>
      <td style={{ padding: "12px 16px", textAlign: "right" }}>
        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
          <button
            onClick={() => setEditing(true)}
            style={{ padding: "4px 10px", background: "rgba(0,210,255,0.1)", color: "var(--brand-cyan)", border: "1px solid rgba(0,210,255,0.3)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isPending}
            style={{ padding: "4px 10px", background: "rgba(255,51,51,0.1)", color: "#ff4444", border: "1px solid rgba(255,51,51,0.3)", borderRadius: "4px", cursor: "pointer", fontSize: "0.8rem" }}
          >
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TeamDetailManager({ team, roster }: { team: Team; roster: Player[] }) {
  const [tab, setTab] = useState<"roster" | "edit">("roster");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const editFormRef = useRef<HTMLFormElement>(null);
  const addFormRef = useRef<HTMLFormElement>(null);

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!editFormRef.current) return;
    const fd = new FormData(editFormRef.current);
    startTransition(async () => {
      const res = await updateTeam(team.id, fd);
      if (res.success) setSuccess("Team details updated!");
      else setError(res.error || "Update failed");
    });
  };

  const handleAddPlayer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!addFormRef.current) return;
    const fd = new FormData(addFormRef.current);
    startTransition(async () => {
      const res = await addPlayerToTeam(team.id, fd);
      if (res.success) {
        setSuccess("Player added to roster!");
        addFormRef.current?.reset();
      } else {
        setError(res.error || "Failed to add player");
      }
    });
  };

  return (
    <div>
      {/* Tab Nav */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--border-light)", paddingBottom: "16px" }}>
        {(["roster", "edit"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: "none", border: "none", color: tab === t ? "var(--brand-primary)" : "var(--text-secondary)", fontWeight: tab === t ? 600 : 400, cursor: "pointer", fontSize: "1.1rem", borderBottom: tab === t ? "2px solid var(--brand-primary)" : "2px solid transparent", paddingBottom: "4px", textTransform: "capitalize" }}>
            {t === "roster" ? "Roster" : "Edit Team Details"}
          </button>
        ))}
      </div>

      {error && <div style={{ color: "#ff3333", marginBottom: "16px", padding: "10px", background: "rgba(255,51,51,0.1)", borderRadius: "4px" }}>{error}</div>}
      {success && <div style={{ color: "var(--brand-cyan)", marginBottom: "16px", padding: "10px", background: "rgba(0,210,255,0.1)", borderRadius: "4px" }}>{success}</div>}

      {tab === "edit" ? (
        <div className="glass-panel" style={{ padding: "24px" }}>
          <h3 style={{ marginBottom: "20px" }}>Update Team Details</h3>
          <form ref={editFormRef} onSubmit={handleEditSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Team Name</label>
                <input type="text" name="name" required defaultValue={team.name} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Short Name</label>
                <input type="text" name="shortName" required defaultValue={team.shortName} maxLength={10} style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Primary Color</label>
                <input type="color" name="primaryColor" defaultValue={team.primaryColor || "#00d2ff"} style={{ width: "100%", height: "42px", padding: "4px", borderRadius: "4px", border: "1px solid var(--border-light)", cursor: "pointer" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Division</label>
                <select name="division" defaultValue={team.division} style={{ width: "100%", height: "42px", padding: "10px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }}>
                  <option value="Open Seniors Division">Open Seniors Division</option>
                  <option value="Seniors">Seniors</option>
                  <option value="Juniors">Juniors</option>
                  <option value="Midgets">Midgets</option>
                  <option value="Kids Camp">Kids Camp</option>
                </select>
              </div>
            </div>
            <button type="submit" className="primary-btn" disabled={isPending}>{isPending ? "Saving..." : "Update Team"}</button>
          </form>
        </div>
      ) : (
        <div>
          {/* Add Player Quick Form */}
          <div className="glass-panel" style={{ padding: "20px", marginBottom: "24px" }}>
            <h3 style={{ marginBottom: "16px", fontSize: "1rem" }}>Add Player to Roster</h3>
            <form ref={addFormRef} onSubmit={handleAddPlayer} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px auto", gap: "12px", alignItems: "end" }}>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>First Name</label>
                <input type="text" name="firstName" required placeholder="First" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Last Name</label>
                <input type="text" name="lastName" required placeholder="Last" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Jersey #</label>
                <input type="number" name="jerseyNumber" placeholder="#" min={0} max={99} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }} />
              </div>
              <div>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Position</label>
                <select name="position" style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--border-light)", background: "rgba(0,0,0,0.2)", color: "white" }}>
                  <option value="">--</option>
                  <option value="PG">PG</option>
                  <option value="SG">SG</option>
                  <option value="SF">SF</option>
                  <option value="PF">PF</option>
                  <option value="C">C</option>
                </select>
              </div>
              <button type="submit" className="primary-btn" disabled={isPending} style={{ padding: "8px 16px", whiteSpace: "nowrap" }}>
                {isPending ? "..." : "+ Add"}
              </button>
            </form>
          </div>

          {/* Roster Table with Inline Edit */}
          <div className="glass-panel" style={{ overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border-light)" }}>
              <h3 style={{ margin: 0, fontSize: "1rem" }}>Current Roster ({roster.length} players)</h3>
            </div>
            {roster.length === 0 ? (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>No players yet. Add one above.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "var(--surface-hover)", fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "left" }}>
                  <tr>
                    <th style={{ padding: "12px 16px", width: "70px", textAlign: "center" }}>Jersey</th>
                    <th style={{ padding: "12px 16px" }}>Player Name</th>
                    <th style={{ padding: "12px 16px" }}>Pos</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...roster].sort((a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999)).map(p => (
                    <PlayerRow key={p.id} player={p} teamId={team.id} />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
