"use server";

import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/admin-auth";

export async function setPlayerOfTheGame(matchId: string, playerId: string | null) {
  try {
    await requireAdminSession();

    await db
      .update(matches)
      .set({ playerOfTheGameId: playerId, updatedAt: new Date() })
      .where(eq(matches.id, matchId));

    revalidatePath(`/admin/matches/${matchId}`);
    revalidatePath(`/matches/${matchId}`);
    revalidatePath(`/`);

    return { success: true };
  } catch (error: any) {
    console.error("Failed to set Player of the Game:", error);
    return { success: false, error: error.message as string };
  }
}
