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

export async function updateTeam(id: string, formData: FormData) {
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

    await db.update(teams).set({ name, shortName, primaryColor, division, updatedAt: new Date() }).where(eq(teams.id, id));

    revalidatePath(`/admin/teams/${id}`);
    revalidatePath("/admin/teams");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addPlayerToTeam(teamId: string, formData: FormData) {
  try {
    await requireAdminSession();

    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const rawJersey = parseInt(formData.get("jerseyNumber")?.toString() || "", 10);
    const jersey = !isNaN(rawJersey) ? rawJersey : null;
    const posStr = formData.get("position")?.toString()?.toUpperCase();
    const position = (posStr && validPositions.includes(posStr as Position)) ? posStr as Position : null;

    if (!firstName || !lastName) {
      return { success: false, error: "First and Last name are required." };
    }

    await db.insert(players).values({ teamId, firstName, lastName, jerseyNumber: jersey, position });

    revalidatePath(`/admin/teams/${teamId}`);
    revalidatePath("/admin/players");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updatePlayer(playerId: string, teamId: string, formData: FormData) {
  try {
    await requireAdminSession();

    const firstName = formData.get("firstName")?.toString();
    const lastName = formData.get("lastName")?.toString();
    const rawJersey = parseInt(formData.get("jerseyNumber")?.toString() || "", 10);
    const jersey = !isNaN(rawJersey) ? rawJersey : null;
    const posStr = formData.get("position")?.toString()?.toUpperCase();
    const position = (posStr && validPositions.includes(posStr as Position)) ? posStr as Position : null;

    if (!firstName || !lastName) {
      return { success: false, error: "First and Last name are required." };
    }

    await db.update(players)
      .set({ firstName, lastName, jerseyNumber: jersey, position, updatedAt: new Date() })
      .where(eq(players.id, playerId));

    revalidatePath(`/admin/teams/${teamId}`);
    revalidatePath("/admin/players");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deletePlayerFromTeam(playerId: string, teamId: string) {
  try {
    await requireAdminSession();

    await db.delete(players).where(eq(players.id, playerId));
    revalidatePath(`/admin/teams/${teamId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
