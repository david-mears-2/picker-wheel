import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("./config/spinOutcome", () => ({
  getSpinOutcomeConfig: () => ({
    config: { enabled: true, optionIndex: 10 },
    error: null,
  }),
}));

import App from "./App";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows an alert instead of spinning when the configured option index is invalid", async () => {
    const user = userEvent.setup();

    render(<App />);
    await user.click(screen.getByRole("button", { name: /spin/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Configured spin outcome index 10 is out of range for 7 options."
    );
  });
});
