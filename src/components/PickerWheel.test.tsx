import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { PickerWheel } from "./PickerWheel";
import type { WheelOption } from "../types";

let animationFrameId = 0;
let animationFrames = new Map<number, FrameRequestCallback>();

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

beforeEach(() => {
  animationFrameId = 0;
  animationFrames = new Map();
  vi.useFakeTimers();
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
    animationFrameId += 1;
    animationFrames.set(animationFrameId, callback);
    return animationFrameId;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((frameId: number) => {
    animationFrames.delete(frameId);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function runNextAnimationFrame(timestamp = 16) {
  const nextFrame = animationFrames.entries().next().value as
    | [number, FrameRequestCallback]
    | undefined;

  if (!nextFrame) {
    throw new Error("Expected a queued animation frame.");
  }

  const [frameId, callback] = nextFrame;
  animationFrames.delete(frameId);
  act(() => {
    callback(timestamp);
  });
}

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
    const outline = container.querySelector(".wheel-pointer-outline");
    const fill = container.querySelector(".wheel-pointer-fill");
    expect(outline).toHaveAttribute("fill", "#ffffff");
    expect(fill).toHaveAttribute("fill", "#333333");
  });

  it("scales the pointer with the wheel size", () => {
    const { container, rerender } = render(<PickerWheel options={options} rotation={0} size={300} />);
    const anchor = container.querySelector(".wheel-pointer-anchor") as HTMLDivElement;

    expect(anchor.style.width).toBe("28px");
    expect(anchor.style.height).toBe("30px");

    rerender(<PickerWheel options={options} rotation={0} size={700} />);

    expect(anchor.style.width).toBe("42px");
    expect(anchor.style.height).toBe("45px");
  });

  it("updates aria label when options change", () => {
    const threeOptions = [...options, { id: "3", label: "C", color: "#2a9d8f", weight: 1 }];
    render(<PickerWheel options={threeOptions} rotation={0} />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Picker wheel with 3 options");
  });

  it("deflects the pointer on impact and springs back on the next frame", () => {
    const { container, rerender } = render(<PickerWheel options={options} rotation={0} />);
    const pointerMotion = container.querySelector(".wheel-pointer-motion") as HTMLDivElement;

    act(() => {
      rerender(
        <PickerWheel
          options={options}
          pointerImpact={{ trigger: 1, angularVelocity: 0.028 }}
          rotation={0}
        />
      );
    });

    expect(pointerMotion.style.transform).toBe("rotate(-15deg)");
    expect(pointerMotion.style.transition).toBe("none");

    act(() => {
      vi.advanceTimersByTime(36);
    });
    expect(animationFrames.size).toBe(1);
    runNextAnimationFrame();

    expect(pointerMotion.style.transform).toBe("rotate(0deg)");
    expect(pointerMotion.style.transition).toContain("transform 240ms");
  });

  it("replaces an in-flight recovery when a new impact is triggered", () => {
    const { container, rerender } = render(<PickerWheel options={options} rotation={0} />);
    const pointerMotion = container.querySelector(".wheel-pointer-motion") as HTMLDivElement;

    act(() => {
      rerender(
        <PickerWheel
          options={options}
          pointerImpact={{ trigger: 1, angularVelocity: 0.004 }}
          rotation={0}
        />
      );
    });

    expect(pointerMotion.style.transform).toBe("rotate(-5deg)");

    act(() => {
      rerender(
        <PickerWheel
          options={options}
          pointerImpact={{ trigger: 2, angularVelocity: 0.028 }}
          rotation={0}
        />
      );
    });

    expect(pointerMotion.style.transform).toBe("rotate(-15deg)");

    act(() => {
      vi.advanceTimersByTime(36);
    });
    expect(animationFrames.size).toBe(1);
    runNextAnimationFrame();

    expect(pointerMotion.style.transform).toBe("rotate(0deg)");
  });
});
