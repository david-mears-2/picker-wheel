import type { WheelSettings } from "../types";

const STORAGE_KEY = "picker-wheel-settings";

export function loadSettings(): WheelSettings | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.title === "string" &&
      Array.isArray(parsed.options)
    ) {
      // Strip legacy fields (e.g. results) during migration
      const { results, ...rest } = parsed;
      void results;
      return rest as WheelSettings;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveSettings(settings: WheelSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}
