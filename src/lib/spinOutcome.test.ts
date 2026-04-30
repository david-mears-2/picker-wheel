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

  it("returns the configured segment midpoint when the override is enabled", () => {
    const segments = buildSegments(options);

    const outcome = resolveSpinOutcome(segments, { enabled: true, optionIndex: 1 });

    expect(outcome.error).toBeNull();
    expect(outcome.selection.winnerIndex).toBe(1);
    expect(outcome.selection.angle).toBeCloseTo(Math.PI, 5);
  });

  it("returns an error when the configured index is outside the option list", () => {
    const segments = buildSegments(options);

    expect(resolveSpinOutcome(segments, { enabled: true, optionIndex: 5 })).toEqual({
      selection: { angle: 0, winnerIndex: 0 },
      error: "Configured spin outcome index 5 is out of range for 3 options.",
    });
  });
});
