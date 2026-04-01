import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResultDisplay } from "./ResultDisplay";

describe("ResultDisplay", () => {
  it("renders the winner label", () => {
    render(<ResultDisplay label="Pizza" color="#e76f51" onDismiss={() => {}} />);
    expect(screen.getByText("Pizza")).toBeInTheDocument();
  });

  it("has role=status for accessibility", () => {
    render(<ResultDisplay label="Pizza" color="#e76f51" onDismiss={() => {}} />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("applies the color as background", () => {
    render(<ResultDisplay label="Pizza" color="#e76f51" onDismiss={() => {}} />);
    const label = screen.getByText("Pizza");
    expect(label).toHaveStyle({ backgroundColor: "#e76f51" });
  });

  it("calls onDismiss when clicked", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(<ResultDisplay label="Pizza" color="#e76f51" onDismiss={onDismiss} />);
    await user.click(screen.getByRole("status"));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("includes label in aria-label", () => {
    render(<ResultDisplay label="Tacos" color="#000" onDismiss={() => {}} />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Result: Tacos");
  });
});
