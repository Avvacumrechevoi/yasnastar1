import { describe, expect, it } from "vitest";

import {
  buildYasnaLibraryPanelCopy,
  buildYasnaLibraryRow,
  pruneYasnaLibrarySelection,
  removeYasnaLibrarySelection,
  toggleYasnaLibrarySelection,
} from "./yasnaLibrary";

const catalog = [
  {
    id: "meeting-atmosphere",
    title: "Атмосфера встречи",
    family: "Переговоры",
    summary: "Читает общий воздух встречи.",
  },
  {
    id: "clouds",
    title: "Облака проблем",
    family: "Переговоры",
    summary: "Собирает узлы и плотности проблемы.",
  },
  {
    id: "water-cycle",
    title: "Круговорот воды",
    family: "Природа",
    summary: "Показывает путь движения и превращения.",
  },
];

describe("yasnaLibrary", () => {
  it("adds and removes selected yasnas while preserving activation order", () => {
    const firstPass = toggleYasnaLibrarySelection([], "meeting-atmosphere");
    const secondPass = toggleYasnaLibrarySelection(firstPass, "clouds");
    const thirdPass = toggleYasnaLibrarySelection(secondPass, "water-cycle");

    expect(thirdPass).toEqual(["meeting-atmosphere", "clouds", "water-cycle"]);
    expect(toggleYasnaLibrarySelection(thirdPass, "clouds")).toEqual([
      "meeting-atmosphere",
      "water-cycle",
    ]);
  });

  it("removes only the requested yasna from the horizontal row selection", () => {
    expect(removeYasnaLibrarySelection(["meeting-atmosphere", "clouds", "water-cycle"], "clouds")).toEqual([
      "meeting-atmosphere",
      "water-cycle",
    ]);
  });

  it("prunes unknown and duplicate ids when catalog changes", () => {
    expect(pruneYasnaLibrarySelection(["meeting-atmosphere", "ghost", "clouds", "clouds"], catalog.map((item) => item.id))).toEqual([
      "meeting-atmosphere",
      "clouds",
    ]);
  });

  it("builds the selected row in user-picked order and marks the active yasna", () => {
    const row = buildYasnaLibraryRow({
      yasnas: catalog,
      selectedIds: ["clouds", "meeting-atmosphere"],
      activeYasnaId: "meeting-atmosphere",
    });

    expect(row.map((item) => item.id)).toEqual(["clouds", "meeting-atmosphere"]);
    expect(row.map((item) => item.isActive)).toEqual([false, true]);
    expect(row[0]?.title).toBe("Облака проблем");
  });

  it("keeps only the direct library trigger in the compact panel copy", () => {
    expect(buildYasnaLibraryPanelCopy()).toEqual({
      triggerLabel: "Открыть библиотеку",
    });
  });
});
