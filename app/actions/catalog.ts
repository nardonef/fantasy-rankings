"use server";

import { getDb } from "@/lib/db";
import { playerCatalog } from "@/lib/db/schema";
import type { Position } from "@/lib/positions";

export type CatalogPlayer = typeof playerCatalog.$inferSelect;

const SLEEPER_POSITIONS = new Set(["QB", "RB", "WR", "TE"]);

interface SleeperPlayer {
  player_id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  team: string | null;
  position: string | null;
  active: boolean;
}

export async function getPlayerCatalog(): Promise<CatalogPlayer[]> {
  const db = getDb();
  return db.query.playerCatalog.findMany({
    orderBy: (p, { asc }) => [asc(p.name)],
  });
}

export async function refreshPlayerCatalog(): Promise<{
  error?: string;
  count?: number;
}> {
  let players: Record<string, SleeperPlayer>;
  try {
    const response = await fetch("https://api.sleeper.app/v1/players/nfl", {
      cache: "no-store",
    });
    if (!response.ok) {
      return { error: `Sleeper API returned ${response.status}.` };
    }
    players = await response.json();
  } catch {
    return { error: "Couldn't reach the Sleeper player API." };
  }

  const rows = Object.values(players)
    .filter(
      (p): p is SleeperPlayer =>
        p.active === true &&
        !!p.team &&
        !!p.position &&
        SLEEPER_POSITIONS.has(p.position),
    )
    .map((p) => {
      const name = p.full_name ?? [p.first_name, p.last_name].filter(Boolean).join(" ");
      if (!name) return null;
      return {
        sleeperId: p.player_id,
        name,
        team: p.team,
        position: p.position as Position,
        photoUrl: `https://sleepercdn.com/content/nfl/players/${p.player_id}.jpg`,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  if (rows.length === 0) {
    return { error: "No players found in the Sleeper response." };
  }

  const db = getDb();
  await db.batch([db.delete(playerCatalog), db.insert(playerCatalog).values(rows)]);

  return { count: rows.length };
}
