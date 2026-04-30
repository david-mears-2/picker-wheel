import { useState, useRef, useCallback } from "react";
import type { WheelOption } from "../types";
import { getSpinOutcomeConfig } from "../config/spinOutcome";
import { resolveSpinOutcome } from "../lib/spinOutcome";
import { buildSegments, getSegmentAtPointer } from "../lib/wheelMath";

interface SpinState {
  isSpinning: boolean;
  rotation: number; // current rotation in radians
  currentSegment: number; // index of segment under pointer
  error: string | null;
}

export function useSpinAnimation(
  options: WheelOption[],
  onFinished: (winner: WheelOption) => void,
  onSegmentChange?: (segmentIndex: number) => void,
) {
  const [spinState, setSpinState] = useState<SpinState>({
    isSpinning: false,
    rotation: 0,
    currentSegment: 0,
    error: null,
  });

  const animRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const lastSegmentRef = useRef(0);

  const spin = useCallback(() => {
    if (options.length < 2) return;

    const segments = buildSegments(options);
    const { config, error: configError } = getSpinOutcomeConfig();
    if (configError) {
      setSpinState((s) => ({
        ...s,
        isSpinning: false,
        error: configError,
      }));
      return;
    }

    const outcome = resolveSpinOutcome(segments, config);
    if (outcome.error) {
      setSpinState((s) => ({
        ...s,
        isSpinning: false,
        error: outcome.error,
      }));
      return;
    }

    const { angle: winAngle, winnerIndex } = outcome.selection;

    // The pointer is on the right (0° in canvas = 3 o'clock).
    // Segments are drawn offset by -π/2 (segment 0 starts at top).
    // We need a landing angle inside the winning segment to end up at the pointer.
    // pointer angle in segment space = π/2 - rotation
    // So rotation = π/2 - winAngle  →  target adds enough full spins
    const fullSpins = 5 + Math.floor(Math.random() * 5); // 5–9 full rotations
    const twoPi = Math.PI * 2;
    const currentMod = ((rotationRef.current % twoPi) + twoPi) % twoPi;
    // delta = extra rotation (beyond full spins) so pointer lands on winAngle
    const delta = ((Math.PI / 2 - winAngle - currentMod) % twoPi + twoPi) % twoPi;
    const targetRotation = rotationRef.current + fullSpins * twoPi + delta;

    const startRotation = rotationRef.current;
    const totalDelta = targetRotation - startRotation;
    const duration = 4000 + Math.random() * 2000; // 4–6 seconds
    const startTime = performance.now();

    setSpinState((s) => ({ ...s, isSpinning: true, error: null }));

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      const currentRotation = startRotation + totalDelta * easedProgress;
      rotationRef.current = currentRotation;

      // Detect segment changes for tick sound
      const currentSeg = getSegmentAtPointer(segments, currentRotation);
      if (currentSeg !== lastSegmentRef.current) {
        lastSegmentRef.current = currentSeg;
        onSegmentChange?.(currentSeg);
      }

      setSpinState({
        isSpinning: progress < 1,
        rotation: currentRotation,
        currentSegment: currentSeg,
        error: null,
      });

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = currentRotation;
        onFinished(options[winnerIndex]);
      }
    };

    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(animate);
  }, [options, onFinished, onSegmentChange]);

  return { ...spinState, spin };
}
