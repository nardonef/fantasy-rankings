import { describe, expect, it } from "vitest";
import { buildSeedRows, extractProjections, type RawProjection, type CatalogEntry } from "./rankingsImport";

describe("extractProjections", () => {
  it("parses the projections array out of a window.udk.data assignment", () => {
    const html = `<html><script>window.udk.data = {"projections":[{"name":"Josh Allen"}],"tiers":[]};</script></html>`;
    expect(extractProjections(html)).toEqual([{ name: "Josh Allen" }]);
  });

  it("uses the last assignment when the variable is initialized earlier as an empty object", () => {
    const html = [
      `<script>window.udk.data = {};</script>`,
      `<script>window.udk.data = {"projections":[{"name":"Bijan Robinson"}]};</script>`,
    ].join("");
    expect(extractProjections(html)).toEqual([{ name: "Bijan Robinson" }]);
  });

  it("handles nested braces inside the blob", () => {
    const html = `window.udk.data = {"projections":[{"name":"Test","nested":{"a":1}}]};`;
    expect(extractProjections(html)).toEqual([{ name: "Test", nested: { a: 1 } }]);
  });

  it("throws when the marker is missing", () => {
    expect(() => extractProjections("<html></html>")).toThrow();
  });

  it("throws when projections is not an array", () => {
    const html = `window.udk.data = {"projections":null};`;
    expect(() => extractProjections(html)).toThrow();
  });
});

function projection(overrides: Partial<RawProjection>): RawProjection {
  return {
    name: "Test Player",
    fantasy_position: "RB",
    team: "KC",
    adp_half_ppr: "10.00",
    ...overrides,
  };
}

describe("buildSeedRows", () => {
  it("dedupes repeated per-analyst rows for the same player", () => {
    const projections = [
      projection({ name: "Bijan Robinson", adp_half_ppr: "2.00" }),
      projection({ name: "Bijan Robinson", adp_half_ppr: "2.00" }),
      projection({ name: "Bijan Robinson", adp_half_ppr: "2.00" }),
    ];
    const rows = buildSeedRows(projections, []);
    expect(rows).toHaveLength(1);
    expect(rows[0].name).toBe("Bijan Robinson");
  });

  it("drops players with no half-PPR ADP", () => {
    const projections = [
      projection({ name: "Deep Bench Guy", adp_half_ppr: null }),
      projection({ name: "Ranked Guy", adp_half_ppr: "50.00" }),
    ];
    const rows = buildSeedRows(projections, []);
    expect(rows.map((r) => r.name)).toEqual(["Ranked Guy"]);
  });

  it("excludes positions outside QB/RB/WR/TE", () => {
    const projections = [projection({ name: "Some Kicker", fantasy_position: "K" })];
    expect(buildSeedRows(projections, [])).toHaveLength(0);
  });

  it("prefers the catalog's team over the source's team", () => {
    const projections = [
      projection({ name: "Tua Tagovailoa", fantasy_position: "QB", team: "ATL" }),
    ];
    const catalog: CatalogEntry[] = [
      { name: "Tua Tagovailoa", position: "QB", team: "MIA", photoUrl: "https://example.com/tua.jpg" },
    ];
    const rows = buildSeedRows(projections, catalog);
    expect(rows[0].team).toBe("MIA");
    expect(rows[0].photoUrl).toBe("https://example.com/tua.jpg");
  });

  it("matches the catalog across a generational suffix the source includes but the catalog omits", () => {
    const projections = [
      projection({ name: "James Cook III", fantasy_position: "RB", team: "BUF" }),
    ];
    const catalog: CatalogEntry[] = [
      { name: "James Cook", position: "RB", team: "BUF", photoUrl: "https://example.com/cook.jpg" },
    ];
    const rows = buildSeedRows(projections, catalog);
    expect(rows[0].name).toBe("James Cook III");
    expect(rows[0].photoUrl).toBe("https://example.com/cook.jpg");
  });

  it("falls back to the source team when there is no catalog match", () => {
    const projections = [projection({ name: "No Catalog Guy", team: "SF" })];
    const rows = buildSeedRows(projections, []);
    expect(rows[0].team).toBe("SF");
    expect(rows[0].photoUrl).toBeNull();
  });

  it("drops players whose team cannot be resolved from either source", () => {
    const projections = [projection({ name: "No Team Guy", team: null })];
    expect(buildSeedRows(projections, [])).toHaveLength(0);
  });

  it("computes overall rank ascending by ADP across positions and position rank within position", () => {
    const projections = [
      projection({ name: "RB One", fantasy_position: "RB", adp_half_ppr: "5.00" }),
      projection({ name: "WR One", fantasy_position: "WR", adp_half_ppr: "1.00" }),
      projection({ name: "RB Two", fantasy_position: "RB", adp_half_ppr: "8.00" }),
      projection({ name: "WR Two", fantasy_position: "WR", adp_half_ppr: "3.00" }),
    ];
    const rows = buildSeedRows(projections, []);
    const byName = Object.fromEntries(rows.map((r) => [r.name, r]));

    expect(byName["WR One"]).toMatchObject({ overallRank: 1, positionRank: 1 });
    expect(byName["WR Two"]).toMatchObject({ overallRank: 2, positionRank: 2 });
    expect(byName["RB One"]).toMatchObject({ overallRank: 3, positionRank: 1 });
    expect(byName["RB Two"]).toMatchObject({ overallRank: 4, positionRank: 2 });
  });
});
