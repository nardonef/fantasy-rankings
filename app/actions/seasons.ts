"use server";

import { and, eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";
import { derivePositionRanks } from "@/lib/ranking";
import { POSITIONS } from "@/lib/positions";
import { currentUserId } from "@/lib/auth/current-user";

export async function createSeason(
  _prevState: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const yearRaw = formData.get("year");
  const copyFromSeasonIdRaw = formData.get("copyFromSeasonId");

  const year = Number(yearRaw);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return { error: "Enter a valid year." };
  }

  const db = getDb();

  const existing = await db.query.seasons.findFirst({
    where: eq(seasons.year, year),
  });
  if (existing) {
    return { error: `A ${year} season already exists.` };
  }

  const hasCopySource =
    typeof copyFromSeasonIdRaw === "string" && copyFromSeasonIdRaw.length > 0;
  const copyFromSeasonId = hasCopySource ? Number(copyFromSeasonIdRaw) : null;
  const sourceSeason = copyFromSeasonId
    ? await db.query.seasons.findFirst({ where: eq(seasons.id, copyFromSeasonId) })
    : null;

  const [newSeason] = await db
    .insert(seasons)
    .values({
      year,
      ...(sourceSeason ? { positionRankLinked: sourceSeason.positionRankLinked } : {}),
    })
    .returning();

  if (copyFromSeasonId) {
    const userId = await currentUserId();
    const sourcePlayers = await db.query.players.findMany({
      where: and(eq(players.seasonId, copyFromSeasonId), eq(players.userId, userId)),
      orderBy: [asc(players.overallRank)],
    });

    if (sourcePlayers.length > 0) {
      await db.insert(players).values(
        sourcePlayers.map((player) => ({
          seasonId: newSeason.id,
          userId,
          sleeperId: player.sleeperId,
          name: player.name,
          team: player.team,
          position: player.position,
          positionRank: player.positionRank,
          overallRank: player.overallRank,
          tier: player.tier,
          notes: player.notes,
        })),
      );
    }
  }

  redirect(`/${newSeason.year}/overall`);
}

export async function setPositionRankLinked(input: {
  seasonId: number;
  seasonYear: number;
  linked: boolean;
}): Promise<{ error?: string }> {
  const { seasonId, seasonYear, linked } = input;
  const db = getDb();
  const userId = await currentUserId();

  if (linked) {
    const seasonPlayers = await db.query.players.findMany({
      where: and(eq(players.seasonId, seasonId), eq(players.userId, userId)),
      orderBy: [asc(players.overallRank)],
    });
    const derived = derivePositionRanks(seasonPlayers);

    const rankUpdates = seasonPlayers
      .filter((p) => derived.get(p.id) !== p.positionRank)
      .map((p) =>
        db
          .update(players)
          .set({ positionRank: derived.get(p.id)! })
          .where(and(eq(players.id, p.id), eq(players.userId, userId))),
      );
    const flagUpdate = db
      .update(seasons)
      .set({ positionRankLinked: true })
      .where(eq(seasons.id, seasonId));

    if (rankUpdates.length === 0) {
      await flagUpdate;
    } else {
      const [first, ...rest] = rankUpdates;
      await db.batch([flagUpdate, first, ...rest]);
    }
  } else {
    await db
      .update(seasons)
      .set({ positionRankLinked: false })
      .where(eq(seasons.id, seasonId));
  }

  revalidatePath(`/${seasonYear}/overall`);
  for (const position of POSITIONS) {
    revalidatePath(`/${seasonYear}/${position.toLowerCase()}`);
  }

  return {};
}
