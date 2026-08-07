import { describe, expect, it } from "vitest";
import { normalizeTeam } from "./teams";

describe("normalizeTeam", () => {
  it("accepts a valid team abbreviation", () => {
    expect(normalizeTeam("KC")).toBe("KC");
  });

  it("upcases a lowercase abbreviation", () => {
    expect(normalizeTeam("kc")).toBe("KC");
  });

  it("returns null for an unrecognized abbreviation", () => {
    expect(normalizeTeam("JAC")).toBeNull();
  });

  it("returns null for null or undefined", () => {
    expect(normalizeTeam(null)).toBeNull();
    expect(normalizeTeam(undefined)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(normalizeTeam("")).toBeNull();
  });
});
