import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SpinButton } from "./SpinButton";

describe("SpinButton", () => {
  it("renders with SPIN text", () => {
    render(<SpinButton onClick={() => {}} disabled={false} size={500} />);
    expect(screen.getByRole("button", { name: /spin/i })).toHaveTextContent("SPIN");
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SpinButton onClick={onClick} disabled={false} size={500} />);
    await user.click(screen.getByRole("button", { name: /spin/i }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is true", () => {
    render(<SpinButton onClick={() => {}} disabled={true} size={500} />);
    expect(screen.getByRole("button", { name: /spin/i })).toBeDisabled();
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<SpinButton onClick={onClick} disabled={true} size={500} />);
    await user.click(screen.getByRole("button", { name: /spin/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("scales button size proportional to wheel size", () => {
    const { rerender } = render(<SpinButton onClick={() => {}} disabled={false} size={500} />);
    const btn = screen.getByRole("button", { name: /spin/i });
    const smallWidth = btn.style.width;

    rerender(<SpinButton onClick={() => {}} disabled={false} size={1000} />);
    const largeWidth = btn.style.width;

    expect(parseFloat(largeWidth)).toBeGreaterThan(parseFloat(smallWidth));
  });
});
