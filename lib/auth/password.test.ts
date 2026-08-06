import { describe, expect, it } from "vitest";
import { verifyPassword } from "./password";

describe("verifyPassword", () => {
  it("accepts the correct password", () => {
    expect(verifyPassword(process.env.APP_PASSWORD!)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    expect(verifyPassword("definitely-not-the-password")).toBe(false);
  });

  it("rejects a candidate of different length than the real password", () => {
    expect(verifyPassword(process.env.APP_PASSWORD! + "x")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(verifyPassword("")).toBe(false);
  });
});
