"use server";

import { and, eq, count, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { players } from "@/lib/db/schema";
import { derivePositionRanks, ranksForOrder } from "@/lib/ranking";
import { POSITIONS, type Position } from "@/lib/positions";

export type PlayerRecord = typeof players.$inferSelect;
export type PlayerTier = NonNullable<PlayerRecord["tier"]>;

function positionPath(seasonYear: number, position: Position) {
  return `/${seasonYear}/${position.toLowerCase()}`;
}
function overallPath(seasonYear: number) {
  return `/${seasonYear}/overall`;
}

export async function createPlayer(
  _prevState: { error?: string; player?: PlayerRecord } | undefined,
  formData: FormData,
): Promise<{ error?: string; player?: PlayerRecord }> {
  const seasonId = Number(formData.get("seasonId"));
  const seasonYear = Number(formData.get("seasonYear"));
  const name = formData.get("name");
  const team = formData.get("team");
  const position = formData.get("position");
  const photoUrlRaw = formData.get("photoUrl");
  const photoUrl = typeof photoUrlRaw === "string" && photoUrlRaw.length > 0 ? photoUrlRaw : null;

  if (
    !Number.isInteger(seasonId) ||
    !Number.isInteger(seasonYear) ||
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof team !== "string" ||
    team.length === 0 ||
    typeof position !== "string" ||
    position.length === 0
  ) {
    return { error: "Name, team, and position are required." };
  }

  const db = getDb();

  const [[positionCount], [overallCount]] = await Promise.all([
    db
      .select({ value: count() })
      .from(players)
      .where(
        and(
          eq(players.seasonId, seasonId),
          eq(players.position, position as Position),
        ),
      ),
    db
      .select({ value: count() })
      .from(players)
      .where(eq(players.seasonId, seasonId)),
  ]);

  const [created] = await db
    .insert(players)
    .values({
      seasonId,
      name: name.trim(),
      team: team as PlayerRecord["team"],
      position: position as Position,
      positionRank: positionCount.value + 1,
      overallRank: overallCount.value + 1,
      photoUrl,
    })
    .returning();

  revalidatePath(positionPath(seasonYear, position as Position));
  revalidatePath(overallPath(seasonYear));

  return { player: created };
}

export async function deletePlayer(input: {
  playerId: number;
  seasonId: number;
  seasonYear: number;
  position: Position;
}): Promise<{ error?: string }> {
  const { playerId, seasonId, seasonYear, position } = input;
  const db = getDb();

  const [remainingInPosition, remainingOverall] = await Promise.all([
    db.query.players.findMany({
      where: and(eq(players.seasonId, seasonId), eq(players.position, position)),
      orderBy: (p, { asc }) => [asc(p.positionRank)],
    }),
    db.query.players.findMany({
      where: eq(players.seasonId, seasonId),
      orderBy: (p, { asc }) => [asc(p.overallRank)],
    }),
  ]);

  const positionRanks = ranksForOrder(
    remainingInPosition.filter((p) => p.id !== playerId).map((p) => p.id),
  );
  const overallRanks = ranksForOrder(
    remainingOverall.filter((p) => p.id !== playerId).map((p) => p.id),
  );

  const updates = [
    ...positionRanks.map(({ id, rank }) =>
      db.update(players).set({ positionRank: rank }).where(eq(players.id, id)),
    ),
    ...overallRanks.map(({ id, rank }) =>
      db.update(players).set({ overallRank: rank }).where(eq(players.id, id)),
    ),
  ];

  const deleteStmt = db.delete(players).where(eq(players.id, playerId));

  if (updates.length === 0) {
    await deleteStmt;
  } else {
    const [first, ...rest] = updates;
    await db.batch([deleteStmt, first, ...rest]);
  }

  revalidatePath(positionPath(seasonYear, position));
  revalidatePath(overallPath(seasonYear));

  return {};
}

export async function updateTier(input: {
  playerId: number;
  seasonYear: number;
  position: Position;
  tier: PlayerTier | null;
}): Promise<{ error?: string }> {
  const { playerId, seasonYear, position, tier } = input;
  const db = getDb();

  await db.update(players).set({ tier }).where(eq(players.id, playerId));

  revalidatePath(positionPath(seasonYear, position));
  revalidatePath(overallPath(seasonYear));

  return {};
}

export async function updateNotes(input: {
  playerId: number;
  seasonYear: number;
  position: Position;
  notes: string;
}): Promise<{ error?: string }> {
  const { playerId, seasonYear, position, notes } = input;
  const db = getDb();

  await db
    .update(players)
    .set({ notes: notes.length > 0 ? notes : null })
    .where(eq(players.id, playerId));

  revalidatePath(positionPath(seasonYear, position));
  revalidatePath(overallPath(seasonYear));

  return {};
}

export async function setTierBreak(input: {
  playerId: number;
  seasonYear: number;
  context: "position" | "overall";
  position?: Position;
  breakAfter: boolean;
}): Promise<{ error?: string }> {
  const { playerId, seasonYear, context, position, breakAfter } = input;
  const db = getDb();

  await db
    .update(players)
    .set(
      context === "position"
        ? { positionTierBreak: breakAfter }
        : { overallTierBreak: breakAfter },
    )
    .where(eq(players.id, playerId));

  if (context === "position" && position) {
    revalidatePath(positionPath(seasonYear, position));
  } else {
    revalidatePath(overallPath(seasonYear));
  }

  return {};
}

export async function reorderPlayers(input: {
  seasonYear: number;
  context: "position" | "overall";
  position?: Position;
  positionRankLinked?: boolean;
  orderedIds: number[];
}): Promise<{ error?: string }> {
  const { seasonYear, context, position, positionRankLinked, orderedIds } = input;
  if (orderedIds.length === 0) return {};

  const db = getDb();
  const ranks = ranksForOrder(orderedIds);

  const rankUpdates = ranks.map(({ id, rank }) =>
    db
      .update(players)
      .set(context === "position" ? { positionRank: rank } : { overallRank: rank })
      .where(eq(players.id, id)),
  );

  let derivedUpdates: typeof rankUpdates = [];
  if (context === "overall" && positionRankLinked) {
    const rows = await db.query.players.findMany({
      where: inArray(players.id, orderedIds),
      columns: { id: true, position: true },
    });
    const positionById = new Map(rows.map((r) => [r.id, r.position]));
    const derived = derivePositionRanks(
      orderedIds.map((id) => ({ id, position: positionById.get(id)! })),
    );
    derivedUpdates = Array.from(derived, ([id, rank]) =>
      db.update(players).set({ positionRank: rank }).where(eq(players.id, id)),
    );
  }

  const updates = [...rankUpdates, ...derivedUpdates];
  const [first, ...rest] = updates;
  await db.batch([first, ...rest]);

  if (context === "position" && position) {
    revalidatePath(positionPath(seasonYear, position));
  } else {
    revalidatePath(overallPath(seasonYear));
    if (positionRankLinked) {
      for (const p of POSITIONS) revalidatePath(positionPath(seasonYear, p));
    }
  }

  return {};
}
