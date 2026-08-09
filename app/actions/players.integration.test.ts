import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { players, seasons } from "@/lib/db/schema";
import {
  createPlayer,
  deletePlayer,
  reorderPlayers,
  updateNotes,
  updateTier,
} from "./players";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const TEST_YEAR = 2091;
const db = getDb();

function playerFormData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) fd.set(key, value);
  return fd;
}

async function addPlayer(
  seasonId: number,
  name: string,
  position: "QB" | "RB" | "WR" | "TE" = "QB",
  team = "BUF",
) {
  const result = await createPlayer(
    undefined,
    playerFormData({
      seasonId: String(seasonId),
      seasonYear: String(TEST_YEAR),
      name,
      team,
      position,
    }),
  );
  if (!result.player) throw new Error("createPlayer failed in test setup");
  return result.player;
}

let seasonId: number;

beforeEach(async () => {
  const [season] = await db.insert(seasons).values({ year: TEST_YEAR }).returning();
  seasonId = season.id;
});

afterEach(async () => {
  await db.delete(seasons).where(eq(seasons.id, seasonId));
});

describe("createPlayer", () => {
  it("appends new players to the end of both the position and overall order", async () => {
    const p1 = await addPlayer(seasonId, "Player One", "QB");
    const p2 = await addPlayer(seasonId, "Player Two", "QB");
    const p3 = await addPlayer(seasonId, "Player Three", "RB");

    expect(p1.positionRank).toBe(1);
    expect(p2.positionRank).toBe(2);
    expect(p3.positionRank).toBe(1); // first RB, separate position sequence

    expect(p1.overallRank).toBe(1);
    expect(p2.overallRank).toBe(2);
    expect(p3.overallRank).toBe(3);
  });
});

describe("reorderPlayers", () => {
  it("reordering in position context only touches positionRank, not overallRank or other positions", async () => {
    const qb1 = await addPlayer(seasonId, "QB One", "QB");
    const qb2 = await addPlayer(seasonId, "QB Two", "QB");
    const rb1 = await addPlayer(seasonId, "RB One", "RB");

    await reorderPlayers({
      seasonYear: TEST_YEAR,
      context: "position",
      position: "QB",
      orderedIds: [qb2.id, qb1.id],
    });

    const rows = await db.query.players.findMany({
      where: eq(players.seasonId, seasonId),
      orderBy: [asc(players.id)],
    });
    const byId = new Map(rows.map((r) => [r.id, r]));

    expect(byId.get(qb2.id)!.positionRank).toBe(1);
    expect(byId.get(qb1.id)!.positionRank).toBe(2);
    // overallRank untouched by a position-context reorder
    expect(byId.get(qb1.id)!.overallRank).toBe(qb1.overallRank);
    expect(byId.get(qb2.id)!.overallRank).toBe(qb2.overallRank);
    // the other position's rank is untouched
    expect(byId.get(rb1.id)!.positionRank).toBe(1);
  });

  it("reordering in overall context leaves positionRank untouched when the season is unlinked", async () => {
    const qb1 = await addPlayer(seasonId, "QB One", "QB");
    const rb1 = await addPlayer(seasonId, "RB One", "RB");

    await reorderPlayers({
      seasonYear: TEST_YEAR,
      context: "overall",
      positionRankLinked: false,
      orderedIds: [rb1.id, qb1.id],
    });

    const rows = await db.query.players.findMany({
      where: eq(players.seasonId, seasonId),
      orderBy: [asc(players.id)],
    });
    const byId = new Map(rows.map((r) => [r.id, r]));

    expect(byId.get(rb1.id)!.overallRank).toBe(1);
    expect(byId.get(qb1.id)!.overallRank).toBe(2);
    // positionRank untouched when unlinked
    expect(byId.get(qb1.id)!.positionRank).toBe(qb1.positionRank);
    expect(byId.get(rb1.id)!.positionRank).toBe(rb1.positionRank);
  });

  it("reordering in overall context also re-derives positionRank when the season is linked", async () => {
    const rb1 = await addPlayer(seasonId, "RB One", "RB");
    const rb2 = await addPlayer(seasonId, "RB Two", "RB");
    const qb1 = await addPlayer(seasonId, "QB One", "QB");
    // initial overall order: rb1, rb2, qb1 -> positionRank rb1=1, rb2=2, qb1=1
    expect(rb1.positionRank).toBe(1);
    expect(rb2.positionRank).toBe(2);

    await reorderPlayers({
      seasonYear: TEST_YEAR,
      context: "overall",
      positionRankLinked: true,
      orderedIds: [rb2.id, rb1.id, qb1.id], // swap the two RBs
    });

    const rows = await db.query.players.findMany({
      where: eq(players.seasonId, seasonId),
      orderBy: [asc(players.id)],
    });
    const byId = new Map(rows.map((r) => [r.id, r]));

    expect(byId.get(rb2.id)!.overallRank).toBe(1);
    expect(byId.get(rb1.id)!.overallRank).toBe(2);
    expect(byId.get(qb1.id)!.overallRank).toBe(3);
    // positionRank re-derived to match the new overall order
    expect(byId.get(rb2.id)!.positionRank).toBe(1);
    expect(byId.get(rb1.id)!.positionRank).toBe(2);
    expect(byId.get(qb1.id)!.positionRank).toBe(1);
  });
});

describe("updateTier / updateNotes", () => {
  it("updateTier changes only the tier column", async () => {
    const p1 = await addPlayer(seasonId, "Player One", "QB");

    await updateTier({
      playerId: p1.id,
      seasonYear: TEST_YEAR,
      position: "QB",
      tier: "green",
    });

    const row = await db.query.players.findFirst({ where: eq(players.id, p1.id) });
    expect(row!.tier).toBe("green");
    expect(row!.positionRank).toBe(p1.positionRank);
    expect(row!.overallRank).toBe(p1.overallRank);
  });

  it("updateNotes changes only the notes column, and stores empty string as null", async () => {
    const p1 = await addPlayer(seasonId, "Player One", "QB");

    await updateNotes({
      playerId: p1.id,
      seasonYear: TEST_YEAR,
      position: "QB",
      notes: "Sleeper pick",
    });
    let row = await db.query.players.findFirst({ where: eq(players.id, p1.id) });
    expect(row!.notes).toBe("Sleeper pick");
    expect(row!.positionRank).toBe(p1.positionRank);

    await updateNotes({
      playerId: p1.id,
      seasonYear: TEST_YEAR,
      position: "QB",
      notes: "",
    });
    row = await db.query.players.findFirst({ where: eq(players.id, p1.id) });
    expect(row!.notes).toBeNull();
  });
});

describe("deletePlayer", () => {
  it("reindexes remaining players in both position and overall order with no gaps", async () => {
    const qb1 = await addPlayer(seasonId, "QB One", "QB");
    const qb2 = await addPlayer(seasonId, "QB Two", "QB");
    const qb3 = await addPlayer(seasonId, "QB Three", "QB");

    await deletePlayer({
      playerId: qb2.id,
      seasonId,
      seasonYear: TEST_YEAR,
      position: "QB",
    });

    const rows = await db.query.players.findMany({
      where: eq(players.seasonId, seasonId),
      orderBy: [asc(players.positionRank)],
    });

    expect(rows.map((r) => r.id)).toEqual([qb1.id, qb3.id]);
    expect(rows.map((r) => r.positionRank)).toEqual([1, 2]);
    expect(rows.map((r) => r.overallRank)).toEqual([1, 2]);
  });
});
