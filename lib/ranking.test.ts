import { describe, expect, it } from "vitest";
import { computeTierGroups, derivePositionRanks, ranksForOrder } from "./ranking";

describe("ranksForOrder", () => {
  it("assigns sequential 1..N ranks matching the given order", () => {
    expect(ranksForOrder([10, 20, 30])).toEqual([
      { id: 10, rank: 1 },
      { id: 20, rank: 2 },
      { id: 30, rank: 3 },
    ]);
  });

  it("returns an empty array for an empty input", () => {
    expect(ranksForOrder([])).toEqual([]);
  });

  it("handles a single item", () => {
    expect(ranksForOrder([42])).toEqual([{ id: 42, rank: 1 }]);
  });

  it("reflects reordering, not the original id values", () => {
    expect(ranksForOrder([30, 10, 20])).toEqual([
      { id: 30, rank: 1 },
      { id: 10, rank: 2 },
      { id: 20, rank: 3 },
    ]);
  });
});

describe("computeTierGroups", () => {
  it("puts everything in tier 1 when there are no breaks", () => {
    expect(computeTierGroups([false, false, false])).toEqual([1, 1, 1]);
  });

  it("increments the tier after each break", () => {
    expect(computeTierGroups([false, true, false, false])).toEqual([1, 1, 2, 2]);
  });

  it("supports a break after every item", () => {
    expect(computeTierGroups([true, true, true])).toEqual([1, 2, 3]);
  });

  it("ignores a trailing break (no item after it to affect)", () => {
    expect(computeTierGroups([false, true])).toEqual([1, 1]);
  });

  it("returns an empty array for an empty input", () => {
    expect(computeTierGroups([])).toEqual([]);
  });
});

describe("derivePositionRanks", () => {
  it("numbers each position independently, starting at 1", () => {
    const result = derivePositionRanks([
      { id: 1, position: "RB" },
      { id: 2, position: "WR" },
      { id: 3, position: "RB" },
      { id: 4, position: "QB" },
    ]);
    expect(result.get(1)).toBe(1);
    expect(result.get(2)).toBe(1);
    expect(result.get(3)).toBe(2);
    expect(result.get(4)).toBe(1);
  });

  it("follows the given overall order, not the id values", () => {
    const result = derivePositionRanks([
      { id: 30, position: "QB" },
      { id: 10, position: "QB" },
      { id: 20, position: "QB" },
    ]);
    expect(result.get(30)).toBe(1);
    expect(result.get(10)).toBe(2);
    expect(result.get(20)).toBe(3);
  });

  it("returns an empty map for an empty input", () => {
    expect(derivePositionRanks([]).size).toBe(0);
  });
});
