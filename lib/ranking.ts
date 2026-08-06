export function ranksForOrder(orderedIds: number[]): { id: number; rank: number }[] {
  return orderedIds.map((id, index) => ({ id, rank: index + 1 }));
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
