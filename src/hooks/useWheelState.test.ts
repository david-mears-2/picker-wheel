import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWheelState } from "./useWheelState";

beforeEach(() => {
  localStorage.clear();
});

describe("useWheelState", () => {
  it("initializes with default state when localStorage is empty", () => {
    const { result } = renderHook(() => useWheelState());
    expect(result.current.state.title).toBe("Disease X");
    expect(result.current.state.subtitle).toBe(
      "A pandemic hits in 2036. Which pathogen is it similar to?"
    );
    expect(result.current.state.options).toEqual([
      {
        id: "opt-1777557300285-7",
        label: "Influenza 1918 (Spanish flu)",
        color: "#e76f51",
        weight: 1.0,
      },
      {
        id: "opt-1777557189326-4",
        label: "Covid-19 Delta",
        color: "#f4a261",
        weight: 1.0,
      },
      {
        id: "opt-1777557006067-2",
        label: "Covid-19 wild-type",
        color: "#e9c46a",
        weight: 1.0,
      },
      {
        id: "opt-1777557256942-6",
        label: "Influenza 1957",
        color: "#2a9d8f",
        weight: 1.0,
      },
      {
        id: "opt-1777557174806-3",
        label: "Covid-19 Omicron",
        color: "#264653",
        weight: 1.0,
      },
      {
        id: "opt-1777557239024-5",
        label: "Influenza 2009 (Swine flu)",
        color: "#e63946",
        weight: 1.0,
      },
      {
        id: "opt-1777556974558-1",
        label: "SARS 2004",
        color: "#457b9d",
        weight: 1.0,
      },
    ]);
    expect(result.current.state.options.length).toBe(7);
    expect(result.current.state.bgColor).toBe("#000000");
    expect(result.current.state.colorPatternIndex).toBe(0);
  });

  it("all options have colors assigned", () => {
    const { result } = renderHook(() => useWheelState());
    for (const opt of result.current.state.options) {
      expect(opt.color).toBeTruthy();
    }
  });

  it("setTitle updates the title", () => {
    const { result } = renderHook(() => useWheelState());
    act(() => result.current.setTitle("New Title"));
    expect(result.current.state.title).toBe("New Title");
  });

  it("setSubtitle updates the subtitle", () => {
    const { result } = renderHook(() => useWheelState());
    act(() => result.current.setSubtitle("New Subtitle"));
    expect(result.current.state.subtitle).toBe("New Subtitle");
  });

  it("setBgColor updates the background color", () => {
    const { result } = renderHook(() => useWheelState());
    act(() => result.current.setBgColor("#ff0000"));
    expect(result.current.state.bgColor).toBe("#ff0000");
  });

  it("addOption adds a new option", () => {
    const { result } = renderHook(() => useWheelState());
    const initialCount = result.current.state.options.length;
    act(() => result.current.addOption("New Option"));
    expect(result.current.state.options.length).toBe(initialCount + 1);
    expect(result.current.state.options[initialCount].label).toBe("New Option");
    expect(result.current.state.options[initialCount].weight).toBe(1);
  });

  it("removeOption removes an option by id", () => {
    const { result } = renderHook(() => useWheelState());
    const firstId = result.current.state.options[0].id;
    act(() => result.current.removeOption(firstId));
    expect(result.current.state.options.find(o => o.id === firstId)).toBeUndefined();
  });

  it("updateOption updates label, weight, and color", () => {
    const { result } = renderHook(() => useWheelState());
    const firstId = result.current.state.options[0].id;
    act(() => result.current.updateOption(firstId, { label: "Updated", weight: 5.5, color: "#abc123" }));
    const updated = result.current.state.options.find(o => o.id === firstId)!;
    expect(updated.label).toBe("Updated");
    expect(updated.weight).toBe(5.5);
    expect(updated.color).toBe("#abc123");
  });

  it("setColorPattern recolors all options", () => {
    const { result } = renderHook(() => useWheelState());
    const oldColors = result.current.state.options.map(o => o.color);
    act(() => result.current.setColorPattern(2));
    const newColors = result.current.state.options.map(o => o.color);
    expect(result.current.state.colorPatternIndex).toBe(2);
    // Colors should change (pattern 0 → 2)
    expect(newColors).not.toEqual(oldColors);
  });

  it("reorderOptions moves a dragged option to the drop target position", () => {
    const { result } = renderHook(() => useWheelState());

    act(() => {
      result.current.reorderOptions("opt-1777556974558-1", "opt-1777557189326-4");
    });

    expect(result.current.state.options.map(o => o.id)).toEqual([
      "opt-1777557300285-7",
      "opt-1777556974558-1",
      "opt-1777557189326-4",
      "opt-1777557006067-2",
      "opt-1777557256942-6",
      "opt-1777557174806-3",
      "opt-1777557239024-5",
    ]);
  });

  it("loads persisted settings from localStorage", () => {
    const saved = {
      title: "Saved Wheel",
      subtitle: "Saved Sub",
      options: [
        { id: "s1", label: "Saved A", color: "#111", weight: 2 },
        { id: "s2", label: "Saved B", color: "#222", weight: 3 },
      ],
      bgColor: "#abcdef",
      colorPatternIndex: 1,
    };
    localStorage.setItem("picker-wheel-settings", JSON.stringify(saved));

    const { result } = renderHook(() => useWheelState());
    expect(result.current.state.title).toBe("Saved Wheel");
    expect(result.current.state.subtitle).toBe("Saved Sub");
    expect(result.current.state.options).toHaveLength(2);
  });
});
