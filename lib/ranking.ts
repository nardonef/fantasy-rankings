import type { Position } from "@/lib/positions";

export function ranksForOrder(orderedIds: number[]): { id: number; rank: number }[] {
  return orderedIds.map((id, index) => ({ id, rank: index + 1 }));
}

/**
 * Given players already in overall-rank order, returns each player's rank
 * among same-position players — i.e. their position rank derived from the
 * overall order rather than tracked independently.
 */
export function derivePositionRanks(
  playersInOverallOrder: { id: number; position: Position }[],
): Map<number, number> {
  const counters: Record<Position, number> = { QB: 0, RB: 0, WR: 0, TE: 0 };
  const result = new Map<number, number>();
  for (const player of playersInOverallOrder) {
    counters[player.position] += 1;
    result.set(player.id, counters[player.position]);
  }
  return result;
}

/**
 * Given whether a tier break follows each item (in order), returns each
 * item's tier number. Tiers are derived, not stored, so they stay correct
 * automatically as the underlying order changes.
 */
export function computeTierGroups(breaksAfter: boolean[]): number[] {
  const tiers: number[] = [];
  let current = 1;
  for (const breakAfter of breaksAfter) {
    tiers.push(current);
    if (breakAfter) current += 1;
  }
  return tiers;
}
