import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OptionList } from "./OptionList";
import type { WheelOption } from "../types";

const defaultOptions: WheelOption[] = [
  { id: "1", label: "Alpha", color: "#e76f51", weight: 1 },
  { id: "2", label: "Beta", color: "#f4a261", weight: 2 },
  { id: "3", label: "Gamma", color: "#2a9d8f", weight: 1 },
];

const noop = () => {};

describe("OptionList", () => {
  it("renders all options", () => {
    render(
      <OptionList
        options={defaultOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
  });

  it("shows a subtle drag-and-drop hint when reordering is available", () => {
    render(
      <OptionList
        options={defaultOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );

    expect(screen.getByText(/drag and drop to reorder/i)).toBeInTheDocument();
  });

  it("calls onAdd when typing and clicking Add", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <OptionList
        options={defaultOptions}
        onAdd={onAdd}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );

    const input = screen.getByPlaceholderText(/enter option/i);
    await user.type(input, "Delta");
    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith("Delta");
  });

  it("calls onAdd on Enter key", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <OptionList
        options={defaultOptions}
        onAdd={onAdd}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );

    const input = screen.getByPlaceholderText(/enter option/i);
    await user.type(input, "Epsilon{Enter}");
    expect(onAdd).toHaveBeenCalledWith("Epsilon");
  });

  it("does not call onAdd for empty/whitespace input", async () => {
    const user = userEvent.setup();
    const onAdd = vi.fn();
    render(
      <OptionList
        options={defaultOptions}
        onAdd={onAdd}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onReorder when an option is dropped onto another option", () => {
    const onReorder = vi.fn();
    render(
      <OptionList
        options={defaultOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onReorder={onReorder}
      />
    );

    const draggedItem = screen.getByText("Alpha").closest("li");
    const targetItem = screen.getByText("Gamma").closest("li");
    expect(draggedItem).not.toBeNull();
    expect(targetItem).not.toBeNull();

    fireEvent.dragStart(draggedItem!);
    fireEvent.dragOver(targetItem!);
    fireEvent.drop(targetItem!);

    expect(onReorder).toHaveBeenCalledWith("1", "3");
  });

  it("does not allow removing when only 2 options exist", () => {
    const twoOptions = defaultOptions.slice(0, 2);
    render(
      <OptionList
        options={twoOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });

  it("does not render shuffle or sort buttons", () => {
    render(
      <OptionList
        options={defaultOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onReorder={noop}
      />
    );

    expect(screen.queryByRole("button", { name: /shuffle/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /sort/i })).not.toBeInTheDocument();
  });
});
