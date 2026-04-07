"use server";

import { db } from "@/db";
import { playerMatchStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type StatInput = {
  playerId: string;
  teamId: string;
  points: number;
  rebounds: number; // frontend uses a single "rebounds" field — stored as defensiveRebounds
  assists: number;
  blocks: number;
  steals: number;
};

export async function saveManualBoxScore(matchId: string, statsData: StatInput[]) {
  try {
    // Drop all existing stats for this match first (replace strategy)
    await db.delete(playerMatchStats).where(eq(playerMatchStats.matchId, matchId));

    // Only persist rows where at least one stat is non-zero
    const populated = statsData.filter(
      s => s.points > 0 || s.rebounds > 0 || s.assists > 0 || s.blocks > 0 || s.steals > 0
    );

    if (populated.length > 0) {
      // Map frontend fields → exact DB column names from schema
      const rows = populated.map(s => ({
        matchId,
        playerId: s.playerId,
        teamId: s.teamId,
        points: s.points ?? 0,
        defensiveRebounds: s.rebounds ?? 0, // stored as defensiveRebounds; offReb defaults to 0
        offensiveRebounds: 0,
        assists: s.assists ?? 0,
        blocks: s.blocks ?? 0,
        steals: s.steals ?? 0,
        minutesPlayed: 0,
        turnovers: 0,
        personalFouls: 0,
        plusMinus: 0,
        fgMade: 0,
        fgAttempted: 0,
        threePtMade: 0,
        threePtAttempted: 0,
        ftMade: 0,
        ftAttempted: 0,
      }));

      await db.insert(playerMatchStats).values(rows);
    }

    revalidatePath(`/admin/matches/${matchId}`);
    revalidatePath(`/matches/${matchId}`);
    revalidatePath(`/`);

    return { success: true, count: populated.length };
  } catch (error: any) {
    console.error("Box Score save failed:", error);
    return { success: false, error: error.message as string };
  }
}
