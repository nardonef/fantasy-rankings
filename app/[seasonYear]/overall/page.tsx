import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { players, seasons, seasonStarts } from "@/lib/db/schema";
import { RankingList } from "@/components/ranking/ranking-list";
import { currentUserId } from "@/lib/auth/current-user";
import { StartingRankingsPicker } from "@/components/season/starting-rankings-picker";

export default async function OverallPage({
  params,
}: {
  params: Promise<{ seasonYear: string }>;
}) {
  const { seasonYear } = await params;
  const year = Number(seasonYear);
  const db = getDb();
  const season = await db.query.seasons.findFirst({
    where: eq(seasons.year, year),
  });
  if (!season) notFound();

  const userId = await currentUserId();
  const [allPlayers, started] = await Promise.all([
    db.query.players.findMany({
      where: and(eq(players.seasonId, season.id), eq(players.userId, userId)),
      orderBy: [asc(players.overallRank)],
    }),
    db.query.seasonStarts.findFirst({
      where: and(eq(seasonStarts.seasonId, season.id), eq(seasonStarts.userId, userId)),
    }),
  ]);

  if (allPlayers.length === 0 && !started) {
    return <StartingRankingsPicker seasonId={season.id} seasonYear={year} />;
  }

  return (
    <RankingList
      context="overall"
      seasonId={season.id}
      seasonYear={year}
      positionRankLinked={season.positionRankLinked}
      initialPlayers={allPlayers}
    />
  );
}
