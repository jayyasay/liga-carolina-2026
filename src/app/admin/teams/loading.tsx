export default function LoadingTeamsPage() {
  return (
    <div style={{ maxWidth: "800px" }}>
      <div className="glass-panel" style={{ padding: "28px", marginBottom: "24px" }}>
        <div style={{ height: 20, width: 220, background: "var(--surface-hover)", borderRadius: 8, marginBottom: 10 }} />
        <div style={{ height: 14, width: 360, background: "var(--surface-hover)", borderRadius: 8 }} />
      </div>
      <div className="glass-panel" style={{ padding: "24px", minHeight: 280 }} />
    </div>
  );
}
