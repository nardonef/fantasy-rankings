import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";
import { segmentToPosition } from "@/lib/positions";
import { RankingList } from "@/components/ranking/ranking-list";
import { currentUserId } from "@/lib/auth/current-user";

export default async function PositionPage({
  params,
}: {
  params: Promise<{ seasonYear: string; position: string }>;
}) {
  const { seasonYear, position: positionSegment } = await params;
  const position = segmentToPosition(positionSegment);
  if (!position) notFound();

  const year = Number(seasonYear);
  const db = getDb();
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.year, year),
  });
  if (!season) notFound();

  const userId = await currentUserId();
  const positionPlayers = await db.query.players.findMany({
    where: and(
      eq(players.seasonId, season.id),
      eq(players.userId, userId),
      eq(players.position, position),
    ),
    orderBy: [asc(players.positionRank)],
  });

  return (
    <RankingList
      context="position"
      seasonId={season.id}
      seasonYear={year}
      position={position}
      positionRankLinked={season.positionRankLinked}
      initialPlayers={positionPlayers}
    />
  );
}
