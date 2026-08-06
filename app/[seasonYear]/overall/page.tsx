import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";
import { RankingList } from "@/components/ranking/ranking-list";

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

  const allPlayers = await db.query.players.findMany({
    where: eq(players.seasonId, season.id),
    orderBy: [asc(players.overallRank)],
  });

  return (
    <RankingList
      context="overall"
      seasonId={season.id}
      seasonYear={year}
      initialPlayers={allPlayers}
    />
  );
}
