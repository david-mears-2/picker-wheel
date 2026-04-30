import { useEffect, useRef } from "react";

export interface PointerImpact {
  trigger: number;
  angularVelocity: number;
}

const POINTER_REST_TRANSFORM = "translate3d(0, -50%, 0) rotate(0deg)";
const POINTER_RETURN_TRANSITION = "transform 240ms cubic-bezier(0.22, 1.15, 0.3, 1.25)";
const MIN_IMPACT_VELOCITY = 0.004;
const MAX_IMPACT_VELOCITY = 0.028;
const MIN_POINTER_OFFSET = 4;
const MAX_POINTER_OFFSET = 11;
const MIN_POINTER_TILT = 3;
const MAX_POINTER_TILT = 9;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function interpolate(min: number, max: number, progress: number): number {
  return min + (max - min) * progress;
}

export function normalizePointerImpactStrength(angularVelocity: number): number {
  if (angularVelocity <= MIN_IMPACT_VELOCITY) {
    return 0;
  }

  if (angularVelocity >= MAX_IMPACT_VELOCITY) {
    return 1;
  }

  return (angularVelocity - MIN_IMPACT_VELOCITY) / (MAX_IMPACT_VELOCITY - MIN_IMPACT_VELOCITY);
}

export function getPointerImpactTransform(angularVelocity: number): string {
  const strength = clamp(normalizePointerImpactStrength(angularVelocity), 0, 1);
  const offset = Math.round(interpolate(MIN_POINTER_OFFSET, MAX_POINTER_OFFSET, strength));
  const tilt = Math.round(interpolate(MIN_POINTER_TILT, MAX_POINTER_TILT, strength));

  return `translate3d(0, calc(-50% + ${offset}px), 0) rotate(${tilt}deg)`;
}

export function usePointerImpactAnimation(pointerImpact?: PointerImpact) {
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const resetFrameRef = useRef<number | null>(null);
  const impactTrigger = pointerImpact?.trigger ?? 0;
  const impactVelocity = pointerImpact?.angularVelocity ?? 0;

  useEffect(() => {
    const pointer = pointerRef.current;
    if (!pointer || impactTrigger === 0) {
      return;
    }

    if (resetFrameRef.current !== null) {
      cancelAnimationFrame(resetFrameRef.current);
      resetFrameRef.current = null;
    }

    pointer.style.transition = "none";
    pointer.style.transform = getPointerImpactTransform(impactVelocity);

    resetFrameRef.current = requestAnimationFrame(() => {
      pointer.style.transition = POINTER_RETURN_TRANSITION;
      pointer.style.transform = POINTER_REST_TRANSFORM;
      resetFrameRef.current = null;
    });

    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
        resetFrameRef.current = null;
      }
    };
  }, [impactTrigger, impactVelocity]);

  useEffect(() => {
    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
      }
    };
  }, []);

  return pointerRef;
}
