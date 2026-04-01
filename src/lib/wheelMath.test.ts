import { describe, it, expect, vi } from "vitest";
import { buildSegments, pickWinner, getSegmentAtPointer } from "./wheelMath";
import type { WheelOption } from "../types";

function makeOption(label: string, weight = 1): WheelOption {
  return { id: label, label, color: "#000", weight };
}

describe("buildSegments", () => {
  it("returns empty array for empty options", () => {
    expect(buildSegments([])).toEqual([]);
  });

  it("returns empty array when all weights are zero", () => {
    expect(buildSegments([makeOption("A", 0), makeOption("B", 0)])).toEqual([]);
  });

  it("builds equal segments for equal weights", () => {
    const segments = buildSegments([makeOption("A"), makeOption("B")]);
    expect(segments).toHaveLength(2);

    const arc = Math.PI; // 360° / 2
    expect(segments[0].startAngle).toBeCloseTo(0);
    expect(segments[0].endAngle).toBeCloseTo(arc);
    expect(segments[1].startAngle).toBeCloseTo(arc);
    expect(segments[1].endAngle).toBeCloseTo(Math.PI * 2);
  });

  it("builds proportional segments for different weights", () => {
    const segments = buildSegments([makeOption("A", 3), makeOption("B", 1)]);
    expect(segments).toHaveLength(2);

    // A gets 3/4 of the circle, B gets 1/4
    const expectedArcA = (3 / 4) * Math.PI * 2;
    const expectedArcB = (1 / 4) * Math.PI * 2;
    expect(segments[0].endAngle - segments[0].startAngle).toBeCloseTo(expectedArcA);
    expect(segments[1].endAngle - segments[1].startAngle).toBeCloseTo(expectedArcB);
  });

  it("sets midAngle to midpoint of segment arc", () => {
    const segments = buildSegments([makeOption("A"), makeOption("B"), makeOption("C")]);
    for (const seg of segments) {
      const expectedMid = (seg.startAngle + seg.endAngle) / 2;
      expect(seg.midAngle).toBeCloseTo(expectedMid);
    }
  });

  it("segments span the full circle", () => {
    const segments = buildSegments([
      makeOption("A", 2),
      makeOption("B", 3),
      makeOption("C", 5),
    ]);
    const lastEnd = segments[segments.length - 1].endAngle;
    expect(lastEnd).toBeCloseTo(Math.PI * 2);
  });

  it("supports decimal weights", () => {
    const segments = buildSegments([makeOption("A", 0.5), makeOption("B", 1.5)]);
    // A = 0.5/2.0 = 25%, B = 1.5/2.0 = 75%
    const arcA = segments[0].endAngle - segments[0].startAngle;
    expect(arcA).toBeCloseTo(0.25 * Math.PI * 2);
  });
});

describe("pickWinner", () => {
  it("returns a valid winner index", () => {
    const segments = buildSegments([makeOption("A"), makeOption("B"), makeOption("C")]);
    const { winnerIndex, angle } = pickWinner(segments);
    expect(winnerIndex).toBeGreaterThanOrEqual(0);
    expect(winnerIndex).toBeLessThan(segments.length);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(Math.PI * 2);
  });

  it("returns index 0 as fallback for edge case", () => {
    // If findIndex returns -1 (shouldn't normally happen), fallback to 0
    const segments = buildSegments([makeOption("A")]);
    const result = pickWinner(segments);
    expect(result.winnerIndex).toBe(0);
  });

  it("picks winner matching the generated angle", () => {
    const segments = buildSegments([makeOption("A", 1), makeOption("B", 1)]);
    // Mock crypto to return a known value
    const mockValues = vi.fn().mockImplementation((arr: Uint32Array) => {
      // Return value that maps to angle in first half (segment A)
      arr[0] = Math.floor(0.1 * 0xffffffff);
      return arr;
    });
    vi.stubGlobal("crypto", { getRandomValues: mockValues });

    const { winnerIndex } = pickWinner(segments);
    expect(winnerIndex).toBe(0); // first segment

    vi.unstubAllGlobals();
  });
});

describe("getSegmentAtPointer", () => {
  it("returns correct segment for zero rotation", () => {
    // Two equal segments: A=[0,π), B=[π,2π)
    // Pointer at right (0° canvas). In segment space: pointerAngle = (π/2 - 0) = π/2
    // π/2 is in segment A [0, π)
    const segments = buildSegments([makeOption("A"), makeOption("B")]);
    const idx = getSegmentAtPointer(segments, 0);
    expect(idx).toBe(0);
  });

  it("returns correct segment after rotation", () => {
    // Two equal segments: A=[0,π), B=[π,2π)
    // Rotate by π → pointerAngle = (π/2 - π) mod 2π = 3π/2
    // 3π/2 is in segment B [π, 2π)
    const segments = buildSegments([makeOption("A"), makeOption("B")]);
    const idx = getSegmentAtPointer(segments, Math.PI);
    expect(idx).toBe(1);
  });

  it("handles rotation greater than 2π", () => {
    const segments = buildSegments([makeOption("A"), makeOption("B")]);
    // Rotation of 3π = π + 2π → same as π rotation → segment B
    const idx = getSegmentAtPointer(segments, Math.PI * 3);
    expect(idx).toBe(1);
  });

  it("returns 0 as fallback when no segment matched", () => {
    // Edge case: empty segments array
    const idx = getSegmentAtPointer([], 0);
    expect(idx).toBe(0);
  });
});
