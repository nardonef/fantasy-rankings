import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { asc, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { draftedPlayers, draftSessions, players, seasons } from "@/lib/db/schema";
import { markDrafted, startDraft } from "./draft";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const TEST_YEAR = 2081;
const db = getDb();

async function addPlayer(
  seasonId: number,
  name: string,
  overallRank: number,
  position: "QB" | "RB" | "WR" | "TE" = "QB",
  positionRank = overallRank,
) {
  const [player] = await db
    .insert(players)
    .values({
      seasonId,
      name,
      team: "BUF",
      position,
      overallRank,
      positionRank,
    })
    .returning();
  return player;
}

let seasonId: number;

beforeEach(async () => {
  const [season] = await db.insert(seasons).values({ year: TEST_YEAR }).returning();
  seasonId = season.id;
});

afterEach(async () => {
  await db.delete(seasons).where(eq(seasons.id, seasonId));
});

describe("draftSessions/draftedPlayers schema constraints", () => {
  it("enforces one draft session per season", async () => {
    await db.insert(draftSessions).values({ seasonId });

    await expect(
      db.insert(draftSessions).values({ seasonId }),
    ).rejects.toThrow();
  });

  it("cascades drafted_players deletion when the draft session is deleted", async () => {
    const player = await addPlayer(seasonId, "Cascade Player", 1);
    const [session] = await db.insert(draftSessions).values({ seasonId }).returning();
    const [row] = await db
      .insert(draftedPlayers)
      .values({
        draftSessionId: session.id,
        playerId: player.id,
        position: "QB",
        overallRank: 1,
        positionRank: 1,
      })
      .returning();

    await db.delete(draftSessions).where(eq(draftSessions.id, session.id));

    const remaining = await db.query.draftedPlayers.findFirst({
      where: eq(draftedPlayers.id, row.id),
    });
    expect(remaining).toBeUndefined();
  });

  it("cascades drafted_players deletion when the source player is deleted", async () => {
    const player = await addPlayer(seasonId, "Cascade Player", 1);
    const [session] = await db.insert(draftSessions).values({ seasonId }).returning();
    const [row] = await db
      .insert(draftedPlayers)
      .values({
        draftSessionId: session.id,
        playerId: player.id,
        position: "QB",
        overallRank: 1,
        positionRank: 1,
      })
      .returning();

    await db.delete(players).where(eq(players.id, player.id));

    const remaining = await db.query.draftedPlayers.findFirst({
      where: eq(draftedPlayers.id, row.id),
    });
    expect(remaining).toBeUndefined();
  });
});

describe("startDraft", () => {
  it("snapshots current player ranks into a new draft session", async () => {
    const qb1 = await addPlayer(seasonId, "QB One", 1, "QB", 1);
    const rb1 = await addPlayer(seasonId, "RB One", 2, "RB", 1);

    await startDraft({ seasonId, seasonYear: TEST_YEAR });

    const session = await db.query.draftSessions.findFirst({
      where: eq(draftSessions.seasonId, seasonId),
    });
    expect(session).toBeDefined();

    const rows = await db.query.draftedPlayers.findMany({
      where: eq(draftedPlayers.draftSessionId, session!.id),
      orderBy: [asc(draftedPlayers.overallRank)],
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      playerId: qb1.id,
      position: "QB",
      overallRank: 1,
      positionRank: 1,
      draftedAt: null,
    });
    expect(rows[1]).toMatchObject({
      playerId: rb1.id,
      position: "RB",
      overallRank: 2,
      positionRank: 1,
      draftedAt: null,
    });
  });

  it("replaces any existing session, re-snapshotting from the current ranking and clearing prior drafted marks", async () => {
    const qb1 = await addPlayer(seasonId, "QB One", 1, "QB", 1);
    const rb1 = await addPlayer(seasonId, "RB One", 2, "RB", 1);

    await startDraft({ seasonId, seasonYear: TEST_YEAR });
    const firstSession = await db.query.draftSessions.findFirst({
      where: eq(draftSessions.seasonId, seasonId),
    });
    const firstDraftedRow = await db.query.draftedPlayers.findFirst({
      where: eq(draftedPlayers.draftSessionId, firstSession!.id),
    });
    await markDrafted({
      draftedPlayerId: firstDraftedRow!.id,
      seasonYear: TEST_YEAR,
      drafted: true,
    });

    // master ranking changes after the first snapshot
    await db.update(players).set({ overallRank: 1 }).where(eq(players.id, rb1.id));
    await db.update(players).set({ overallRank: 2 }).where(eq(players.id, qb1.id));

    await startDraft({ seasonId, seasonYear: TEST_YEAR });

    const secondSession = await db.query.draftSessions.findFirst({
      where: eq(draftSessions.seasonId, seasonId),
    });
    expect(secondSession!.id).not.toBe(firstSession!.id);

    const oldSessionRows = await db.query.draftedPlayers.findMany({
      where: eq(draftedPlayers.draftSessionId, firstSession!.id),
    });
    expect(oldSessionRows).toHaveLength(0);

    const rows = await db.query.draftedPlayers.findMany({
      where: eq(draftedPlayers.draftSessionId, secondSession!.id),
      orderBy: [asc(draftedPlayers.overallRank)],
    });
    expect(rows.map((r) => r.playerId)).toEqual([rb1.id, qb1.id]);
    expect(rows.every((r) => r.draftedAt === null)).toBe(true);
  });
});

describe("markDrafted", () => {
  it("sets and clears draftedAt for undo", async () => {
    const qb1 = await addPlayer(seasonId, "QB One", 1, "QB", 1);
    await startDraft({ seasonId, seasonYear: TEST_YEAR });
    const session = await db.query.draftSessions.findFirst({
      where: eq(draftSessions.seasonId, seasonId),
    });
    const row = await db.query.draftedPlayers.findFirst({
      where: eq(draftedPlayers.draftSessionId, session!.id),
    });
    expect(row!.playerId).toBe(qb1.id);
    expect(row!.draftedAt).toBeNull();

    await markDrafted({ draftedPlayerId: row!.id, seasonYear: TEST_YEAR, drafted: true });
    let updated = await db.query.draftedPlayers.findFirst({
      where: eq(draftedPlayers.id, row!.id),
    });
    expect(updated!.draftedAt).not.toBeNull();

    await markDrafted({ draftedPlayerId: row!.id, seasonYear: TEST_YEAR, drafted: false });
    updated = await db.query.draftedPlayers.findFirst({
      where: eq(draftedPlayers.id, row!.id),
    });
    expect(updated!.draftedAt).toBeNull();
  });
});
