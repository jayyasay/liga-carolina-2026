"use client";

export default function PlayersError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ maxWidth: "900px" }}>
      <div className="glass-panel" style={{ padding: "32px" }}>
        <h2 style={{ marginBottom: "8px" }}>Could not load players</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>{error.message}</p>
        <button onClick={reset} className="primary-btn">
          Try Again
        </button>
      </div>
    </div>
  );
}
