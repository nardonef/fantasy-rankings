import { POSITIONS, type Position } from "@/lib/positions";
import { normalizeTeam, type NflTeam } from "@/lib/teams";

export interface RawProjection {
  name: string;
  fantasy_position: string;
  team: string | null;
  adp_half_ppr: string | number | null;
}

export interface CatalogEntry {
  name: string;
  position: Position;
  team: string | null;
  photoUrl: string | null;
}

export interface SeedRow {
  name: string;
  team: NflTeam;
  position: Position;
  positionRank: number;
  overallRank: number;
  photoUrl: string | null;
}

const SEED_POSITIONS = new Set<string>(POSITIONS);

const UDK_DATA_MARKER = "window.udk.data = ";

const SUFFIX_PATTERN = /\s+(Jr\.?|Sr\.?|II|III|IV|V)$/i;

/** Strips a trailing generational suffix so names match across sources that format it differently. */
function stripSuffix(name: string): string {
  return name.replace(SUFFIX_PATTERN, "").trim();
}

/** Pulls the `window.udk.data.projections` array out of a page's raw HTML. */
export function extractProjections(html: string): RawProjection[] {
  const idx = html.lastIndexOf(UDK_DATA_MARKER);
  if (idx === -1) {
    throw new Error("Could not find window.udk.data in page HTML.");
  }
  const start = idx + UDK_DATA_MARKER.length;

  let depth = 0;
  let started = false;
  let end = -1;
  for (let i = start; i < html.length; i++) {
    const char = html[i];
    if (char === "{") {
      depth++;
      started = true;
    } else if (char === "}") {
      depth--;
      if (started && depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  if (end === -1) {
    throw new Error("Could not find end of window.udk.data JSON blob.");
  }

  const data = JSON.parse(html.slice(start, end));
  if (!Array.isArray(data.projections)) {
    throw new Error("window.udk.data.projections was not an array.");
  }
  return data.projections as RawProjection[];
}

/**
 * Dedupes repeated per-analyst rows, drops players with no half-PPR ADP,
 * and resolves each player's team preferring the (Sleeper-sourced) catalog
 * over the rankings source, falling back to the source when there's no
 * catalog match.
 */
export function buildSeedRows(
  projections: RawProjection[],
  catalog: CatalogEntry[],
): SeedRow[] {
  const catalogByKey = new Map<string, CatalogEntry>();
  for (const entry of catalog) {
    catalogByKey.set(`${entry.name}|${entry.position}`, entry);
    catalogByKey.set(`${stripSuffix(entry.name)}|${entry.position}`, entry);
  }

  const grouped = new Map<string, RawProjection[]>();
  for (const p of projections) {
    if (!SEED_POSITIONS.has(p.fantasy_position)) continue;
    const key = `${p.name}|${p.fantasy_position}`;
    const existing = grouped.get(key);
    if (existing) existing.push(p);
    else grouped.set(key, [p]);
  }

  const withAdp: { name: string; position: Position; team: NflTeam; photoUrl: string | null; adp: number }[] = [];

  for (const entries of grouped.values()) {
    const source = entries.find(
      (e) => e.adp_half_ppr !== null && e.adp_half_ppr !== undefined,
    );
    if (!source) continue;
    const adp = Number(source.adp_half_ppr);
    if (Number.isNaN(adp)) continue;

    const position = source.fantasy_position as Position;
    const catalogEntry =
      catalogByKey.get(`${source.name}|${position}`) ??
      catalogByKey.get(`${stripSuffix(source.name)}|${position}`);
    const team = normalizeTeam(catalogEntry?.team) ?? normalizeTeam(source.team);
    if (!team) continue;

    withAdp.push({
      name: source.name,
      position,
      team,
      photoUrl: catalogEntry?.photoUrl ?? null,
      adp,
    });
  }

  withAdp.sort((a, b) => a.adp - b.adp);

  const positionCounters: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };

  return withAdp.map((row, index) => {
    positionCounters[row.position] += 1;
    return {
      name: row.name,
      team: row.team,
      position: row.position,
      positionRank: positionCounters[row.position],
      overallRank: index + 1,
      photoUrl: row.photoUrl,
    };
  });
}
