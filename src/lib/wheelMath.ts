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
 * determine which segment the top-center pointer is pointing at.
 * The pointer is at angle 3π/2 (top of circle) in canvas coordinates.
 */
export function getSegmentAtPointer(
  segments: Segment[],
  rotation: number
): number {
  // Normalize: the pointer is at the top (3π/2 in canvas coords = -π/2).
  // The segment under the pointer is at angle (2π - rotation mod 2π) mapped
  // relative to segment start angles.
  const twoPi = Math.PI * 2;
  const pointerAngle = ((twoPi - (rotation % twoPi)) + twoPi) % twoPi;

  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (pointerAngle >= s.startAngle && pointerAngle < s.endAngle) {
      return i;
    }
  }
  return 0;
}
