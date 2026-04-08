export type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELED";

export const MATCH_COMPLETION_GRACE_MS = 2 * 60 * 60 * 1000;

export function getEffectiveMatchStatus(
  status: MatchStatus | string | null | undefined,
  matchDate: Date,
  now = new Date(),
): MatchStatus {
  if (status === "SCHEDULED" && matchDate.getTime() <= now.getTime() - MATCH_COMPLETION_GRACE_MS) {
    return "COMPLETED";
  }

  if (status === "LIVE" || status === "COMPLETED" || status === "CANCELED") {
    return status;
  }

  return "SCHEDULED";
}

export function hasPendingStats(
  status: MatchStatus | string | null | undefined,
  matchDate: Date,
  statsCount: number,
  now = new Date(),
) {
  return getEffectiveMatchStatus(status, matchDate, now) === "COMPLETED" && statsCount === 0;
}
