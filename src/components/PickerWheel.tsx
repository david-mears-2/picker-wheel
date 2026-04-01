import { useRef, useEffect, useCallback } from "react";
import type { WheelOption } from "../types";
import { buildSegments, type Segment } from "../lib/wheelMath";

interface PickerWheelProps {
  options: WheelOption[];
  rotation: number;
  size?: number;
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
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.5)";
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

export function PickerWheel({ options, rotation, size = 500 }: PickerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const segmentsRef = useRef<Segment[]>([]);

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

  return (
    <div className="wheel-container" style={{ width: size, height: size, position: "relative" }}>
      {/* Pointer — right-side triangle matching reference site */}
      <div
        className="wheel-pointer"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "50%",
          right: -18,
          transform: "translateY(-50%)",
          width: 0,
          height: 0,
          borderTop: "15px solid transparent",
          borderBottom: "15px solid transparent",
          borderRight: "28px solid #333",
          zIndex: 10,
          filter: "drop-shadow(-2px 0 3px rgba(0,0,0,0.3))",
        }}
      />
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
