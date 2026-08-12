import { describe, expect, it } from "vitest";

import { getScreenerDecision } from "./screener";

describe("getScreenerDecision", () => {
  it("returns long for a score of 65 or above without a Weak safeguard", () => {
    expect(getScreenerDecision(65, "Strong")).toBe("long");
    expect(getScreenerDecision(80, "Strong")).toBe("long");
  });

  it("returns watch when a high-scoring company has a Weak safeguard", () => {
    expect(getScreenerDecision(67, "Weak")).toBe("watch");
  });

  it("handles the Weak safeguard regardless of capitalisation", () => {
    expect(getScreenerDecision(70, "weak")).toBe("watch");
  });

  it("returns short for a score of 35 or below", () => {
    expect(getScreenerDecision(35, "Weak")).toBe("short");
    expect(getScreenerDecision(30, "Weak")).toBe("short");
  });

  it("returns watch for scores between 36 and 64", () => {
    expect(getScreenerDecision(36, "Balanced")).toBe("watch");
    expect(getScreenerDecision(64, "Strong")).toBe("watch");
  });
});