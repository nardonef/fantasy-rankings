"use server";

import { eq, asc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";

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

  const [newSeason] = await db.insert(seasons).values({ year }).returning();

  if (
    typeof copyFromSeasonIdRaw === "string" &&
    copyFromSeasonIdRaw.length > 0
  ) {
    const copyFromSeasonId = Number(copyFromSeasonIdRaw);
    const sourcePlayers = await db.query.players.findMany({
      where: eq(players.seasonId, copyFromSeasonId),
      orderBy: [asc(players.overallRank)],
    });

    if (sourcePlayers.length > 0) {
      await db.insert(players).values(
        sourcePlayers.map((player) => ({
          seasonId: newSeason.id,
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
