import { useEffect, useRef } from "react";

export interface PointerImpact {
  trigger: number;
  angularVelocity: number;
}

const POINTER_REST_TRANSFORM = "rotate(0deg)";
const POINTER_CONTACT_DURATION_MS = 36;
const POINTER_RETURN_TRANSITION = "transform 240ms cubic-bezier(0.22, 1.15, 0.3, 1.25)";
const MIN_IMPACT_VELOCITY = 0.004;
const MAX_IMPACT_VELOCITY = 0.028;
const MIN_POINTER_TILT = 5;
const MAX_POINTER_TILT = 15;

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
  const tilt = Math.round(interpolate(MIN_POINTER_TILT, MAX_POINTER_TILT, strength));

  return `rotate(-${tilt}deg)`;
}

export function usePointerImpactAnimation(pointerImpact?: PointerImpact) {
  const pointerRef = useRef<HTMLDivElement | null>(null);
  const resetFrameRef = useRef<number | null>(null);
  const contactTimeoutRef = useRef<number | null>(null);
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
    if (contactTimeoutRef.current !== null) {
      window.clearTimeout(contactTimeoutRef.current);
      contactTimeoutRef.current = null;
    }

    pointer.style.transition = "none";
    pointer.style.transform = getPointerImpactTransform(impactVelocity);

    contactTimeoutRef.current = window.setTimeout(() => {
      contactTimeoutRef.current = null;
      resetFrameRef.current = requestAnimationFrame(() => {
        pointer.style.transition = POINTER_RETURN_TRANSITION;
        pointer.style.transform = POINTER_REST_TRANSFORM;
        resetFrameRef.current = null;
      });
    }, POINTER_CONTACT_DURATION_MS);

    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
        resetFrameRef.current = null;
      }
      if (contactTimeoutRef.current !== null) {
        window.clearTimeout(contactTimeoutRef.current);
        contactTimeoutRef.current = null;
      }
    };
  }, [impactTrigger, impactVelocity]);

  useEffect(() => {
    return () => {
      if (resetFrameRef.current !== null) {
        cancelAnimationFrame(resetFrameRef.current);
      }
      if (contactTimeoutRef.current !== null) {
        window.clearTimeout(contactTimeoutRef.current);
      }
    };
  }, []);

  return pointerRef;
}
