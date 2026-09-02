import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { seasons } from "@/lib/db/schema";
import { segmentToPosition } from "@/lib/positions";
import { getDraftPlayers, getDraftSession } from "@/lib/draft";
import { DraftControls } from "@/components/draft/draft-controls";
import { DraftView } from "@/components/draft/draft-view";

export default async function DraftPositionPage({
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

  const session = await getDraftSession(season.id);
  const draftPlayers = session
    ? await getDraftPlayers(session.id, { context: "position", position })
    : [];

  const controls = (
    <DraftControls seasonId={season.id} seasonYear={year} hasSession={!!session} />
  );

  return session ? (
    <DraftView
      key={session.id}
      seasonYear={year}
      context="position"
      position={position}
      initialPlayers={draftPlayers}
      controls={controls}
    />
  ) : (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">{controls}</div>
      <p className="rounded-xl border border-border p-12 text-center text-sm text-muted-foreground">
        No draft started yet for {year}. Start one to snapshot your current
        rankings.
      </p>
    </div>
  );
}
