import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { PickerWheel } from "./PickerWheel";
import type { WheelOption } from "../types";

// jsdom doesn't implement canvas getContext — stub it
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    clearRect: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    measureText: vi.fn().mockReturnValue({ width: 30 }),
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 1,
    font: "",
    textAlign: "",
    textBaseline: "",
    shadowColor: "",
    shadowBlur: 0,
  }) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

const options: WheelOption[] = [
  { id: "1", label: "A", color: "#e76f51", weight: 1 },
  { id: "2", label: "B", color: "#f4a261", weight: 1 },
];

describe("PickerWheel", () => {
  it("renders a canvas with proper aria label", () => {
    render(<PickerWheel options={options} rotation={0} size={500} />);
    const canvas = screen.getByRole("img", { name: /picker wheel with 2 options/i });
    expect(canvas).toBeInTheDocument();
    expect(canvas.tagName).toBe("CANVAS");
  });

  it("applies rotation as CSS transform", () => {
    render(<PickerWheel options={options} rotation={Math.PI} size={500} />);
    const canvas = screen.getByRole("img");
    expect(canvas.style.transform).toBe("rotate(180deg)");
  });

  it("uses the specified size", () => {
    render(<PickerWheel options={options} rotation={0} size={300} />);
    const canvas = screen.getByRole("img");
    expect(canvas.style.width).toBe("300px");
    expect(canvas.style.height).toBe("300px");
  });

  it("renders pointer triangle", () => {
    const { container } = render(<PickerWheel options={options} rotation={0} />);
    const pointer = container.querySelector(".wheel-pointer");
    expect(pointer).toBeInTheDocument();
  });

  it("updates aria label when options change", () => {
    const threeOptions = [...options, { id: "3", label: "C", color: "#2a9d8f", weight: 1 }];
    render(<PickerWheel options={threeOptions} rotation={0} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Picker wheel with 3 options");
  });
});
