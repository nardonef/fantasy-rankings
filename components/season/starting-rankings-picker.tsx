import { Button } from "@/components/ui/button";
import {
  listUsersWithRankings,
  startBlank,
  startFromCatalog,
  startFromUser,
} from "@/app/actions/starting-rankings";

export async function StartingRankingsPicker({
  seasonId,
  seasonYear,
}: {
  seasonId: number;
  seasonYear: number;
}) {
  const usersWithRankings = await listUsersWithRankings(seasonId);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          Start your {seasonYear} rankings
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          You don&apos;t have rankings for this season yet. Choose how to start.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-3">
        <form action={startBlank.bind(null, { seasonId, seasonYear })}>
          <Button type="submit" variant="outline" className="w-full justify-start">
            Start blank
          </Button>
        </form>
        <form action={startFromCatalog.bind(null, { seasonId, seasonYear })}>
          <Button type="submit" variant="outline" className="w-full justify-start">
            Start from the full player list (unranked)
          </Button>
        </form>
        {usersWithRankings.map((user) => (
          <form
            key={user.id}
            action={startFromUser.bind(null, { seasonId, seasonYear, sourceUserId: user.id })}
          >
            <Button type="submit" variant="outline" className="w-full justify-start">
              Copy {user.name ?? user.email}&apos;s rankings
            </Button>
          </form>
        ))}
      </div>
    </main>
  );
}
