import type { SpinOutcomeOverrideConfig } from "../types";
import { pickWinner } from "./wheelMath";
import type { Segment } from "./wheelMath";

export interface SpinOutcomeSelection {
  angle: number;
  winnerIndex: number;
}

export interface SpinOutcomeResult {
  selection: SpinOutcomeSelection;
  error: string | null;
}

export function resolveSpinOutcome(
  segments: Segment[],
  config: SpinOutcomeOverrideConfig,
  randomWinnerPicker: (segments: Segment[]) => SpinOutcomeSelection = pickWinner
): SpinOutcomeResult {
  if (!config.enabled) {
    return {
      selection: randomWinnerPicker(segments),
      error: null,
    };
  }

  if (config.optionIndex >= segments.length) {
    return {
      selection: { angle: 0, winnerIndex: 0 },
      error: `Configured spin outcome index ${config.optionIndex} is out of range for ${segments.length} options.`,
    };
  }

  return {
    selection: {
      angle: segments[config.optionIndex].midAngle,
      winnerIndex: config.optionIndex,
    },
    error: null,
  };
}
