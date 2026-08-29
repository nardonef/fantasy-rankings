import { and, asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { draftedPlayers, draftSessions, players } from "@/lib/db/schema";
import type { PlayerRecord } from "@/app/actions/players";
import type { Position } from "@/lib/positions";

export type DraftPlayerRecord = {
  draftedPlayerId: number;
  draftedAt: Date | null;
  overallRank: number;
  positionRank: number;
  position: Position;
  player: PlayerRecord;
};

export async function getDraftSession(seasonId: number) {
  const db = getDb();
  return db.query.draftSessions.findFirst({
    where: eq(draftSessions.seasonId, seasonId),
  });
}

export async function getDraftPlayers(
  draftSessionId: number,
  filter: { context: "overall" } | { context: "position"; position: Position },
): Promise<DraftPlayerRecord[]> {
  const db = getDb();
  const where =
    filter.context === "position"
      ? and(
          eq(draftedPlayers.draftSessionId, draftSessionId),
          eq(draftedPlayers.position, filter.position),
        )
      : eq(draftedPlayers.draftSessionId, draftSessionId);

  return db
    .select({
      draftedPlayerId: draftedPlayers.id,
      draftedAt: draftedPlayers.draftedAt,
      overallRank: draftedPlayers.overallRank,
      positionRank: draftedPlayers.positionRank,
      position: draftedPlayers.position,
      player: players,
    })
    .from(draftedPlayers)
    .innerJoin(players, eq(draftedPlayers.playerId, players.id))
    .where(where)
    .orderBy(
      filter.context === "overall"
        ? asc(draftedPlayers.overallRank)
        : asc(draftedPlayers.positionRank),
    );
}
