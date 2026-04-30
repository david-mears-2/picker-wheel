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

const SEGMENT_EDGE_PADDING_RATIO = 0.18;

function getBufferedAngleWithinSegment(
  segment: Segment,
  random: () => number
): number {
  const arc = segment.endAngle - segment.startAngle;
  const edgePadding = arc * SEGMENT_EDGE_PADDING_RATIO;
  const minAngle = segment.startAngle + edgePadding;
  const maxAngle = segment.endAngle - edgePadding;

  if (maxAngle <= minAngle) {
    return segment.midAngle;
  }

  return minAngle + random() * (maxAngle - minAngle);
}

export function resolveSpinOutcome(
  segments: Segment[],
  config: SpinOutcomeOverrideConfig,
  randomWinnerPicker: (segments: Segment[]) => SpinOutcomeSelection = pickWinner,
  random: () => number = Math.random
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
      angle: getBufferedAngleWithinSegment(segments[config.optionIndex], random),
      winnerIndex: config.optionIndex,
    },
    error: null,
  };
}
