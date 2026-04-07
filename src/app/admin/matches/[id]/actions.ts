"use server";

import { db } from "@/db";
import { playerMatchStats, players } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";

export async function uploadMatchStats(matchId: string, homeTeamId: string, awayTeamId: string, rawText: string) {
  try {
    await requireAdminSession();

    if (!rawText.trim()) return { success: false, error: "CSV text is empty." };

    // Fetch all players mapped to either of the two teams playing in this match
    const validPlayers = await db
      .select({ id: players.id, firstName: players.firstName, lastName: players.lastName, teamId: players.teamId, jerseyNumber: players.jerseyNumber })
      .from(players)
      .where(or(eq(players.teamId, homeTeamId), eq(players.teamId, awayTeamId)));

    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    
    // Header check
    const header = lines[0].toLowerCase();
    if (!header.includes("name") || !header.includes("pts") || !header.includes("reb") || !header.includes("ast")) {
      return { success: false, error: "Invalid CSV format. Must include headers: Name, PTS, REB, AST" };
    }

    const insertData = [];

    // Parse logic
    for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length < 4) continue;
        
        const playerNameInput = parts[0].toLowerCase();
        
        // Find matching player in the valid array
        const matchedPlayer = validPlayers.find(p => {
            const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
            return fullName.includes(playerNameInput) || playerNameInput.includes(p.lastName.toLowerCase());
        });

        if (!matchedPlayer) {
             console.warn(`Could not find a DB player matching "${parts[0]}" on either home or away team.`);
             continue; // Skip silently or we could fail explicitly
        }

        const pts = parseInt(parts[1], 10) || 0;
        const reb = parseInt(parts[2], 10) || 0;
        const ast = parseInt(parts[3], 10) || 0;
        const blk = parts.length > 4 ? (parseInt(parts[4], 10) || 0) : 0;
        const stl = parts.length > 5 ? (parseInt(parts[5], 10) || 0) : 0;
        
        insertData.push({
            matchId,
            playerId: matchedPlayer.id,
            teamId: matchedPlayer.teamId,
            points: pts,
            defensiveRebounds: reb,   // treat input "REB" as defensive rebounds; offensive defaults 0
            offensiveRebounds: 0,
            assists: ast,
            blocks: blk,
            steals: stl,
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
        });
    }

    if (insertData.length === 0) {
        return { success: false, error: "Could not map any stats. Ensure the player names in CSV exactly match the roster names." };
    }

    // Insert to DB using Drizzle
    await db.insert(playerMatchStats).values(insertData);
    
    revalidatePath(`/admin/matches/${matchId}`);
    return { success: true, count: insertData.length };
  } catch(error: any) {
     console.error("Failed to upload stats:", error);
     return { success: false, error: error.message };
  }
}
