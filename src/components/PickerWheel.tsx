import { useRef, useEffect, useCallback } from "react";
import type { WheelOption } from "../types";
import { usePointerImpactAnimation, type PointerImpact } from "../hooks/usePointerImpactAnimation";
import { getReadableTextColor } from "../lib/colors";
import { buildSegments, type Segment } from "../lib/wheelMath";

interface PickerWheelProps {
  options: WheelOption[];
  pointerImpact?: PointerImpact;
  rotation: number;
  size?: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatPoint(x: number, y: number): string {
  return `${x.toFixed(3)},${y.toFixed(3)}`;
}

function getInnerPointerPoints(width: number, height: number, borderWidth = 1): string {
  const slantedEdgeLength = Math.hypot(height, width * 2);
  const leftX = borderWidth * slantedEdgeLength / height;
  const rightX = width - borderWidth;
  const topY = borderWidth * (slantedEdgeLength + height) / (2 * width);
  const bottomY = height - topY;

  return [
    formatPoint(rightX, topY),
    formatPoint(leftX, height / 2),
    formatPoint(rightX, bottomY),
  ].join(" ");
}

function drawWheel(
  ctx: CanvasRenderingContext2D,
  segments: Segment[],
  size: number
) {
  const center = size / 2;
  const radius = center - 4;

  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.translate(center, center);

  for (const seg of segments) {
    // Draw segment
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, seg.startAngle - Math.PI / 2, seg.endAngle - Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = seg.option.color;
    ctx.fill();

    // Thin border
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label
    const labelAngle = seg.midAngle - Math.PI / 2;
    ctx.save();
    ctx.rotate(labelAngle);
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    const labelColor = getReadableTextColor(seg.option.color);
    ctx.fillStyle = labelColor;
    ctx.shadowColor = labelColor === "#111111"
      ? "rgba(255,255,255,0.45)"
      : "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 2;

    const maxFontSize = Math.max(16, radius * 0.05);
    const fontSize = Math.max(10, Math.min(maxFontSize, radius / segments.length * 0.8));
    ctx.font = `bold ${fontSize}px system-ui, sans-serif`;

    const maxWidth = radius * 0.65;
    let label = seg.option.label;
    if (ctx.measureText(label).width > maxWidth) {
      while (label.length > 1 && ctx.measureText(label + "…").width > maxWidth) {
        label = label.slice(0, -1);
      }
      label += "…";
    }
    ctx.fillText(label, radius - 12, 0);
    ctx.restore();
  }

  // Center circle
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 8;
  ctx.fill();

  ctx.restore();
}

export function PickerWheel({ options, pointerImpact, rotation, size = 500 }: PickerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentsRef = useRef<Segment[]>([]);
  const pointerRef = usePointerImpactAnimation(pointerImpact);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const segments = buildSegments(options);
    segmentsRef.current = segments;
    drawWheel(ctx, segments, size);
  }, [options, size]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  const rotationDeg = (rotation * 180) / Math.PI;
  const pointerWidth = Math.round(clamp(size * 0.06, 28, 56));
  const pointerHeight = Math.round(pointerWidth * (30 / 28));
  const pointerOffset = Math.round(pointerWidth * (18 / 28));
  const outerPointerPoints = [
    formatPoint(pointerWidth, 0),
    formatPoint(0, pointerHeight / 2),
    formatPoint(pointerWidth, pointerHeight),
  ].join(" ");
  const innerPointerPoints = getInnerPointerPoints(pointerWidth, pointerHeight);

  return (
    <div className="wheel-container" style={{ width: size, height: size, position: "relative" }}>
      <div
        className="wheel-pointer-anchor"
        aria-hidden="true"
        style={{
          right: -pointerOffset,
          width: pointerWidth,
          height: pointerHeight,
        }}
      >
        <div className="wheel-pointer-motion" ref={pointerRef}>
          <svg
            className="wheel-pointer"
            viewBox={`0 0 ${pointerWidth} ${pointerHeight}`}
            focusable="false"
          >
            <polygon
              className="wheel-pointer-outline"
              points={outerPointerPoints}
              fill="#ffffff"
            />
            <polygon
              className="wheel-pointer-fill"
              points={innerPointerPoints}
              fill="#333333"
            />
          </svg>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{
          width: size,
          height: size,
          transform: `rotate(${rotationDeg}deg)`,
          borderRadius: "50%",
          boxShadow: "0 0 30px rgba(0,0,0,0.4)",
        }}
        role="img"
        aria-label={`Picker wheel with ${options.length} options`}
      />
    </div>
  );
}
