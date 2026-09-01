"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { nflTeamEnum, players, seasonStarts, users } from "@/lib/db/schema";
import { currentUserId } from "@/lib/auth/current-user";
import type { Position } from "@/lib/positions";

const VALID_TEAMS = new Set<string>(nflTeamEnum.enumValues);

export type UserWithRankings = { id: number; name: string | null; email: string };

export async function listUsersWithRankings(seasonId: number): Promise<UserWithRankings[]> {
  const db = getDb();
  return db
    .selectDistinct({ id: users.id, name: users.name, email: users.email })
    .from(players)
    .innerJoin(users, eq(players.userId, users.id))
    .where(eq(players.seasonId, seasonId));
}

async function markStarted(seasonId: number, userId: number) {
  await getDb().insert(seasonStarts).values({ seasonId, userId }).onConflictDoNothing();
}

export async function startBlank(input: {
  seasonId: number;
  seasonYear: number;
}): Promise<void> {
  const userId = await currentUserId();
  await markStarted(input.seasonId, userId);
  redirect(`/${input.seasonYear}/overall`);
}

export async function startFromCatalog(input: {
  seasonId: number;
  seasonYear: number;
}): Promise<void> {
  const db = getDb();
  const userId = await currentUserId();

  const catalogPlayers = await db.query.playerCatalog.findMany({
    orderBy: (p, { asc }) => [asc(p.name)],
  });
  const eligible = catalogPlayers.filter(
    (p): p is typeof p & { team: string } => !!p.team && VALID_TEAMS.has(p.team),
  );

  if (eligible.length > 0) {
    const positionCounts = new Map<Position, number>();
    const rows = eligible.map((player, index) => {
      const positionRank = (positionCounts.get(player.position) ?? 0) + 1;
      positionCounts.set(player.position, positionRank);
      return {
        seasonId: input.seasonId,
        userId,
        sleeperId: player.sleeperId,
        name: player.name,
        team: player.team as (typeof nflTeamEnum.enumValues)[number],
        position: player.position,
        positionRank,
        overallRank: index + 1,
        photoUrl: player.photoUrl,
      };
    });
    await db.insert(players).values(rows);
  }

  await markStarted(input.seasonId, userId);
  redirect(`/${input.seasonYear}/overall`);
}

export async function startFromUser(input: {
  seasonId: number;
  seasonYear: number;
  sourceUserId: number;
}): Promise<void> {
  const db = getDb();
  const userId = await currentUserId();

  const sourcePlayers = await db.query.players.findMany({
    where: and(eq(players.seasonId, input.seasonId), eq(players.userId, input.sourceUserId)),
  });

  if (sourcePlayers.length > 0) {
    await db.insert(players).values(
      sourcePlayers.map((player) => ({
        seasonId: input.seasonId,
        userId,
        sleeperId: player.sleeperId,
        name: player.name,
        team: player.team,
        position: player.position,
        positionRank: player.positionRank,
        overallRank: player.overallRank,
        tier: player.tier,
        notes: player.notes,
        photoUrl: player.photoUrl,
      })),
    );
  }

  await markStarted(input.seasonId, userId);
  redirect(`/${input.seasonYear}/overall`);
}
