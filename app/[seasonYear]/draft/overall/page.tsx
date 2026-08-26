import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { seasons } from "@/lib/db/schema";
import { getDraftPlayers, getDraftSession } from "@/lib/draft";
import { DraftControls } from "@/components/draft/draft-controls";
import { DraftView } from "@/components/draft/draft-view";

export default async function DraftOverallPage({
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

  const session = await getDraftSession(season.id);
  const draftPlayers = session
    ? await getDraftPlayers(session.id, { context: "overall" })
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <DraftControls seasonId={season.id} seasonYear={year} hasSession={!!session} />
      </div>
      {session ? (
        <DraftView
          key={session.id}
          seasonYear={year}
          context="overall"
          initialPlayers={draftPlayers}
        />
      ) : (
        <p className="rounded-md border border-dashed py-12 text-center text-sm text-muted-foreground">
          No draft started yet for {year}. Start one to snapshot your current
          rankings.
        </p>
      )}
    </div>
  );
}
