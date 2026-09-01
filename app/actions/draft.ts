"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { draftedPlayers, draftSessions, players } from "@/lib/db/schema";
import { POSITIONS } from "@/lib/positions";
import { currentUserId } from "@/lib/auth/current-user";

function draftPath(seasonYear: number, segment: string) {
  return `/${seasonYear}/draft/${segment}`;
}

function revalidateDraft(seasonYear: number) {
  revalidatePath(draftPath(seasonYear, "overall"));
  for (const position of POSITIONS) {
    revalidatePath(draftPath(seasonYear, position.toLowerCase()));
  }
}

export async function startDraft(input: {
  seasonId: number;
  seasonYear: number;
}): Promise<{ error?: string }> {
  const { seasonId, seasonYear } = input;
  const db = getDb();
  const userId = await currentUserId();

  await db
    .delete(draftSessions)
    .where(and(eq(draftSessions.seasonId, seasonId), eq(draftSessions.userId, userId)));

  const [session] = await db
    .insert(draftSessions)
    .values({ seasonId, userId })
    .returning();

  const currentPlayers = await db.query.players.findMany({
    where: and(eq(players.seasonId, seasonId), eq(players.userId, userId)),
  });

  if (currentPlayers.length > 0) {
    await db.insert(draftedPlayers).values(
      currentPlayers.map((player) => ({
        draftSessionId: session.id,
        playerId: player.id,
        position: player.position,
        overallRank: player.overallRank,
        positionRank: player.positionRank,
      })),
    );
  }

  revalidateDraft(seasonYear);
  return {};
}

export async function markDrafted(input: {
  draftedPlayerId: number;
  seasonYear: number;
  drafted: boolean;
}): Promise<{ error?: string }> {
  const { draftedPlayerId, seasonYear, drafted } = input;
  const db = getDb();
  const userId = await currentUserId();

  const owned = await db
    .select({ id: draftedPlayers.id })
    .from(draftedPlayers)
    .innerJoin(draftSessions, eq(draftedPlayers.draftSessionId, draftSessions.id))
    .where(and(eq(draftedPlayers.id, draftedPlayerId), eq(draftSessions.userId, userId)))
    .limit(1);

  if (owned.length === 0) {
    return { error: "Drafted player not found." };
  }

  await db
    .update(draftedPlayers)
    .set({ draftedAt: drafted ? new Date() : null })
    .where(eq(draftedPlayers.id, draftedPlayerId));

  revalidateDraft(seasonYear);
  return {};
}
