import { describe, expect, it, vi } from "vitest";
import type { WheelOption } from "../types";
import { buildSegments } from "./wheelMath";
import { resolveSpinOutcome } from "./spinOutcome";

const options: WheelOption[] = [
  { id: "a", label: "A", color: "#111111", weight: 1 },
  { id: "b", label: "B", color: "#222222", weight: 1 },
  { id: "c", label: "C", color: "#333333", weight: 1 },
];

describe("resolveSpinOutcome", () => {
  it("uses the random picker when the override is disabled", () => {
    const segments = buildSegments(options);
    const randomWinnerPicker = vi.fn(() => ({ angle: 1.23, winnerIndex: 2 }));

    expect(
      resolveSpinOutcome(
        segments,
        { enabled: false, optionIndex: 1 },
        randomWinnerPicker
      )
    ).toEqual({
      selection: { angle: 1.23, winnerIndex: 2 },
      error: null,
    });
    expect(randomWinnerPicker).toHaveBeenCalledWith(segments);
  });

  it("returns a buffered in-slice angle when the override is enabled", () => {
    const segments = buildSegments(options);
    const segment = segments[1];

    const outcome = resolveSpinOutcome(
      segments,
      { enabled: true, optionIndex: 1 },
      undefined,
      () => 0.75
    );

    expect(outcome.error).toBeNull();
    expect(outcome.selection.winnerIndex).toBe(1);
    expect(outcome.selection.angle).toBeGreaterThan(segment.startAngle);
    expect(outcome.selection.angle).toBeLessThan(segment.endAngle);
    expect(outcome.selection.angle).not.toBeCloseTo(segment.midAngle, 5);
  });

  it("falls back to the midpoint when the padded in-slice range collapses", () => {
    const tinySegment = {
      option: options[0],
      startAngle: 0,
      endAngle: 0,
      midAngle: 0.42,
    };

    const outcome = resolveSpinOutcome(
      [tinySegment],
      { enabled: true, optionIndex: 0 },
      undefined,
      () => 0.25
    );

    expect(outcome.error).toBeNull();
    expect(outcome.selection).toEqual({
      angle: 0.42,
      winnerIndex: 0,
    });
  });

  it("returns an error when the configured index is outside the option list", () => {
    const segments = buildSegments(options);

    expect(resolveSpinOutcome(segments, { enabled: true, optionIndex: 5 })).toEqual({
      selection: { angle: 0, winnerIndex: 0 },
      error: "Configured spin outcome index 5 is out of range for 3 options.",
    });
  });
});
