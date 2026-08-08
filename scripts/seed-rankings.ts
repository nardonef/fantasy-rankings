import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { players, playerCatalog, seasons } from "@/lib/db/schema";
import { buildSeedRows, extractProjections, type CatalogEntry } from "@/lib/rankingsImport";

const SOURCE_URL =
  process.argv[2] ?? "https://www.thefantasyfootballers.com/2026-quarterback-rankings-draft/";
const SEASON_YEAR = Number(process.argv[3] ?? 2026);

async function main() {
  console.log(`Fetching rankings from ${SOURCE_URL} ...`);
  const response = await fetch(SOURCE_URL, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
  }
  const html = await response.text();
  const projections = extractProjections(html);
  console.log(`Extracted ${projections.length} projection rows.`);

  const db = getDb();

  const season = await db.query.seasons.findFirst({ where: eq(seasons.year, SEASON_YEAR) });
  if (!season) {
    throw new Error(`No season found for year ${SEASON_YEAR}.`);
  }

  const catalog: CatalogEntry[] = await db.query.playerCatalog.findMany();

  const rows = buildSeedRows(projections, catalog);
  console.log(`Built ${rows.length} seed rows.`);
  const perPosition = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.position] = (acc[r.position] ?? 0) + 1;
    return acc;
  }, {});
  console.log("Per position:", perPosition);

  if (rows.length === 0) {
    throw new Error("No seed rows built — aborting without touching the database.");
  }

  await db.batch([
    db.delete(players).where(eq(players.seasonId, season.id)),
    db.insert(players).values(
      rows.map((row) => ({
        seasonId: season.id,
        name: row.name,
        team: row.team,
        position: row.position,
        positionRank: row.positionRank,
        overallRank: row.overallRank,
        photoUrl: row.photoUrl,
      })),
    ),
  ]);

  console.log(`Seeded ${rows.length} players into season ${SEASON_YEAR}.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
