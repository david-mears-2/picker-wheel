import { useState, useEffect, useCallback } from "react";
import type { WheelOption, SpinResult, WheelSettings } from "../types";
import { loadSettings, saveSettings } from "../lib/storage";
import { getOptionColor } from "../lib/colors";

let nextId = 1;
function uid(): string {
  return `opt-${Date.now()}-${nextId++}`;
}

const DEFAULT_OPTIONS: () => WheelOption[] = () => [
  { id: uid(), label: "Option 1", color: "", weight: 1 },
  { id: uid(), label: "Option 2", color: "", weight: 1 },
  { id: uid(), label: "Option 3", color: "", weight: 1 },
  { id: uid(), label: "Option 4", color: "", weight: 1 },
];

function applyPatternColors(
  options: WheelOption[],
  patternIndex: number
): WheelOption[] {
  return options.map((o, i) => ({ ...o, color: getOptionColor(patternIndex, i) }));
}

function getInitialState(): WheelSettings {
  const saved = loadSettings();
  if (saved) {
    // Re-apply color pattern if colors are empty
    const hasColors = saved.options.every((o) => o.color);
    if (!hasColors) {
      saved.options = applyPatternColors(saved.options, saved.colorPatternIndex);
    }
    return saved;
  }
  const patternIndex = 0;
  return {
    title: "Picker Wheel",
    options: applyPatternColors(DEFAULT_OPTIONS(), patternIndex),
    results: [],
    bgColor: "#1a1a2e",
    colorPatternIndex: patternIndex,
  };
}

export function useWheelState() {
  const [state, setState] = useState<WheelSettings>(getInitialState);

  // Persist to localStorage on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => saveSettings(state), 300);
    return () => clearTimeout(timer);
  }, [state]);

  const setTitle = useCallback((title: string) => {
    setState((s) => ({ ...s, title }));
  }, []);

  const setBgColor = useCallback((bgColor: string) => {
    setState((s) => ({ ...s, bgColor }));
  }, []);

  const setColorPattern = useCallback((patternIndex: number) => {
    setState((s) => ({
      ...s,
      colorPatternIndex: patternIndex,
      options: applyPatternColors(s.options, patternIndex),
    }));
  }, []);

  const addOption = useCallback((label: string) => {
    setState((s) => {
      const newOpt: WheelOption = {
        id: uid(),
        label,
        color: getOptionColor(s.colorPatternIndex, s.options.length),
        weight: 1,
      };
      return { ...s, options: [...s.options, newOpt] };
    });
  }, []);

  const removeOption = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      options: s.options.filter((o) => o.id !== id),
    }));
  }, []);

  const updateOption = useCallback(
    (id: string, updates: Partial<Pick<WheelOption, "label" | "color" | "weight">>) => {
      setState((s) => ({
        ...s,
        options: s.options.map((o) =>
          o.id === id ? { ...o, ...updates } : o
        ),
      }));
    },
    []
  );

  const shuffleOptions = useCallback(() => {
    setState((s) => {
      const shuffled = [...s.options];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return { ...s, options: applyPatternColors(shuffled, s.colorPatternIndex) };
    });
  }, []);

  const sortOptions = useCallback(() => {
    setState((s) => {
      const sorted = [...s.options].sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      return { ...s, options: applyPatternColors(sorted, s.colorPatternIndex) };
    });
  }, []);

  const addResult = useCallback((result: SpinResult) => {
    setState((s) => ({
      ...s,
      results: [result, ...s.results],
    }));
  }, []);

  const clearResults = useCallback(() => {
    setState((s) => ({ ...s, results: [] }));
  }, []);

  return {
    state,
    setTitle,
    setBgColor,
    setColorPattern,
    addOption,
    removeOption,
    updateOption,
    shuffleOptions,
    sortOptions,
    addResult,
    clearResults,
  };
}
