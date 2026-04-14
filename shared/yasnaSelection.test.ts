import { describe, expect, it } from "vitest";

import { areAllMechanicsSelected, getNextMechanicSelection } from "./yasnaSelection";

describe("yasnaSelection", () => {
  const allIds = ["support", "water", "earth"];

  it("detects when all mechanics are selected", () => {
    expect(areAllMechanicsSelected([], allIds)).toBe(false);
    expect(areAllMechanicsSelected(["support"], allIds)).toBe(false);
    expect(areAllMechanicsSelected(allIds, allIds)).toBe(true);
  });

  it("toggles between full selection and reset", () => {
    expect(getNextMechanicSelection([], allIds)).toEqual(allIds);
    expect(getNextMechanicSelection(["support"], allIds)).toEqual(allIds);
    expect(getNextMechanicSelection(allIds, allIds)).toEqual([]);
  });
});
