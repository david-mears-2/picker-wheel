import rawSpinOutcomeConfig from "./spin-outcome.json";
import type { SpinOutcomeOverrideConfig } from "../types";

export interface SpinOutcomeConfigResult {
  config: SpinOutcomeOverrideConfig;
  error: string | null;
}

const DEFAULT_SPIN_OUTCOME_CONFIG: SpinOutcomeOverrideConfig = {
  enabled: false,
  optionIndex: 0,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function parseSpinOutcomeConfig(raw: unknown): SpinOutcomeConfigResult {
  if (!isRecord(raw)) {
    return {
      config: DEFAULT_SPIN_OUTCOME_CONFIG,
      error: "Spin outcome config must be an object.",
    };
  }

  const { enabled, optionIndex } = raw;

  if (typeof enabled !== "boolean") {
    return {
      config: DEFAULT_SPIN_OUTCOME_CONFIG,
      error: 'Spin outcome config field "enabled" must be a boolean.',
    };
  }

  if (
    typeof optionIndex !== "number" ||
    !Number.isInteger(optionIndex) ||
    optionIndex < 0
  ) {
    return {
      config: DEFAULT_SPIN_OUTCOME_CONFIG,
      error: 'Spin outcome config field "optionIndex" must be a non-negative integer.',
    };
  }

  return {
    config: {
      enabled,
      optionIndex,
    },
    error: null,
  };
}

export function getSpinOutcomeConfig(): SpinOutcomeConfigResult {
  return parseSpinOutcomeConfig(rawSpinOutcomeConfig);
}
