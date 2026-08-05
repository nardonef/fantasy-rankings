import { timingSafeEqual, createHash } from "node:crypto";

export function verifyPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error("APP_PASSWORD is not set");

  // Hash both sides first so timingSafeEqual always compares equal-length
  // buffers regardless of the candidate's length.
  const candidateHash = createHash("sha256").update(candidate).digest();
  const expectedHash = createHash("sha256").update(expected).digest();

  return timingSafeEqual(candidateHash, expectedHash);
}
