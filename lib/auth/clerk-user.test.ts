import { describe, expect, it } from "vitest";
import { resolveDisplayName, resolvePrimaryEmail } from "./clerk-user";

describe("resolvePrimaryEmail", () => {
  it("picks the address matching the primary id", () => {
    const email = resolvePrimaryEmail(
      [
        { id: "a", email_address: "a@example.com" },
        { id: "b", email_address: "b@example.com" },
      ],
      "b",
    );
    expect(email).toBe("b@example.com");
  });

  it("falls back to the first address when no primary id matches", () => {
    const email = resolvePrimaryEmail(
      [{ id: "a", email_address: "a@example.com" }],
      "missing",
    );
    expect(email).toBe("a@example.com");
  });

  it("falls back to the first address when primary id is null", () => {
    const email = resolvePrimaryEmail(
      [{ id: "a", email_address: "a@example.com" }],
      null,
    );
    expect(email).toBe("a@example.com");
  });

  it("returns undefined when there are no addresses", () => {
    expect(resolvePrimaryEmail([], null)).toBeUndefined();
  });
});

describe("resolveDisplayName", () => {
  it("joins first and last name", () => {
    expect(resolveDisplayName("Jane", "Doe")).toBe("Jane Doe");
  });

  it("uses whichever name is present", () => {
    expect(resolveDisplayName("Jane", null)).toBe("Jane");
    expect(resolveDisplayName(null, "Doe")).toBe("Doe");
  });

  it("returns null when both are missing", () => {
    expect(resolveDisplayName(null, null)).toBeNull();
  });
});
