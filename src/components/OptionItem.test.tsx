import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptionItem } from "./OptionItem";
import type { WheelOption } from "../types";

function makeOption(overrides: Partial<WheelOption> = {}): WheelOption {
  return { id: "opt-1", label: "Pizza", color: "#e76f51", weight: 1, ...overrides };
}

describe("OptionItem", () => {
  it("renders the option label", () => {
    render(
      <ul>
        <OptionItem option={makeOption()} onUpdate={() => {}} onRemove={() => {}} canRemove={true} />
      </ul>
    );
    expect(screen.getByText("Pizza")).toBeInTheDocument();
  });

  it("shows the current weight value", () => {
    render(
      <ul>
        <OptionItem option={makeOption({ weight: 3.5 })} onUpdate={() => {}} onRemove={() => {}} canRemove={true} />
      </ul>
    );
    expect(screen.getByDisplayValue("3.5")).toBeInTheDocument();
  });

  it("calls onUpdate with increased weight when + is clicked", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <ul>
        <OptionItem option={makeOption({ weight: 1 })} onUpdate={onUpdate} onRemove={() => {}} canRemove={true} />
      </ul>
    );
    await user.click(screen.getByRole("button", { name: /increase weight/i }));
    expect(onUpdate).toHaveBeenCalledWith("opt-1", { weight: 1.1 });
  });

  it("calls onUpdate with decreased weight when − is clicked", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <ul>
        <OptionItem option={makeOption({ weight: 1 })} onUpdate={onUpdate} onRemove={() => {}} canRemove={true} />
      </ul>
    );
    await user.click(screen.getByRole("button", { name: /decrease weight/i }));
    expect(onUpdate).toHaveBeenCalledWith("opt-1", { weight: 0.9 });
  });

  it("clamps weight to minimum 0.1", () => {
    const onUpdate = vi.fn();
    render(
      <ul>
        <OptionItem option={makeOption({ weight: 0.1 })} onUpdate={onUpdate} onRemove={() => {}} canRemove={true} />
      </ul>
    );
    // − button should be disabled at min weight
    const decreaseBtn = screen.getByRole("button", { name: /decrease weight/i });
    expect(decreaseBtn).toBeDisabled();
  });

  it("clamps weight to maximum 10", async () => {
    const onUpdate = vi.fn();
    render(
      <ul>
        <OptionItem option={makeOption({ weight: 10 })} onUpdate={onUpdate} onRemove={() => {}} canRemove={true} />
      </ul>
    );
    const increaseBtn = screen.getByRole("button", { name: /increase weight/i });
    expect(increaseBtn).toBeDisabled();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ul>
        <OptionItem option={makeOption()} onUpdate={() => {}} onRemove={onRemove} canRemove={true} />
      </ul>
    );
    await user.click(screen.getByRole("button", { name: /remove pizza/i }));
    expect(onRemove).toHaveBeenCalledWith("opt-1");
  });

  it("hides remove button when canRemove is false", () => {
    render(
      <ul>
        <OptionItem option={makeOption()} onUpdate={() => {}} onRemove={() => {}} canRemove={false} />
      </ul>
    );
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("enters edit mode on double-click and saves on Enter", async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();
    render(
      <ul>
        <OptionItem option={makeOption()} onUpdate={onUpdate} onRemove={() => {}} canRemove={true} />
      </ul>
    );

    await user.dblClick(screen.getByText("Pizza"));
    const input = screen.getByRole("textbox", { name: /edit option/i });
    await user.clear(input);
    await user.type(input, "Tacos{Enter}");
    expect(onUpdate).toHaveBeenCalledWith("opt-1", { label: "Tacos" });
  });
});
