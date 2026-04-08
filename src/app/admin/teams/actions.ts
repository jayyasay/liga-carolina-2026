"use server";

import { db } from "@/db";
import { teams, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";

const validPositions = ["PG", "SG", "SF", "PF", "C"] as const;
type Position = typeof validPositions[number];

const validDivisions = ["Kids Camp", "Midgets", "Juniors", "Seniors", "Open Seniors Division"] as const;
type Division = typeof validDivisions[number];

export async function bulkCreateTeamsWithRoster(rawText: string) {
  try {
    await requireAdminSession();

    if (!rawText.trim()) return { success: false, error: "Upload payload is empty." };

    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    
    // Group structures
    // Record structure: { [teamName]: { shortName, color, division, players: [] } }
    const teamMap: Record<string, { shortName: string, color: string, division: Division, players: any[] }> = {};

    for (let i = 0; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim());
      if (parts.length < 5) continue; // Need at least: Team, Short, Color, First, Last

      const teamName = parts[0];
      const shortName = parts[1] || "";
      const color = parts[2];

      // Auto-detect whether the user included a Division column:
      // If parts[3] matches a known division string → it's the division column (8-col format)
      // Otherwise → parts[3] is firstName (7-col format, division defaults)
      let division: Division = "Open Seniors Division";
      let firstName: string;
      let lastName: string;
      let jerseyRaw: string;
      let positionRaw: string;

      if (validDivisions.includes(parts[3] as Division)) {
        // 8-column format: Team, Short, Color, Division, First, Last, Jersey, Pos
        division = parts[3] as Division;
        firstName = parts[4] || "";
        lastName = parts[5] || "";
        jerseyRaw = parts.length > 6 ? parts[6] : "";
        positionRaw = parts.length > 7 ? parts[7] : "";
      } else {
        // 7-column format: Team, Short, Color, First, Last, Jersey, Pos
        firstName = parts[3] || "";
        lastName = parts[4] || "";
        jerseyRaw = parts.length > 5 ? parts[5] : "";
        positionRaw = parts.length > 6 ? parts[6] : "";
      }

      const rawJerseyNum = parseInt(jerseyRaw.replace('#', '').trim(), 10);
      const jersey = !isNaN(rawJerseyNum) ? rawJerseyNum : null;

      let position: Position | null = null;
      const posUpper = positionRaw.toUpperCase().trim();
      if (posUpper && validPositions.includes(posUpper as Position)) {
        position = posUpper as Position;
      }

      if (!teamName || !firstName || !lastName) continue;

      if (!teamMap[teamName]) {
        teamMap[teamName] = { shortName, color: color || "#000000", division, players: [] };
      }

      teamMap[teamName].players.push({
        firstName,
        lastName,
        jerseyNumber: jersey,
        position
      });
    }

    const teamNamesToInsert = Object.keys(teamMap);
    if (teamNamesToInsert.length === 0) {
      return { success: false, error: "No valid rows parsed. Please check the formatting." };
    }

    // 1. Insert Teams & capture their new UUIDs
    const teamInserts = teamNamesToInsert.map(name => ({
      name,
      shortName: teamMap[name].shortName || "",
      primaryColor: teamMap[name].color,
      division: teamMap[name].division
    }));

    const insertedTeams = await db.insert(teams).values(teamInserts).returning({ id: teams.id, name: teams.name });

    // 2. Map UUIDs directly to the extracted players
    const playersToInsert: any[] = [];
    insertedTeams.forEach(insertedTeam => {
       const mappedPlayers = teamMap[insertedTeam.name].players;
       mappedPlayers.forEach(p => {
          playersToInsert.push({
             teamId: insertedTeam.id,
             firstName: p.firstName,
             lastName: p.lastName,
             jerseyNumber: p.jerseyNumber,
             position: p.position
          });
       });
    });

    if (playersToInsert.length > 0) {
      await db.insert(players).values(playersToInsert);
    }

    revalidatePath("/admin/teams");
    revalidatePath("/admin/players");
    revalidatePath("/");
    
    return { 
      success: true, 
      teamsCount: insertedTeams.length, 
      playersCount: playersToInsert.length 
    };

  } catch(error: any) {
    console.error("Bulk upload teams failed:", error);
    return { success: false, error: error.message };
  }
}


export async function createTeam(formData: FormData) {
  try {
    await requireAdminSession();

    const name = formData.get("name")?.toString();
    const shortName = formData.get("shortName")?.toString().trim() || "";
    const primaryColor = formData.get("primaryColor")?.toString() || "#000000";
    const divStr = formData.get("division")?.toString();
    
    let division: Division = "Open Seniors Division";
    if (divStr && validDivisions.includes(divStr as Division)) {
        division = divStr as Division;
    }

    if (!name) {
      return { success: false, error: "Team name is required." };
    }

    await db.insert(teams).values({
      name,
      shortName,
      primaryColor,
      division,
    });

    revalidatePath("/admin/teams");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create team:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteTeam(id: string) {
  try {
    await requireAdminSession();

    await db.delete(teams).where(eq(teams.id, id));
    revalidatePath("/admin/teams");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete team:", error);
    return { success: false, error: error.message };
  }
}
