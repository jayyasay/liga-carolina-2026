"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateScheduledMatchDate } from "../actions";

function toDatetimeLocalValue(dateIso: string) {
  const date = new Date(dateIso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

export default function ScheduledMatchEditor({
  matchId,
  initialMatchDateIso,
}: {
  matchId: string;
  initialMatchDateIso: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [matchDate, setMatchDate] = useState(() => toDatetimeLocalValue(initialMatchDateIso));
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => matchDate.trim().length > 0, [matchDate]);

  const handleSave = () => {
    setSuccess(null);
    setError(null);

    if (!canSave) {
      setError("Please choose a valid date and time.");
      return;
    }

    startTransition(async () => {
      const result = await updateScheduledMatchDate(matchId, matchDate);
      if (result.success) {
        setSuccess("Scheduled time updated.");
        router.refresh();
      } else {
        setError(result.error || "Unable to update the scheduled time.");
      }
    });
  };

  return (
    <div className="glass-panel" style={{ padding: 24, marginBottom: 40, background: "var(--surface-base)" }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: "1.15rem", margin: 0 }}>Edit Scheduled Time</h2>
        <p style={{ margin: "8px 0 0", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Scheduled matches stay editable until they are marked as live or completed.
        </p>
      </div>

      {error && (
        <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 8, background: "rgba(255,51,51,0.08)", color: "#c53030", border: "1px solid rgba(255,51,51,0.15)" }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ marginBottom: 16, padding: "10px 12px", borderRadius: 8, background: "rgba(0, 210, 255, 0.08)", color: "var(--brand-cyan)", border: "1px solid rgba(0, 210, 255, 0.18)" }}>
          {success}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 12, alignItems: "end" }}>
        <div>
          <label htmlFor="match-date" style={{ display: "block", marginBottom: 8, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Match Date & Time
          </label>
          <input
            id="match-date"
            type="datetime-local"
            value={matchDate}
            onChange={(event) => setMatchDate(event.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid var(--border-light)",
              background: "var(--surface-hover)",
              color: "var(--text-primary)",
              fontSize: "1rem",
            }}
          />
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={handleSave}
          disabled={isPending || !canSave}
          style={{ minWidth: 160, padding: "12px 18px" }}
        >
          {isPending ? "Saving..." : "Save Time"}
        </button>
      </div>
    </div>
  );
}
