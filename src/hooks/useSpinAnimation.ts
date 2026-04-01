import { useState, useRef, useCallback } from "react";
import type { WheelOption } from "../types";
import { buildSegments, pickWinner, getSegmentAtPointer } from "../lib/wheelMath";

interface SpinState {
  isSpinning: boolean;
  rotation: number;       // current rotation in radians
  currentSegment: number; // index of segment under pointer
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
  });

  const animRef = useRef<number>(0);
  const rotationRef = useRef(0);
  const lastSegmentRef = useRef(0);

  const spin = useCallback(() => {
    if (options.length < 2) return;

    const segments = buildSegments(options);
    const { angle: winAngle, winnerIndex } = pickWinner(segments);

    // The pointer is at top (angle 0 in our draw).
    // We want the winning segment's midpoint to end up under the pointer.
    // The wheel is drawn with segment 0 starting at angle 0 (right, 3 o'clock).
    // The pointer is at -π/2 (top). So we need to rotate the wheel so that
    // the winning angle lines up at top.
    // target rotation: enough full spins + offset so winAngle is at top
    const fullSpins = 5 + Math.floor(Math.random() * 5); // 5–9 full rotations
    const targetRotation =
      rotationRef.current +
      fullSpins * Math.PI * 2 +
      (Math.PI * 2 - winAngle);

    const startRotation = rotationRef.current;
    const totalDelta = targetRotation - startRotation;
    const duration = 4000 + Math.random() * 2000; // 4–6 seconds
    const startTime = performance.now();

    setSpinState((s) => ({ ...s, isSpinning: true }));

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
