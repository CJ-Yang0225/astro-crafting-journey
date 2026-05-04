import { describe, it, expect } from "vitest";
import { mulberry32 } from "./seeded-rng";

describe("mulberry32", () => {
  it("produces deterministic values for the same seed", () => {
    const rng1 = mulberry32(0xc0de);
    const rng2 = mulberry32(0xc0de);
    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
    expect(rng1()).toBe(rng2());
  });

  it("produces different values for different seeds", () => {
    const rng1 = mulberry32(1);
    const rng2 = mulberry32(2);
    expect(rng1()).not.toBe(rng2());
  });

  it("returns values in [0, 1)", () => {
    const rng = mulberry32(0xc0de);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("produces a uniform-ish distribution", () => {
    const rng = mulberry32(42);
    const buckets = new Array<number>(10).fill(0);
    const n = 10000;
    for (let i = 0; i < n; i++) {
      buckets[Math.floor(rng() * 10)]++;
    }
    // Each bucket should be within 30% of expected
    for (const count of buckets) {
      expect(count).toBeGreaterThan(n / 10 * 0.7);
      expect(count).toBeLessThan(n / 10 * 1.3);
    }
  });
});
