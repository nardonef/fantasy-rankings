export const POSITIONS = ["QB", "RB", "WR", "TE"] as const;
export type Position = (typeof POSITIONS)[number];

export function segmentToPosition(segment: string): Position | null {
  const upper = segment.toUpperCase();
  return (POSITIONS as readonly string[]).includes(upper)
    ? (upper as Position)
    : null;
}
