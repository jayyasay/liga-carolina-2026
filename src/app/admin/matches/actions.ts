"use server";

import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";

type MatchStatus = "SCHEDULED" | "LIVE" | "COMPLETED" | "CANCELED";

export async function createMatch(formData: FormData) {
  try {
    await requireAdminSession();

    const homeTeamId = formData.get("homeTeamId")?.toString();
    const awayTeamId = formData.get("awayTeamId")?.toString();
    const matchDateStr = formData.get("matchDate")?.toString();

    if (!homeTeamId || !awayTeamId || !matchDateStr) {
      return { success: false, error: "Home Team, Away Team, and Date are required." };
    }

    if (homeTeamId === awayTeamId) {
      return { success: false, error: "A team cannot play against itself." };
    }

    const matchDate = new Date(matchDateStr);

    await db.insert(matches).values({
      homeTeamId,
      awayTeamId,
      matchDate,
      status: "SCHEDULED"
    });

    revalidatePath("/admin/matches");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to create match:", error);
    return { success: false, error: error.message };
  }
}

export async function updateMatchScore(id: string, homeScore: number, awayScore: number, status: MatchStatus) {
  try {
    await requireAdminSession();

    await db.update(matches)
      .set({
        homeScore,
        awayScore,
        status,
        updatedAt: new Date()
      })
      .where(eq(matches.id, id));

    revalidatePath("/admin/matches");
    revalidatePath(`/admin/matches/${id}`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update score:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteMatch(id: string) {
  try {
    await requireAdminSession();

    await db.delete(matches).where(eq(matches.id, id));
    revalidatePath("/admin/matches");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete match:", error);
    return { success: false, error: error.message };
  }
}
