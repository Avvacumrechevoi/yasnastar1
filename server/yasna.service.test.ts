import { describe, expect, it } from "vitest";
import { getNextMechanicSelection } from "@shared/yasnaSelection";
import { appRouter } from "./routers";
import { loadYasnaCatalogSnapshot } from "./yasna/repository";
import { getRuntimeYasnaData, refreshYasnaRuntimeCatalog } from "./yasna/runtimeCatalog";
import {
  computeYasnaState,
  getOppositePoint,
  getPointEssence,
  getPointLabel,
  getPointTooltip,
} from "./yasna/service";

describe("yasna.service", () => {
  it("normalizes point label, essence and tooltip", () => {
    const raw = "ночь (тайный союз) | Ночь; отсутствие света; тайный союз | Сон; тайный союз; сговор";

    expect(getPointLabel(raw)).toBe("Ночь");
    expect(getPointEssence(raw)).toBe("Ночь · отсутствие света · тайный союз");
    expect(getPointTooltip(raw)).toBe(
      "ночь (тайный союз)\nНочь; отсутствие света; тайный союз\nСон; тайный союз; сговор",
    );
  });

  it("keeps shelf labels compact with one or two words at most", () => {
    expect(getPointLabel("мусорная куча, туалет, компостная яма | описание")).toBe("Туалет");
    expect(getPointLabel("утренняя заря над водой | описание")).toBe("Утренняя заря");
    expect(getPointLabel("растекание | Вода расползается по поверхности или под землёй неуправляемым течением и теряет форму потока.")).toBe("Растекание");
    expect(getPointLabel("калитка | описание")).toBe("Калитка");
  });

  it("toggles all mechanics into reset state when every mechanic is active", () => {
    const allIds = ["support-cross", "faith-cross", "prana-air"];

    expect(getNextMechanicSelection([], allIds)).toEqual(allIds);
    expect(getNextMechanicSelection(["support-cross"], allIds)).toEqual(allIds);
    expect(getNextMechanicSelection(allIds, allIds)).toEqual([]);
  });

  it("calculates opposite point by 12-point axis", () => {
    expect(getOppositePoint(0)).toBe(6);
    expect(getOppositePoint(9)).toBe(3);
  });

  it("builds fallback state for default yasna without active point", () => {
    const state = computeYasnaState();

    expect(state.defaultYasnaId).toBeTruthy();
    expect(state.activeYasna.id).toBe(state.defaultYasnaId);
    expect(state.activeYasna.points).toHaveLength(12);
    expect(state.selectedPoint).toBeNull();
    expect(state.inspector.title).toBe(state.activeYasna.title);
    expect(state.inspector.primaryText).toContain(state.activeYasna.summary.slice(0, 20));
  });

  it("highlights selected point, opposite point and mechanic contour", () => {
    const state = computeYasnaState({
      yasnaId: "суток",
      selectedPoint: 0,
      activeMechanicIds: ["support-cross", "opposition-link"],
    });

    expect(state.selectedPoint?.index).toBe(0);
    expect(state.oppositePoint?.index).toBe(6);
    expect(state.highlightedPointIndices).toEqual([0, 3, 6, 9]);
    expect(state.selectedPointMechanics.map((item) => item.id)).toEqual(["support-cross", "opposition-link"]);
    expect(state.inspector.contextText).toContain("противоположной 6");
    expect(state.inspector.lessonPreviews.length).toBeGreaterThan(0);
    expect(state.inspector.lessonPreviews[0]?.title.trim().length).toBeGreaterThan(0);
    expect(state.inspector.lessonPreviews[0]?.description.trim().length).toBeGreaterThan(0);
    expect(state.inspector.lessonPreviews.some((item) => Boolean(item.sourceLesson))).toBe(true);
    expect(state.inspector.lessonPreviews.some((item) => Boolean(item.sourceFile))).toBe(true);
  });

  it("recomputes inspector mechanic context when the selected point changes", () => {
    const pointZeroState = computeYasnaState({
      yasnaId: "суток",
      selectedPoint: 0,
      activeMechanicIds: ["support-cross", "opposition-link"],
    });
    const pointOneState = computeYasnaState({
      yasnaId: "суток",
      selectedPoint: 1,
      activeMechanicIds: ["support-cross", "opposition-link"],
    });

    expect(pointZeroState.inspector.activeMechanics.map((item) => item.id)).toEqual([
      "support-cross",
      "opposition-link",
    ]);
    expect(pointOneState.inspector.activeMechanics.map((item) => item.id)).toEqual([
      "support-cross",
      "opposition-link",
    ]);
    expect(pointZeroState.inspector.selectedPoint?.index).toBe(0);
    expect(pointOneState.inspector.selectedPoint?.index).toBe(1);
    expect(pointZeroState.inspector.activeMechanics[0]?.contextText).toContain("проходит через эту полочку");
    expect(pointOneState.inspector.activeMechanics[0]?.contextText).toContain("не проходит через эту полочку напрямую");
    expect(pointZeroState.inspector.activeMechanics[1]?.contextText).toContain("противоположной 6");
    expect(pointOneState.inspector.activeMechanics[1]?.contextText).toContain("противоположной 7");
  });

  it("builds concise shelf and mechanic descriptions for water-cycle yasna", () => {
    const state = computeYasnaState({
      yasnaId: "круговорота-воды",
      selectedPoint: 3,
      activeMechanicIds: ["support-cross", "opposition-link"],
    });

    expect(state.activeYasna.id).toBe("круговорота-воды");
    expect(state.selectedPoint?.label).toBe("Поверхность водоёма");
    expect(state.selectedPoint?.essence).toBe("Здесь вода держится общей массой, но уже готова оторваться в испарение.");
    expect(state.inspector.activeMechanics[0]?.contextText).toBe(
      "Механика «Крест Опоры» проходит через эту полочку и показывает: Задаёт базовую конструкцию звезды: связывает тайный и явный союз по линии 0–6 и выводит борьбу света и тьмы на линию 3–9.",
    );
    expect(state.inspector.activeMechanics[1]?.contextText).toBe(
      "Механика «Напротив» связывает эту полочку с противоположной 9 — Касание земли.",
    );
  });

  it("builds guided negotiation mode from backend preset for cloudiness yasna", () => {
    const state = computeYasnaState({
      yasnaId: "облачности",
      analysisMode: "guided",
      presetId: "storm-core",
    });

    expect(state.analysisMode).toBe("guided");
    expect(state.activeYasna.id).toBe("облачности");
    expect(state.negotiation.activePreset?.id).toBe("storm-core");
    expect(state.negotiation.presets.length).toBeGreaterThan(0);
    expect(state.activeMechanics.map((item) => item.id)).toEqual(state.negotiation.activePreset?.recommendedMechanicIds);
    expect(state.ui.presetPrompt.length).toBeGreaterThan(20);
    expect(state.negotiation.modeSummary.length).toBeGreaterThan(20);
  });

  it("exposes the new negotiation atmosphere yasna as default server-driven preset mode", () => {
    const state = computeYasnaState({
      yasnaId: "атмосфера-встречи",
      analysisMode: "guided",
      presetId: "clear-air",
      selectedPoint: 6,
    });

    expect(state.activeYasna.id).toBe("атмосфера-встречи");
    expect(state.negotiation.lens.id).toBe("meeting-atmosphere");
    expect(state.negotiation.activePreset?.id).toBe("clear-air");
    expect(state.negotiation.modeSummary).toContain("атмосферы встречи");
    expect(state.inspector.primaryText).toContain("В логике линзы");
    expect(state.inspector.primaryText).toContain(state.negotiation.lens.title);
    expect(state.inspector.primaryText).toContain(state.negotiation.lens.question);
    expect(state.inspector.lessonFocus?.title).toBe("Ясный контакт");
    expect(state.inspector.lessonFocus?.description).toContain("Ясный контакт.");
    expect(state.inspector.lessonPreviews[0]?.description).toContain("Ясный контакт.");
    expect(state.activeMechanics.map((item) => item.id)).toEqual(["unity-line", "prana-water", "support-cross"]);
    expect(state.negotiation.insights.some((item) => item.title === "Примета прояснения" && item.text.includes("Предсказание по текущей полочке"))).toBe(true);
    expect(state.negotiation.recommendations.some((item) => item.title === "Проверить предсказание атмосферы")).toBe(true);
    expect(
      state.negotiation.recommendations.some(
        (item) => item.title === "Управленческий приём: Перевести ясность в рабочий ход" && item.description.includes("Используйте окно ясности"),
      ),
    ).toBe(true);
  });

  it("builds dedicated problem-image guidance with cloud-type tactics", () => {
    const state = computeYasnaState({
      yasnaId: "образ-проблемы",
      analysisMode: "guided",
      presetId: "storm-core",
    });

    expect(state.activeYasna.id).toBe("образ-проблемы");
    expect(state.negotiation.lens.id).toBe("problem-image");
    expect(state.negotiation.activePreset?.id).toBe("storm-core");
    expect(state.negotiation.activePreset?.title).toBe("Грозовое ядро");
    expect(state.negotiation.recommendations.length).toBeGreaterThan(0);
  });

  it("adds server-driven cloud profile and tactic for selected negotiation point", () => {
    const state = computeYasnaState({
      yasnaId: "облака-проблем",
      analysisMode: "guided",
      presetId: "dense-cluster",
      selectedPoint: 9,
    });

    expect(state.activeYasna.id).toBe("облака-проблем");
    expect(state.negotiation.insights.some((item) => item.title === "Грозовой узел повторов")).toBe(true);
    expect(
      state.negotiation.recommendations.some(
        (item) => item.title === "Управленческий приём: Грозовой узел повторов" && item.description.includes("Сначала остановите сам цикл"),
      ),
    ).toBe(true);
  });

  it("reuses cached state for identical yasna fill and selection", () => {
    const input = {
      yasnaId: "облачности",
      selectedPoint: 4,
      activeMechanicIds: ["prana-air", "opposition-link"],
      analysisMode: "guided" as const,
      presetId: "storm-core",
    };

    const firstState = computeYasnaState(input);
    const secondState = computeYasnaState(input);

    expect(secondState).toBe(firstState);
    expect(secondState.selectedPoint?.index).toBe(4);
    expect(secondState.activeYasna.id).toBe("облачности");
  });

  it("provides separate color-rainbow yasna with its own negotiation lens", () => {
    const state = computeYasnaState({
      yasnaId: "цветов-радуги",
      analysisMode: "guided",
      presetId: "base-tone",
    });

    expect(state.activeYasna.id).toBe("цветов-радуги");
    expect(state.negotiation.lens.id).toBe("color-palette");
    expect(state.negotiation.activePreset?.id).toBe("base-tone");
    expect(state.negotiation.modeSummary).toContain("тон");
  });

  it("exposes the new bedroom yasna as real server-driven room model", () => {
    const state = computeYasnaState({
      yasnaId: "спальни",
      selectedPoint: 9,
      activeMechanicIds: ["support-cross"],
    });

    expect(state.activeYasna.id).toBe("спальни");
    expect(state.activeYasna.title).toBe("Спальня");
    expect(state.selectedPoint?.label).toBe("Главная кровать");
    expect(state.selectedPoint?.essence).toContain("центр сна и отдыха");
    expect(state.inspector.lessonPreviews.length).toBeGreaterThan(0);
    expect(state.inspector.lessonPreviews.some((item) => item.sourceFile === "5__Ясна_спальни_Урок_1.txt")).toBe(true);
  });

  it("exposes the new kitchen yasna as real server-driven room model", () => {
    const state = computeYasnaState({
      yasnaId: "кухни",
      selectedPoint: 3,
      activeMechanicIds: ["support-cross"],
    });

    expect(state.activeYasna.id).toBe("кухни");
    expect(state.activeYasna.title).toBe("Кухня");
    expect(state.selectedPoint?.label).toBe("Плита");
    expect(state.selectedPoint?.essence).toContain("главный огонь кухни");
    expect(state.inspector.lessonPreviews.length).toBeGreaterThan(0);
    expect(state.inspector.lessonPreviews.some((item) => item.sourceFile === "6__Ясна_кухни_Урок_1.txt")).toBe(true);
  });

  it("exposes the new house yasna as real server-driven home model", () => {
    const state = computeYasnaState({
      yasnaId: "дома",
      selectedPoint: 9,
      activeMechanicIds: ["support-cross"],
    });

    expect(state.activeYasna.id).toBe("дома");
    expect(state.activeYasna.title).toBe("Дом");
    expect(state.selectedPoint?.label).toBe("Сон");
    expect(state.selectedPoint?.essence).toContain("сон");
    expect(state.inspector.lessonPreviews.length).toBeGreaterThan(0);
    expect(state.inspector.lessonPreviews.some((item) => item.sourceFile === "3__Ясна_дома_Урок_3.txt")).toBe(true);
    expect(state.inspector.lessonPreviews.some((item) => item.sourceFile === "4__Ясна_дома_Урок_4.txt")).toBe(true);
  });

  it("builds synthesis bridges and risks fully on backend", () => {
    const state = computeYasnaState({
      yasnaId: "суток",
      analysisMode: "synthesis",
      secondaryYasnaId: "круговорота-воды",
      selectedPoint: 3,
    });

    expect(state.analysisMode).toBe("synthesis");
    expect(state.synthesis.enabled).toBe(true);
    expect(state.synthesis.secondaryYasnaId).toBe("круговорота-воды");
    expect(state.synthesis.bridges.length).toBeGreaterThan(0);
    expect(state.synthesis.risks.length).toBeGreaterThan(0);
    expect(state.negotiation.recommendations.length).toBeGreaterThan(0);
  });

  it("builds synthesis between new negotiation yasnas without frontend hardcode", () => {
    const state = computeYasnaState({
      yasnaId: "облака-проблем",
      analysisMode: "synthesis",
      secondaryYasnaId: "решения",
      selectedPoint: 9,
    });

    expect(state.activeYasna.id).toBe("облака-проблем");
    expect(state.analysisMode).toBe("synthesis");
    expect(state.synthesis.enabled).toBe(true);
    expect(state.synthesis.secondaryYasnaId).toBe("решения");
    expect(state.synthesis.title).toBe("Синтез: облака проблемы × решения");
    expect(state.synthesis.summary).toContain("форму проблемного облака");
    expect(state.synthesis.bridges.length).toBeGreaterThan(0);
    expect(state.synthesis.bridges[0]?.description).toContain("Сопоставьте степень сгущения облака");
    expect(state.negotiation.recommendations.some((item) => item.title === "Сопоставить две Ясны")).toBe(true);
  });
});

describe("yasna.repository", () => {
  it("loads yasna snapshot with normalized catalog structure", async () => {
    const snapshot = await loadYasnaCatalogSnapshot();

    expect(snapshot.defaultYasnaId).toBe("атмосфера-встречи");
    expect(snapshot.yasnas.length).toBeGreaterThanOrEqual(8);
    expect(snapshot.mechanics.length).toBeGreaterThan(0);
    expect(snapshot.mechanicGroups.length).toBeGreaterThan(0);
    expect(["db", "fallback"]).toContain(snapshot.source);
    expect(snapshot.yasnas.every(record => record.lessons.length > 0)).toBe(true);
    expect(snapshot.yasnas.every(record => Object.keys(record.points).length > 0)).toBe(true);
    expect(snapshot.yasnas.some(record => record.id === "спальни")).toBe(true);
    expect(snapshot.yasnas.find(record => record.id === "спальни")?.lessons[0]?.file).toBe("5__Ясна_спальни_Урок_1.txt");
    expect(snapshot.yasnas.some(record => record.id === "кухни")).toBe(true);
    expect(snapshot.yasnas.find(record => record.id === "кухни")?.lessons[0]?.file).toBe("6__Ясна_кухни_Урок_1.txt");

    const supportCross = snapshot.mechanics.find(item => item.id === "support-cross");
    const heatCross = snapshot.mechanics.find(item => item.id === "heat-cross");
    const faithCross = snapshot.mechanics.find(item => item.id === "faith-cross");
    const pranaTitles = snapshot.mechanics
      .filter(item => item.category === "Праны")
      .map(item => item.shortTitle);
    const heatUnityAxis = snapshot.mechanics.find(item => item.id === "heat-unity-axis");
    const heatStruggleAxis = snapshot.mechanics.find(item => item.id === "heat-struggle-axis");
    const oppositionLink = snapshot.mechanics.find(item => item.id === "opposition-link");
    const arcTitles = snapshot.mechanics
      .filter(item => ["arc-1-5", "arc-5-9", "arc-9-1"].includes(item.id))
      .map(item => item.shortTitle);

    expect(supportCross?.title).toBe("Крест Опоры");
    expect(supportCross?.shortTitle).toBe("Опора");
    expect(heatCross?.shortTitle).toBe("Любовь");
    expect(faithCross?.shortTitle).toBe("Вера");
    expect(pranaTitles).toEqual(["Огонь", "Вода", "Воздух", "Земля"]);
    expect(oppositionLink?.shortTitle).toBe("Напротив");
    expect(heatUnityAxis?.shortTitle).toBe("Единство тепла");
    expect(heatStruggleAxis?.shortTitle).toBe("Борьбы");
    expect(arcTitles).toEqual(["Первая", "Вторая", "Третья"]);
  });

  it("refreshes runtime catalog before server procedures consume it", async () => {
    await refreshYasnaRuntimeCatalog();

    const runtimeYasnas = getRuntimeYasnaData();

    expect(runtimeYasnas.length).toBeGreaterThan(0);
    expect(runtimeYasnas.some(record => record.id === "атмосфера-встречи")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "облака-проблем")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "образ-проблемы")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "решения")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "суток")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "облачности")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "цветов-радуги")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "спальни")).toBe(true);
    expect(runtimeYasnas.some(record => record.id === "кухни")).toBe(true);
  });
});

describe("yasna.router", () => {
  it("returns catalog and computed state through app router", async () => {
    const caller = appRouter.createCaller({ req: {} as never, res: {} as never, user: null });

    const catalog = await caller.yasna.catalog();
    const state = await caller.yasna.computeState({
      yasnaId: catalog.defaultYasnaId,
      selectedPoint: 3,
      activeMechanicIds: ["support-cross"],
      analysisMode: "guided",
      presetId: "stall",
      secondaryYasnaId: "цветов-радуги",
    });

    expect(catalog.defaultYasnaId).toBeTruthy();
    expect(catalog.yasnas.length).toBeGreaterThan(0);
    expect(catalog.yasnas.every((item) => item.lessonCount > 0)).toBe(true);
    expect(catalog.yasnas.every((item) => item.contextAccent.trim().length > 0)).toBe(true);
    expect(catalog.yasnas.every((item) => item.pointsPreview.length > 0)).toBe(true);
    expect(catalog.yasnas.every((item) => item.pointsPreview.length <= 4)).toBe(true);
    expect(catalog.yasnas.every((item) => item.pointsPreview.every((point) => point.label.trim().length > 0))).toBe(true);
    expect(catalog.mechanics.some((item) => item.id === "support-cross")).toBe(true);
    expect(catalog.mechanics.find((item) => item.id === "support-cross")?.shortTitle).toBe("Опора");
    expect(catalog.mechanics.find((item) => item.id === "prana-air")?.shortTitle).toBe("Воздух");
    expect(catalog.mechanics.find((item) => item.id === "heat-unity-axis")?.shortTitle).toBe("Единство тепла");
    expect(catalog.mechanics.find((item) => item.id === "heat-struggle-axis")?.shortTitle).toBe("Борьбы");
    expect(catalog.analysisModes.map((item) => item.id)).toEqual(["free", "guided", "synthesis"]);
    expect(catalog.yasnas.find((item) => item.id === "атмосфера-встречи")?.pointsPreview[0]?.index).toBe(0);
    expect(catalog.yasnas.find((item) => item.id === "спальни")?.title).toBe("Спальня");
    expect(catalog.yasnas.find((item) => item.id === "кухни")?.title).toBe("Кухня");
    expect(state.activeYasna.id).toBe(catalog.defaultYasnaId);
    expect(state.selectedPoint?.index).toBe(3);
    expect(state.analysisMode).toBe("guided");
    expect(state.negotiation.activePreset?.id).toBeTruthy();
    expect(state.ui.analysisModes.map((item) => item.id)).toEqual(["free", "guided", "synthesis"]);
    expect(state.activeMechanics.map((item) => item.id)).toEqual(["support-cross"]);
    expect(state.negotiation.activePreset?.recommendedMechanicIds.length).toBeGreaterThan(0);
    expect(Array.isArray(state.inspector.lessonPreviews)).toBe(true);
  });
});
