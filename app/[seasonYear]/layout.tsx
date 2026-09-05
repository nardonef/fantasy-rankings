import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/db";
import { seasons } from "@/lib/db/schema";
import { SeasonMenu } from "@/components/season/season-menu";
import { NavTabs } from "@/components/nav/nav-tabs";
import { BrandMark } from "@/components/brand-mark";
import { UserMenu } from "@/components/user-menu";

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
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline px-4 py-3.5 sm:px-7">
        <div className="flex flex-wrap items-center gap-4">
          <Link href={`/${year}/overall`} className="flex items-center gap-2">
            <BrandMark />
            <span className="text-sm font-semibold tracking-[-0.01em]">
              Fantasy Rankings
            </span>
          </Link>
          <SeasonMenu
            seasons={allSeasons}
            currentYear={year}
            seasonId={currentSeason.id}
            positionRankLinked={currentSeason.positionRankLinked}
          />
        </div>
        <div className="flex items-center gap-4">
          <NavTabs year={year} />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
