import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
        onShuffle={noop}
        onSort={noop}
      />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();
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
        onShuffle={noop}
        onSort={noop}
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
        onShuffle={noop}
        onSort={noop}
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
        onShuffle={noop}
        onSort={noop}
      />
    );

    await user.click(screen.getByRole("button", { name: /add/i }));
    expect(onAdd).not.toHaveBeenCalled();
  });

  it("calls onShuffle when Shuffle is clicked", async () => {
    const user = userEvent.setup();
    const onShuffle = vi.fn();
    render(
      <OptionList
        options={defaultOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onShuffle={onShuffle}
        onSort={noop}
      />
    );
    await user.click(screen.getByRole("button", { name: /shuffle/i }));
    expect(onShuffle).toHaveBeenCalledOnce();
  });

  it("calls onSort when Sort is clicked", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(
      <OptionList
        options={defaultOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onShuffle={noop}
        onSort={onSort}
      />
    );
    await user.click(screen.getByRole("button", { name: /sort/i }));
    expect(onSort).toHaveBeenCalledOnce();
  });

  it("does not allow removing when only 2 options exist", () => {
    const twoOptions = defaultOptions.slice(0, 2);
    render(
      <OptionList
        options={twoOptions}
        onAdd={noop}
        onRemove={noop}
        onUpdate={noop}
        onShuffle={noop}
        onSort={noop}
      />
    );
    expect(screen.queryByRole("button", { name: /remove/i })).not.toBeInTheDocument();
  });
});
