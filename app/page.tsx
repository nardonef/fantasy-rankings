import { desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { getDb } from "@/lib/db";
import { seasons } from "@/lib/db/schema";
import { UserButton } from "@clerk/nextjs";
import { NewSeasonDialog } from "@/components/season/new-season-dialog";

export default async function RootPage() {
  const db = getDb();
  const latestSeason = await db.query.seasons.findFirst({
    orderBy: [desc(seasons.year)],
  });

  if (latestSeason) {
    redirect(`/${latestSeason.year}/overall`);
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Fantasy Rankings
        </h1>
        <p className="text-sm text-muted-foreground">
          No seasons yet. Create one to get started.
        </p>
      </div>
      <NewSeasonDialog seasons={[]} />
      <UserButton />
    </main>
  );
}
