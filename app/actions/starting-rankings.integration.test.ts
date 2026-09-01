import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { players, playerCatalog, seasonStarts, seasons, users } from "@/lib/db/schema";
import { createTestUser } from "@/lib/test/fixtures";
import { currentUserId } from "@/lib/auth/current-user";
import {
  listUsersWithRankings,
  startBlank,
  startFromCatalog,
  startFromUser,
} from "./starting-rankings";

vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/lib/auth/current-user", () => ({ currentUserId: vi.fn() }));

const TEST_YEAR = 2071;
const db = getDb();

let seasonId: number;
let userId: number;
// Cleanup lists rather than inline deletes at the end of a test body — a failed
// assertion would otherwise skip cleanup and leak rows into the shared database.
let extraUserIds: number[];
let catalogSleeperIds: string[];

beforeEach(async () => {
  const user = await createTestUser();
  userId = user.id;
  vi.mocked(currentUserId).mockResolvedValue(userId);
  extraUserIds = [];
  catalogSleeperIds = [];

  const [season] = await db.insert(seasons).values({ year: TEST_YEAR }).returning();
  seasonId = season.id;
});

afterEach(async () => {
  await db.delete(seasons).where(eq(seasons.id, seasonId));
  await db.delete(users).where(eq(users.id, userId));
  if (extraUserIds.length > 0) {
    await db.delete(users).where(inArray(users.id, extraUserIds));
  }
  if (catalogSleeperIds.length > 0) {
    await db.delete(playerCatalog).where(inArray(playerCatalog.sleeperId, catalogSleeperIds));
  }
});

describe("startBlank", () => {
  it("records that the user started this season without creating any players", async () => {
    await startBlank({ seasonId, seasonYear: TEST_YEAR });

    const rows = await db.query.players.findMany({ where: eq(players.seasonId, seasonId) });
    expect(rows).toHaveLength(0);

    const started = await db.query.seasonStarts.findFirst({
      where: eq(seasonStarts.seasonId, seasonId),
    });
    expect(started).toBeDefined();
    expect(started!.userId).toBe(userId);
  });
});

describe("startFromCatalog", () => {
  // The player catalog is a shared, already-populated table in this environment (real
  // seed data), so these assertions look for the specific rows this test contributed
  // rather than asserting an exact total count for the season.
  it("seeds unranked players from the player catalog, scoped to the current user", async () => {
    catalogSleeperIds.push("cat-1", "cat-2");
    await db.insert(playerCatalog).values([
      { sleeperId: "cat-1", name: "Catalog QB", team: "BUF", position: "QB" },
      { sleeperId: "cat-2", name: "Catalog RB", team: "KC", position: "RB" },
    ]);

    await startFromCatalog({ seasonId, seasonYear: TEST_YEAR });

    const rows = await db.query.players.findMany({ where: eq(players.seasonId, seasonId) });
    const mine = rows.filter((r) => catalogSleeperIds.includes(r.sleeperId ?? ""));
    expect(mine).toHaveLength(2);
    expect(mine.every((r) => r.userId === userId)).toBe(true);
    expect(mine.every((r) => r.tier === null)).toBe(true);
    expect(mine.every((r) => r.notes === null)).toBe(true);
  });

  it("skips catalog entries with no team on file", async () => {
    catalogSleeperIds.push("cat-3");
    await db.insert(playerCatalog).values([
      { sleeperId: "cat-3", name: "No Team WR", team: null, position: "WR" },
    ]);

    await startFromCatalog({ seasonId, seasonYear: TEST_YEAR });

    const rows = await db.query.players.findMany({ where: eq(players.seasonId, seasonId) });
    expect(rows.some((r) => r.sleeperId === "cat-3")).toBe(false);
  });
});

describe("startFromUser / listUsersWithRankings", () => {
  it("copies another user's rankings for the season and lists that user as a source", async () => {
    const sourceUser = await createTestUser();
    extraUserIds.push(sourceUser.id);
    await db.insert(players).values({
      seasonId,
      userId: sourceUser.id,
      name: "Source Player",
      team: "BUF",
      position: "QB",
      positionRank: 1,
      overallRank: 1,
      tier: "green",
      notes: "keep this",
    });

    const sources = await listUsersWithRankings(seasonId);
    expect(sources.map((s) => s.id)).toContain(sourceUser.id);

    await startFromUser({ seasonId, seasonYear: TEST_YEAR, sourceUserId: sourceUser.id });

    const copied = await db.query.players.findMany({
      where: eq(players.seasonId, seasonId),
    });
    const mine = copied.filter((p) => p.userId === userId);
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({
      name: "Source Player",
      tier: "green",
      notes: "keep this",
    });

    // the source user's own rows are untouched
    const sourceRows = copied.filter((p) => p.userId === sourceUser.id);
    expect(sourceRows).toHaveLength(1);
  });
});
