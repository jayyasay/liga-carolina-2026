"use server";

import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Type map for safely casting enum
const validPositions = ["PG", "SG", "SF", "PF", "C"] as const;
type Position = typeof validPositions[number];

export async function createPlayer(formData: FormData) {
  try {
    const firstName = formData.get("firstName")?.toString().trim();
    const lastName = formData.get("lastName")?.toString().trim();
    const teamId = formData.get("teamId")?.toString();
    const jerseyNumberStr = formData.get("jerseyNumber")?.toString();
    const positionStr = formData.get("position")?.toString();

    if (!firstName || !lastName || !teamId) {
      return { success: false, error: "First Name, Last Name, and Team are required." };
    }

    let position: Position | undefined;
    if (positionStr && validPositions.includes(positionStr as Position)) {
      position = positionStr as Position;
    }

    const jerseyNumber = jerseyNumberStr ? parseInt(jerseyNumberStr, 10) : null;

    await db.insert(players).values({
      firstName,
      lastName,
      teamId,
      jerseyNumber,
      position,
    });

    revalidatePath("/admin/players");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create player:", error);
    return { success: false, error: error.message };
  }
}

export async function bulkCreatePlayers(teamId: string, rawText: string) {
  try {
    if (!teamId) return { success: false, error: "A Team must be selected." };
    if (!rawText.trim()) return { success: false, error: "Input text is empty." };

    const lines = rawText.split('\n').filter(line => line.trim().length > 0);
    const insertData = [];

    for (const line of lines) {
      // Expected Format: First Last, Jersey, Position
      const parts = line.split(',').map(s => s.trim());
      const fullName = parts[0];
      
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || "";
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : "";

      if (!firstName || !lastName) {
         continue; // silently skip improperly formatted names (or we could error, but skipping is safer for bulk)
      }

      let jerseyNumber: number | null = null;
      let position: Position | undefined;

      if (parts.length > 1 && parts[1] !== "") {
        const parsed = parseInt(parts[1], 10);
        if (!isNaN(parsed)) jerseyNumber = parsed;
      }

      if (parts.length > 2 && parts[2] !== "") {
        const p = parts[2].toUpperCase();
        if (validPositions.includes(p as Position)) {
          position = p as Position;
        }
      }

      insertData.push({
        firstName,
        lastName,
        teamId,
        jerseyNumber,
        position,
      });
    }

    if (insertData.length === 0) {
      return { success: false, error: "No valid player formats found to parse." };
    }

    await db.insert(players).values(insertData);

    revalidatePath("/admin/players");
    return { success: true, count: insertData.length };
  } catch (error: any) {
    console.error("Bulk upload failed:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePlayer(id: string) {
  try {
    await db.delete(players).where(eq(players.id, id));
    revalidatePath("/admin/players");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete player:", error);
    return { success: false, error: error.message };
  }
}
