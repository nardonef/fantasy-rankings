import { afterEach, describe, expect, it, vi } from "vitest";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";
import { createSeason } from "./seasons";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const SOURCE_YEAR = 2092;
const NEW_YEAR = 2093;
const DUPLICATE_YEAR = 2094;
const db = getDb();

const createdSeasonIds: number[] = [];

afterEach(async () => {
  while (createdSeasonIds.length > 0) {
    const id = createdSeasonIds.pop()!;
    await db.delete(seasons).where(eq(seasons.id, id));
  }
});

describe("seasons schema constraints", () => {
  it("enforces year uniqueness", async () => {
    const [season] = await db
      .insert(seasons)
      .values({ year: DUPLICATE_YEAR })
      .returning();
    createdSeasonIds.push(season.id);

    await expect(
      db.insert(seasons).values({ year: DUPLICATE_YEAR }),
    ).rejects.toThrow();
  });

  it("cascades player deletion when a season is deleted", async () => {
    const [season] = await db
      .insert(seasons)
      .values({ year: SOURCE_YEAR })
      .returning();
    const [player] = await db
      .insert(players)
      .values({
        seasonId: season.id,
        name: "Cascade Test",
        team: "BUF",
        position: "QB",
        positionRank: 1,
        overallRank: 1,
      })
      .returning();

    await db.delete(seasons).where(eq(seasons.id, season.id));

    const remaining = await db.query.players.findFirst({
      where: eq(players.id, player.id),
    });
    expect(remaining).toBeUndefined();
  });
});

describe("createSeason with copy-from-previous", () => {
  it("clones players into the new season without mutating the source", async () => {
    const [sourceSeason] = await db
      .insert(seasons)
      .values({ year: SOURCE_YEAR + 1 })
      .returning();
    createdSeasonIds.push(sourceSeason.id);

    await db.insert(players).values([
      {
        seasonId: sourceSeason.id,
        name: "Clone Source One",
        team: "BUF",
        position: "QB",
        positionRank: 1,
        overallRank: 1,
        tier: "green",
        notes: "keep this",
      },
      {
        seasonId: sourceSeason.id,
        name: "Clone Source Two",
        team: "KC",
        position: "QB",
        positionRank: 2,
        overallRank: 2,
      },
    ]);

    const fd = new FormData();
    fd.set("year", String(NEW_YEAR));
    fd.set("copyFromSeasonId", String(sourceSeason.id));
    await createSeason(undefined, fd);

    const newSeason = await db.query.seasons.findFirst({
      where: eq(seasons.year, NEW_YEAR),
    });
    expect(newSeason).toBeDefined();
    createdSeasonIds.push(newSeason!.id);

    const clonedPlayers = await db.query.players.findMany({
      where: eq(players.seasonId, newSeason!.id),
      orderBy: [asc(players.positionRank)],
    });
    expect(clonedPlayers).toHaveLength(2);
    expect(clonedPlayers[0]).toMatchObject({
      name: "Clone Source One",
      tier: "green",
      notes: "keep this",
      positionRank: 1,
      overallRank: 1,
    });

    // source season's players are untouched
    const sourcePlayers = await db.query.players.findMany({
      where: eq(players.seasonId, sourceSeason.id),
    });
    expect(sourcePlayers).toHaveLength(2);
  });
});
