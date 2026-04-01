import { describe, it, expect, beforeEach, vi } from "vitest";
import { loadSettings, saveSettings } from "./storage";
import type { WheelSettings } from "../types";

const STORAGE_KEY = "picker-wheel-settings";

function makeSettings(overrides: Partial<WheelSettings> = {}): WheelSettings {
  return {
    title: "Test Wheel",
    subtitle: "Sub",
    options: [
      { id: "1", label: "A", color: "#fff", weight: 1 },
      { id: "2", label: "B", color: "#000", weight: 2 },
    ],
    bgColor: "#1a1a2e",
    colorPatternIndex: 0,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("saveSettings", () => {
  it("saves settings to localStorage", () => {
    const settings = makeSettings();
    saveSettings(settings);
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored!)).toEqual(settings);
  });
});

describe("loadSettings", () => {
  it("returns null when nothing is stored", () => {
    expect(loadSettings()).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not json");
    expect(loadSettings()).toBeNull();
  });

  it("returns null when stored data lacks title", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ options: [] }));
    expect(loadSettings()).toBeNull();
  });

  it("returns null when stored data lacks options array", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ title: "X" }));
    expect(loadSettings()).toBeNull();
  });

  it("loads valid settings", () => {
    const settings = makeSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    expect(loadSettings()).toEqual(settings);
  });

  it("strips legacy results field during migration", () => {
    const legacy = { ...makeSettings(), results: [{ label: "old" }] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(legacy));
    const loaded = loadSettings();
    expect(loaded).not.toBeNull();
    expect(loaded).not.toHaveProperty("results");
  });

  it("handles localStorage.getItem throwing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(loadSettings()).toBeNull();
    vi.restoreAllMocks();
  });
});
