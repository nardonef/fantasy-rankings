import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { getDb } from "@/lib/db";
import { seasons } from "@/lib/db/schema";
import { SeasonSelector } from "@/components/season/season-selector";
import { PositionRankLinkToggle } from "@/components/season/position-rank-link-toggle";
import { NavTabs } from "@/components/nav/nav-tabs";

export default async function SeasonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ seasonYear: string }>;
}) {
  const { seasonYear } = await params;
  const year = Number(seasonYear);
  if (!Number.isInteger(year)) notFound();

  const db = getDb();
  const [currentSeason, allSeasons] = await Promise.all([
    db.query.seasons.findFirst({ where: eq(seasons.year, year) }),
    db.query.seasons.findMany({ orderBy: [desc(seasons.year)] }),
  ]);

  if (!currentSeason) notFound();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold tracking-tight">
            Fantasy Rankings
          </span>
          <SeasonSelector seasons={allSeasons} currentYear={year} />
          <PositionRankLinkToggle
            seasonId={currentSeason.id}
            seasonYear={year}
            linked={currentSeason.positionRankLinked}
          />
        </div>
        <div className="flex items-center gap-4">
          <NavTabs year={year} />
          <UserButton />
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
