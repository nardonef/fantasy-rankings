export function ranksForOrder(orderedIds: number[]): { id: number; rank: number }[] {
  return orderedIds.map((id, index) => ({ id, rank: index + 1 }));
}
