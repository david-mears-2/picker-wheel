import { describe, expect, it } from "vitest";
import { parseSpinOutcomeConfig } from "./spinOutcome";

describe("parseSpinOutcomeConfig", () => {
  it("parses a valid config object", () => {
    expect(parseSpinOutcomeConfig({ enabled: true, optionIndex: 2 })).toEqual({
      config: { enabled: true, optionIndex: 2 },
      error: null,
    });
  });

  it("returns an error when config is not an object", () => {
    expect(parseSpinOutcomeConfig(null)).toEqual({
      config: { enabled: false, optionIndex: 0 },
      error: "Spin outcome config must be an object.",
    });
  });

  it("returns an error for a non-boolean enabled field", () => {
    expect(parseSpinOutcomeConfig({ enabled: "yes", optionIndex: 0 })).toEqual({
      config: { enabled: false, optionIndex: 0 },
      error: 'Spin outcome config field "enabled" must be a boolean.',
    });
  });

  it("returns an error for a negative option index", () => {
    expect(parseSpinOutcomeConfig({ enabled: true, optionIndex: -1 })).toEqual({
      config: { enabled: false, optionIndex: 0 },
      error: 'Spin outcome config field "optionIndex" must be a non-negative integer.',
    });
  });
});
