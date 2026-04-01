import { describe, it, expect } from "vitest";
import { COLOR_PATTERNS, getOptionColor } from "./colors";

describe("COLOR_PATTERNS", () => {
  it("contains at least one pattern", () => {
    expect(COLOR_PATTERNS.length).toBeGreaterThanOrEqual(1);
  });

  it("each pattern has at least one color", () => {
    for (const pattern of COLOR_PATTERNS) {
      expect(pattern.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("all colors are valid hex strings", () => {
    for (const pattern of COLOR_PATTERNS) {
      for (const color of pattern) {
        expect(color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });
});

describe("getOptionColor", () => {
  it("returns first color for index 0", () => {
    const result = getOptionColor(0, 0);
    expect(result).toBe(COLOR_PATTERNS[0][0]);
  });

  it("wraps around when index exceeds pattern length", () => {
    const pattern = COLOR_PATTERNS[0];
    const result = getOptionColor(0, pattern.length);
    expect(result).toBe(pattern[0]);
  });

  it("falls back to first pattern for invalid pattern index", () => {
    const result = getOptionColor(999, 0);
    expect(result).toBe(COLOR_PATTERNS[0][0]);
  });

  it("returns correct color for each pattern", () => {
    for (let p = 0; p < COLOR_PATTERNS.length; p++) {
      for (let i = 0; i < COLOR_PATTERNS[p].length; i++) {
        expect(getOptionColor(p, i)).toBe(COLOR_PATTERNS[p][i]);
      }
    }
  });
});
