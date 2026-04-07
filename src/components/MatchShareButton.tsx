"use client";

import { useRef, useState } from "react";
import { Share, Loader2, Trophy } from "lucide-react";

type MatchShareProps = {
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  homeColor: string | null;
  awayColor: string | null;
  status: string | null;
  division: string | null;
  matchDate: string;
  potgName?: string | null;
  potgJersey?: number | null;
  highlights?: {
    points: { name: string; value: number } | null;
    rebounds: { name: string; value: number } | null;
    assists: { name: string; value: number } | null;
    steals: { name: string; value: number } | null;
  };
};

export default function MatchShareButton(props: MatchShareProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const isCompleted = props.status === "COMPLETED";

  const handleShare = async () => {
    if (isCapturing || !cardRef.current) return;
    setIsCapturing(true);

    try {
      // Dynamically import html2canvas to avoid SSR issues
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      // Download
      const link = document.createElement("a");
      link.download = `liga-match-${props.homeTeam.replace(/\s+/g, "-")}-vs-${props.awayTeam.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Share capture failed:", err);
    } finally {
      setIsCapturing(false);
    }
  };

  const homeWin = isCompleted && (props.homeScore ?? 0) > (props.awayScore ?? 0);
  const awayWin = isCompleted && (props.awayScore ?? 0) > (props.homeScore ?? 0);

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isCapturing}
        className="secondary-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 18px",
          fontSize: "0.85rem",
          fontWeight: 600,
        }}
      >
        {isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Share size={16} />}
        {isCapturing ? "Generating..." : "Share Match"}
      </button>

      {/* Hidden share card rendered off-screen */}
      <div style={{ position: "fixed", top: "-9999px", left: "-9999px", zIndex: -1 }}>
        <div
          ref={cardRef}
          style={{
            width: "600px",
            background: "linear-gradient(135deg, #0a1a0d 0%, #132416 50%, #0a1a0d 100%)",
            borderRadius: "16px",
            overflow: "hidden",
            fontFamily: "'Roboto Condensed', sans-serif",
            color: "white",
          }}
        >
          {/* Top bar */}
          <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.05)", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "3px", color: "#fe6600" }}>LIGA STATS</span>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {props.division && (
                <span style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", padding: "3px 8px", background: "rgba(254,102,0,0.2)", border: "1px solid rgba(254,102,0,0.4)", borderRadius: "4px", color: "#fe6600" }}>{props.division}</span>
              )}
              <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{props.matchDate}</span>
            </div>
          </div>

          {/* Score block */}
          <div style={{ padding: "40px 32px", display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Home */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: props.homeColor || "#444", margin: "0 auto 16px", border: "3px solid rgba(255,255,255,0.15)" }}></div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: homeWin ? "white" : "rgba(255,255,255,0.5)" }}>
                {props.homeTeam}
              </div>
            </div>

            {/* Scores */}
            <div style={{ flexShrink: 0, textAlign: "center", minWidth: "140px" }}>
              {isCompleted ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <span style={{ fontSize: "4rem", fontWeight: 900, color: homeWin ? "white" : "rgba(255,255,255,0.4)", lineHeight: 1 }}>{props.homeScore}</span>
                  <span style={{ fontSize: "2rem", color: "rgba(255,255,255,0.3)" }}>:</span>
                  <span style={{ fontSize: "4rem", fontWeight: 900, color: awayWin ? "white" : "rgba(255,255,255,0.4)", lineHeight: 1 }}>{props.awayScore}</span>
                </div>
              ) : (
                <div style={{ fontSize: "2.5rem", fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>VS</div>
              )}
              <div style={{ marginTop: "12px" }}>
                {isCompleted ? (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", padding: "4px 10px", background: "rgba(255,255,255,0.1)", borderRadius: "4px", color: "rgba(255,255,255,0.5)" }}>FINAL</span>
                ) : (
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#fe6600" }}>{props.status}</span>
                )}
              </div>
            </div>

            {/* Away */}
            <div style={{ flex: 1, textAlign: "center" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: props.awayColor || "#444", margin: "0 auto 16px", border: "3px solid rgba(255,255,255,0.15)" }}></div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", color: awayWin ? "white" : "rgba(255,255,255,0.5)" }}>
                {props.awayTeam}
              </div>
            </div>
          </div>

          {/* POTG banner if available */}
          {props.potgName && (
            <div style={{ margin: "0 24px 24px", padding: "14px 20px", background: "linear-gradient(135deg, rgba(255,183,0,0.15), rgba(255,100,0,0.08))", border: "1px solid rgba(255,183,0,0.3)", borderRadius: "10px", display: "flex", alignItems: "center", gap: "14px" }}>
               <Trophy size={32} color="#ffb700" />
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#ffb700", marginBottom: "3px" }}>Player of the Game</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "white" }}>
                  {props.potgName}
                  {props.potgJersey != null && <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400, marginLeft: "8px", fontSize: "0.9rem" }}>#{props.potgJersey}</span>}
                </div>
              </div>
            </div>
          )}

          {/* Highlights Grid */}
          {props.highlights && (props.highlights.points || props.highlights.rebounds || props.highlights.assists || props.highlights.steals) && (
            <div style={{ margin: "0 24px 24px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              {[
                { label: "Points", data: props.highlights.points },
                { label: "Rebounds", data: props.highlights.rebounds },
                { label: "Assists", data: props.highlights.assists },
                { label: "Steals", data: props.highlights.steals },
              ].map((stat, i) => stat.data && (
                <div key={i} style={{ padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{stat.label} Leader</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: "8px" }}>{stat.data.name}</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 900, color: "#fe6600", lineHeight: 1 }}>{stat.data.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: "12px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", textAlign: "center", fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", letterSpacing: "2px", textTransform: "uppercase" }}>
            ligastats.app
          </div>
        </div>
      </div>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
