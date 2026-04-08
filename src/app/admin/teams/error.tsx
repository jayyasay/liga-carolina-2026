"use client";

export default function TeamsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="glass-panel" style={{ padding: "32px" }}>
        <h2 style={{ marginBottom: "8px" }}>Could not load teams</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>{error.message}</p>
        <button onClick={reset} className="primary-btn">
          Try Again
        </button>
      </div>
    </div>
  );
}
