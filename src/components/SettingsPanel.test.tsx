import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsPanel } from "./SettingsPanel";

const defaultProps = {
  title: "My Wheel",
  subtitle: "Pick one",
  bgColor: "#1a1a2e",
  colorPatternIndex: 0,
  onTitleChange: () => {},
  onSubtitleChange: () => {},
  onBgColorChange: () => {},
  onColorPatternChange: () => {},
};

describe("SettingsPanel", () => {
  it("renders title input with current value", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByLabelText("Title")).toHaveValue("My Wheel");
  });

  it("renders subtitle input with current value", () => {
    render(<SettingsPanel {...defaultProps} />);
    expect(screen.getByLabelText("Subtitle")).toHaveValue("Pick one");
  });

  it("calls onTitleChange on each keystroke", async () => {
    const user = userEvent.setup();
    const onTitleChange = vi.fn();
    render(<SettingsPanel {...defaultProps} title="" onTitleChange={onTitleChange} />);

    const input = screen.getByLabelText("Title");
    await user.type(input, "AB");
    expect(onTitleChange).toHaveBeenCalledTimes(2);
    // Controlled input: value stays "" so each keystroke fires with just the typed char
    expect(onTitleChange).toHaveBeenNthCalledWith(1, "A");
    expect(onTitleChange).toHaveBeenNthCalledWith(2, "B");
  });

  it("calls onSubtitleChange on each keystroke", async () => {
    const user = userEvent.setup();
    const onSubtitleChange = vi.fn();
    render(<SettingsPanel {...defaultProps} subtitle="" onSubtitleChange={onSubtitleChange} />);

    const input = screen.getByLabelText("Subtitle");
    await user.type(input, "Hi");
    expect(onSubtitleChange).toHaveBeenCalledTimes(2);
    expect(onSubtitleChange).toHaveBeenNthCalledWith(1, "H");
    expect(onSubtitleChange).toHaveBeenNthCalledWith(2, "i");
  });

  it("renders color pattern buttons", () => {
    render(<SettingsPanel {...defaultProps} />);
    const patternBtns = screen.getAllByRole("button", { name: /color pattern/i });
    expect(patternBtns.length).toBeGreaterThanOrEqual(2);
  });

  it("marks active pattern with aria-pressed", () => {
    render(<SettingsPanel {...defaultProps} colorPatternIndex={1} />);
    const patternBtns = screen.getAllByRole("button", { name: /color pattern/i });
    expect(patternBtns[1]).toHaveAttribute("aria-pressed", "true");
    expect(patternBtns[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onColorPatternChange when pattern is clicked", async () => {
    const user = userEvent.setup();
    const onColorPatternChange = vi.fn();
    render(<SettingsPanel {...defaultProps} onColorPatternChange={onColorPatternChange} />);

    const patternBtns = screen.getAllByRole("button", { name: /color pattern/i });
    await user.click(patternBtns[2]);
    expect(onColorPatternChange).toHaveBeenCalledWith(2);
  });
});
