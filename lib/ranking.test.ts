import { describe, expect, it } from "vitest";
import { computeTierGroups, ranksForOrder } from "./ranking";

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
