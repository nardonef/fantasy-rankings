import { afterEach, describe, expect, it, vi } from "vitest";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";
import { createSeason, setPositionRankLinked } from "./seasons";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

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

describe("setPositionRankLinked", () => {
  it("recomputes positionRank from the current overall order when linking turns on", async () => {
    const [season] = await db
      .insert(seasons)
      .values({ year: SOURCE_YEAR + 10, positionRankLinked: false })
      .returning();
    createdSeasonIds.push(season.id);

    // deliberately out of sync: overall order is RB One, RB Two, QB One,
    // but positionRank still reflects a stale independent order
    await db.insert(players).values([
      { seasonId: season.id, name: "RB One", team: "BUF", position: "RB", overallRank: 1, positionRank: 2 },
      { seasonId: season.id, name: "RB Two", team: "KC", position: "RB", overallRank: 2, positionRank: 1 },
      { seasonId: season.id, name: "QB One", team: "SF", position: "QB", overallRank: 3, positionRank: 1 },
    ]);

    await setPositionRankLinked({
      seasonId: season.id,
      seasonYear: season.year,
      linked: true,
    });

    const updatedSeason = await db.query.seasons.findFirst({
      where: eq(seasons.id, season.id),
    });
    expect(updatedSeason!.positionRankLinked).toBe(true);

    const rows = await db.query.players.findMany({
      where: eq(players.seasonId, season.id),
    });
    const byName = new Map(rows.map((r) => [r.name, r]));
    expect(byName.get("RB One")!.positionRank).toBe(1);
    expect(byName.get("RB Two")!.positionRank).toBe(2);
    expect(byName.get("QB One")!.positionRank).toBe(1);
  });

  it("only flips the flag, leaving positionRank untouched, when linking turns off", async () => {
    const [season] = await db
      .insert(seasons)
      .values({ year: SOURCE_YEAR + 11, positionRankLinked: true })
      .returning();
    createdSeasonIds.push(season.id);

    const [player] = await db
      .insert(players)
      .values({
        seasonId: season.id,
        name: "Solo QB",
        team: "BUF",
        position: "QB",
        overallRank: 1,
        positionRank: 1,
      })
      .returning();

    await setPositionRankLinked({
      seasonId: season.id,
      seasonYear: season.year,
      linked: false,
    });

    const updatedSeason = await db.query.seasons.findFirst({
      where: eq(seasons.id, season.id),
    });
    expect(updatedSeason!.positionRankLinked).toBe(false);

    const row = await db.query.players.findFirst({ where: eq(players.id, player.id) });
    expect(row!.positionRank).toBe(1);
  });
});
