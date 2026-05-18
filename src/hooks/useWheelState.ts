import { useState, useEffect, useCallback } from "react";
import type { WheelOption, WheelSettings } from "../types";
import { loadSettings, saveSettings } from "../lib/storage";
import { getOptionColor, getRandomOptionColor } from "../lib/colors";

let nextId = 1;
function uid(): string {
  return `opt-${Date.now()}-${nextId++}`;
}

const DEFAULT_SETTINGS: WheelSettings = {
  title: "Disease X",
  subtitle: "A pandemic hits in 2036. Which pathogen is it similar to?",
  options: [
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
  ],
  bgColor: "#000000",
  colorPatternIndex: 0,
};

function applyPatternColors(
  options: WheelOption[],
  patternIndex: number
): WheelOption[] {
  return options.map((o, i) => ({ ...o, color: getOptionColor(patternIndex, i) }));
}

function getInitialState(): WheelSettings {
  const saved = loadSettings();
  if (saved) {
    const hasColors = saved.options.every((o) => o.color);
    if (!hasColors) {
      saved.options = applyPatternColors(saved.options, saved.colorPatternIndex);
    }
    // Migrate: ensure subtitle exists
    if (typeof saved.subtitle !== "string") {
      saved.subtitle = "";
    }
    return saved;
  }
  return {
    ...DEFAULT_SETTINGS,
    options: DEFAULT_SETTINGS.options.map((option) => ({ ...option })),
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

  const setSubtitle = useCallback((subtitle: string) => {
    setState((s) => ({ ...s, subtitle }));
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
        color: getRandomOptionColor(s.options.map((option) => option.color)),
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

  const reorderOptions = useCallback((draggedId: string, targetId: string) => {
    setState((s) => {
      const draggedIndex = s.options.findIndex((option) => option.id === draggedId);
      const targetIndex = s.options.findIndex((option) => option.id === targetId);

      if (
        draggedIndex === -1 ||
        targetIndex === -1 ||
        draggedIndex === targetIndex
      ) {
        return s;
      }

      const reordered = [...s.options];
      const [draggedOption] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, draggedOption);

      return { ...s, options: reordered };
    });
  }, []);

  return {
    state,
    setTitle,
    setSubtitle,
    setBgColor,
    setColorPattern,
    addOption,
    removeOption,
    updateOption,
    reorderOptions,
  };
}
