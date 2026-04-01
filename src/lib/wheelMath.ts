import type { WheelOption } from "../types";

export interface Segment {
  option: WheelOption;
  startAngle: number; // radians
  endAngle: number;   // radians
  midAngle: number;
}

/** Build segment arcs proportional to each option's weight. */
export function buildSegments(options: WheelOption[]): Segment[] {
  const totalWeight = options.reduce((sum, o) => sum + o.weight, 0);
  if (totalWeight === 0) return [];

  const segments: Segment[] = [];
  let currentAngle = 0;

  for (const option of options) {
    const arc = (option.weight / totalWeight) * Math.PI * 2;
    segments.push({
      option,
      startAngle: currentAngle,
      endAngle: currentAngle + arc,
      midAngle: currentAngle + arc / 2,
    });
    currentAngle += arc;
  }
  return segments;
}

/**
 * Pick a cryptographically random landing angle, returning
 * the angle in radians [0, 2π) and the index of the winning segment.
 */
export function pickWinner(segments: Segment[]): {
  angle: number;
  winnerIndex: number;
} {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  const angle = (arr[0] / 0xffffffff) * Math.PI * 2;

  const winnerIndex = segments.findIndex(
    (s) => angle >= s.startAngle && angle < s.endAngle
  );

  return { angle, winnerIndex: winnerIndex === -1 ? 0 : winnerIndex };
}

/**
 * Given the current wheel rotation (radians, increasing clockwise),
 * determine which segment the right-side pointer is pointing at.
 * The pointer is at angle 0 (3 o'clock) in canvas coordinates.
 */
export function getSegmentAtPointer(
  segments: Segment[],
  rotation: number
): number {
  const twoPi = Math.PI * 2;
  // The pointer is at 0 (right / 3 o'clock). Segments are drawn offset by -π/2
  // (so segment 0 starts at top). The effective pointer angle into segment space
  // is (π/2 - rotation) normalised to [0, 2π).
  const pointerAngle = (((Math.PI / 2) - (rotation % twoPi)) % twoPi + twoPi) % twoPi;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (pointerAngle >= s.startAngle && pointerAngle < s.endAngle) {
      return i;
    }
  }
  return 0;
}
