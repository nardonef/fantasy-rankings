import { describe, expect, it } from "vitest";
import { matchesSearch } from "./search";

describe("matchesSearch", () => {
  it("matches on a name substring, case-insensitively", () => {
    expect(matchesSearch("josh", "Josh Allen", "BUF")).toBe(true);
    expect(matchesSearch("ALLEN", "Josh Allen", "BUF")).toBe(true);
  });

  it("matches on a team substring, case-insensitively", () => {
    expect(matchesSearch("buf", "Josh Allen", "BUF")).toBe(true);
  });

  it("does not match unrelated queries", () => {
    expect(matchesSearch("mahomes", "Josh Allen", "BUF")).toBe(false);
  });

  it("treats an empty or whitespace-only query as matching everything", () => {
    expect(matchesSearch("", "Josh Allen", "BUF")).toBe(true);
    expect(matchesSearch("   ", "Josh Allen", "BUF")).toBe(true);
  });
});
