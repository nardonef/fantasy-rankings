import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { createSessionToken, verifySessionToken } from "./session";

function getSecretKey() {
  return new TextEncoder().encode(process.env.SESSION_SECRET!);
}

describe("session tokens", () => {
  it("round-trips a freshly created token as authenticated", async () => {
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("rejects an expired token", async () => {
    const expired = await new SignJWT({ authenticated: true })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(getSecretKey());

    expect(await verifySessionToken(expired)).toBe(false);
  });

  it("rejects a token with a tampered signature", async () => {
    const token = await createSessionToken();
    const tampered = token.slice(0, -1) + (token.at(-1) === "a" ? "b" : "a");

    expect(await verifySessionToken(tampered)).toBe(false);
  });

  it("rejects garbage input", async () => {
    expect(await verifySessionToken("not-a-real-token")).toBe(false);
  });
});
