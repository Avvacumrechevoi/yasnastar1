// @vitest-environment jsdom

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getMechanicButtonLabel,
  getMechanicVisualStyle,
  getPointLabel,
  StarContrastOverlay,
  StarMechanicListButton,
  StarPointLabelOverlay,
  getStarLayoutClasses,
  getPointLabelCollisionMetrics,
  getPointLabelGapMetrics,
  getPointLabelOuterSideMetrics,
  getPointLabelSideMetrics,
  getPointLabelViewportMetrics,
  getPointLabelClusterMetrics,
  getPointNumberBadgeMetrics,
} from "./Star.testing";

describe("Star geometry regressions", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1440,
    });

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      writable: true,
      value: 900,
    });
  });

  it("uses a narrow left mechanic rail with a wide central star scene", () => {
    const layout = getStarLayoutClasses();

    expect(layout.containerMax).toContain("min(84svh,1280px)");
    expect(layout.sceneMin).toContain("78svh");
    expect(layout.sceneMin).toContain("sm:min-h-[980px]");
    expect(layout.sceneInnerMin).toContain("74svh");
    expect(layout.sceneInnerMin).toContain("sm:min-h-[940px]");
    expect(layout.scenePadding).toContain("px-1.5");
    expect(layout.gridTemplate).toContain("grid-cols-[4.5rem_minmax(0,1fr)]");
    expect(layout.gridTemplate).toContain("lg:h-[calc(100vh-7.75rem)]");
    expect(layout.sideColumnDesktopLayout).toContain("lg:max-h-full");
    expect(layout.sideColumnDesktopLayout).toContain("lg:self-stretch");
    expect(layout.centerColumnDesktopLayout).toContain("lg:self-stretch");
    expect(layout.centerColumnDesktopLayout).toContain("lg:min-h-0");
  });

  it("locks the current scene to a medium desktop scale instead of re-expanding it on larger breakpoints", () => {
    const layout = getStarLayoutClasses();

    expect(layout.containerMax).toBe("h-full w-full max-h-[min(84svh,1280px)] max-w-full lg:w-auto lg:max-h-[1280px]");
    expect(layout.sceneMin).toBe("min-h-[78svh] sm:min-h-[980px]");
    expect(layout.sceneInnerMin).toBe("min-h-[74svh] sm:min-h-[940px]");
    expect(layout.containerMax).not.toContain("xl:max-h");
    expect(layout.containerMax).not.toContain("2xl:max-h");
    expect(layout.sceneMin).not.toContain("md:min-h");
    expect(layout.sceneMin).not.toContain("2xl:min-h");
    expect(layout.sceneInnerMin).not.toContain("md:min-h");
    expect(layout.sceneInnerMin).not.toContain("2xl:min-h");
  });

  it("keeps the desktop scene bounded while the wrapper uses a narrow sidebar grid", () => {
    const layout = getStarLayoutClasses();

    expect(layout.gridTemplate).toContain("grid-cols-[4.5rem_minmax(0,1fr)]");
    expect(layout.gridTemplate).toContain("lg:max-h-[calc(100vh-7.75rem)]");
    expect(layout.gridTemplate).toContain("lg:min-h-0");
  });

  it("makes key line mechanics visually stronger than generic connectors", () => {
    const unity = getMechanicVisualStyle({ id: "unity-line", kind: "line" });
    const struggle = getMechanicVisualStyle({ id: "struggle-line", kind: "line" });
    const generic = getMechanicVisualStyle({ id: "axis-1", kind: "line" });
    const contrast = getMechanicVisualStyle({ id: "opposition-link", kind: "contrast" });
    const arc = getMechanicVisualStyle({ id: "warmth-arc", kind: "arc" });

    expect(unity.haloWidth).toBeGreaterThan(generic.haloWidth);
    expect(unity.coreWidth).toBeGreaterThan(generic.coreWidth);
    expect(unity.accentWidth).toBeGreaterThan(generic.accentWidth);
    expect(unity.dashArray).toBe("22 10");
    expect(unity.accentDashArray).toBe("2 24");
    expect(struggle.dashArray).toBe("6 12");
    expect(struggle.accentDashArray).toBe("1 18");
    expect(struggle.animationDuration).toBe("2.5s");
    expect(contrast.haloWidth).toBeGreaterThan(0);
    expect(contrast.coreWidth).toBeGreaterThan(4);
    expect(contrast.accentWidth).toBeGreaterThan(1);
    expect(contrast.dashArray).toBe("10 12");
    expect(contrast.animationDuration).toBe("4.8s");
    expect(arc.coreWidth).toBeGreaterThan(5);
    expect(arc.accentWidth).toBeGreaterThan(2);
    expect(arc.dashArray).toBe("14 12");
    expect(arc.accentDashArray).toBe("1 18");
  });

  it("keeps the opposition mechanic compact in the left mechanic list", () => {
    expect(getMechanicButtonLabel({ title: "Противопоставление", shortTitle: "Напротив" })).toBe("Напротив");
  });

  it("renders the opposition mechanic button in the left mechanic list", () => {
    const html = renderToStaticMarkup(
      React.createElement(StarMechanicListButton, {
        mechanic: {
          id: "opposition-link",
          title: "Противопоставление",
          shortTitle: "Напротив",
          stroke: "#9AE6B4",
          glow: "rgba(154,230,180,0.45)",
        },
        isActive: false,
        tooltip: "Связывает выбранную полочку с противоположной точкой.",
      }),
    );

    expect(html).toContain(">Напротив<");
    expect(html).toContain('title="Связывает выбранную полочку с противоположной точкой."');
    expect(html).toContain('data-state="inactive"');
  });

  it("renders an opposition connector in the central star scene when the mechanic is active", () => {
    const starPoints = Array.from({ length: 12 }, (_, index) => ({
      index,
      x: 100 + index * 10,
      y: 200 + index * 5,
    }));
    const html = renderToStaticMarkup(
      React.createElement(
        "svg",
        { viewBox: "0 0 400 400" },
        React.createElement(StarContrastOverlay, {
          mechanic: {
            id: "opposition-link",
            kind: "contrast",
            title: "Противопоставление",
            stroke: "#9AE6B4",
          },
          selectedPoint: 2,
          starPoints,
        }),
      ),
    );

    expect(html).toContain("Противопоставление");
    expect(html).toContain('x1="120"');
    expect(html).toContain('y1="210"');
    expect(html).toContain('x2="180"');
    expect(html).toContain('y2="240"');
    expect(html).toContain('stroke-dasharray="10 12"');
  });

  it.each(Array.from({ length: 12 }, (_, index) => index))(
    "keeps shelf label box away from point circle %i",
    (index) => {
      const metrics = getPointLabelCollisionMetrics(index);

      expect(metrics.distance + 0.0001).toBeGreaterThanOrEqual(metrics.safeDistance);
    },
  );

  it("keeps shelf 3 label fully to the left of point 3", () => {
    const metrics = getPointLabelSideMetrics(3);

    expect(metrics.isBoxLeftOfPoint).toBe(true);
    expect(metrics.centerDeltaX).toBeLessThan(0);
  });

  it("keeps shelf 9 label fully to the right of point 9", () => {
    const metrics = getPointLabelSideMetrics(9);

    expect(metrics.isBoxRightOfPoint).toBe(true);
    expect(metrics.centerDeltaX).toBeGreaterThan(0);
  });

  it("keeps shelf labels 3 and 9 on the same horizontal line", () => {
    const shelf3 = getPointLabelCollisionMetrics(3, "Первый просвет");
    const shelf9 = getPointLabelCollisionMetrics(9, "Узкий просвет");

    expect(shelf3.box.y).toBeCloseTo(shelf9.box.y, 4);
  });

  it.each([
    [2, "Настороженность"],
    [3, "Первый просвет"],
    [4, "Луч доверия"],
    [8, "Сгущение фона"],
    [9, "Узкий просвет"],
    [10, "Давление"],
  ])("keeps side shelf label %i centered around the point row", (index, label) => {
    const metrics = getPointLabelCollisionMetrics(index, label);
    const boxCenterY = metrics.box.y + metrics.box.height / 2;

    expect(Math.abs(boxCenterY - metrics.point.y)).toBeLessThanOrEqual(8);
  });

  it.each(Array.from({ length: 12 }, (_, index) => index))(
    "keeps shelf label %i fully on the outer side of its numbered point",
    (index) => {
      const metrics = getPointLabelOuterSideMetrics(index);

      expect(metrics.staysOutside).toBe(true);
      expect(metrics.projection + 0.0001).toBeGreaterThanOrEqual(metrics.requiredProjection);
    },
  );

  it.each(Array.from({ length: 12 }, (_, index) => index))(
    "keeps shelf label %i separated from the numbered point by an explicit edge gap",
    (index) => {
      const metrics = getPointLabelGapMetrics(index);

      expect(metrics.staysBeyondPointEdge).toBe(true);
      expect(metrics.edgeGap + 0.0001).toBeGreaterThanOrEqual(metrics.requiredEdgeGap);
    },
  );

  it.each(Array.from({ length: 12 }, (_, index) => index))(
    "keeps point number %i centered inside the point circle",
    (index) => {
      const metrics = getPointNumberBadgeMetrics(index);

      expect(metrics.staysInsidePoint).toBe(true);
      expect(metrics.staysCentered).toBe(true);
      expect(metrics.centerDistance).toBeLessThanOrEqual(metrics.requiredCenterDistance + 0.0001);
    },
  );

  it("makes single-word shelf labels narrower than two-word labels", () => {
    const shortLabelMetrics = getPointLabelCollisionMetrics(3, "Вода");
    const twoWordLabelMetrics = getPointLabelCollisionMetrics(3, "Тёплый воздух");

    expect(shortLabelMetrics.box.width).toBeLessThan(twoWordLabelMetrics.box.width);
  });

  it("keeps axis-side shelf labels compact for the reference side layout", () => {
    const metrics = getPointLabelCollisionMetrics(9, "Тёплый воздух");

    expect(metrics.box.width).toBeLessThanOrEqual(144);
  });

  it("gives long two-word shelf labels extra width before wrapping", () => {
    const metrics = getPointLabelCollisionMetrics(7, "Появление первых");

    expect(metrics.box.width).toBeGreaterThanOrEqual(298);
  });

  it("keeps opposite side-row cloud labels within the compact side-column width", () => {
    const metrics = getPointLabelCollisionMetrics(10, "Сплошная тучность");

    expect(metrics.box.width).toBeLessThanOrEqual(168);
  });

  it("keeps upper side-row shelf labels within the compact side-column width", () => {
    const metrics = getPointLabelCollisionMetrics(8, "Облаков становится");

    expect(metrics.box.width).toBeLessThanOrEqual(168);
  });

  it("keeps another long two-word cloud label visually relaxed instead of cramped", () => {
    const metrics = getPointLabelCollisionMetrics(11, "Выравнивание туч");

    expect(metrics.box.width).toBeGreaterThanOrEqual(300);
  });

  it.each([
    [0, "Облаков становится"],
    [1, "Появление первых"],
    [10, "Сплошная тучность"],
    [11, "Выравнивание туч"],
  ])("keeps long shelf label %i inside desktop viewport safe area", (index, label) => {
    const metrics = getPointLabelViewportMetrics(index, label);

    expect(metrics.keepsInsideViewport).toBe(true);
    expect(metrics.leftGap).toBeGreaterThanOrEqual(-0.0001);
    expect(metrics.rightGap).toBeGreaterThanOrEqual(-0.0001);
    expect(metrics.topGap).toBeGreaterThanOrEqual(-0.0001);
    expect(metrics.bottomGap).toBeGreaterThanOrEqual(-0.0001);
  });

  it.each([
    [10, "Сплошная тучность"],
    [11, "Выравнивание туч"],
  ])("keeps right-side cloud label %i comfortably inside the star card after inspector cleanup", (index, label) => {
    const metrics = getPointLabelViewportMetrics(index, label);

    expect(metrics.keepsInsideViewport).toBe(true);
    expect(metrics.rightBoundaryGap).toBeGreaterThanOrEqual(24);
  });

  it.each([
    [5, "Касание земли"],
    [6, "Лужа и"],
    [7, "Растекание"],
  ])("keeps lower shelf label %i above the bottom safe boundary after the scene was reduced", (index, label) => {
    const metrics = getPointLabelViewportMetrics(index, label);

    expect(metrics.keepsInsideViewport).toBe(true);
    expect(metrics.bottomGap).toBeGreaterThanOrEqual(48);
    expect(metrics.bottomBoundaryGap).toBeGreaterThanOrEqual(48);
  });

  it("keeps the overall label cloud visually centered while using the star card area densely", () => {
    const metrics = getPointLabelClusterMetrics({
      0: "Перенос облаков",
      1: "Туча и",
      2: "Дождь",
      3: "Касание земли",
      4: "Стекание и",
      5: "Лужа и",
      6: "Растекание",
      7: "Болото и",
      8: "Река",
      9: "Поверхность водоёма",
      10: "Испарение",
      11: "Облако",
    });

    expect(metrics.keepsClusterInsideViewport).toBe(true);
    expect(Math.abs(metrics.horizontalCenterOffset)).toBeLessThanOrEqual(2);
    expect(Math.abs(metrics.verticalCenterOffset)).toBeLessThanOrEqual(24);
    expect(metrics.horizontalMarginImbalance).toBeLessThanOrEqual(2);
    expect(metrics.verticalMarginImbalance).toBeLessThanOrEqual(30);
    expect(metrics.widthUsageRatio).toBeGreaterThanOrEqual(0.96);
    expect(metrics.widthUsageRatio).toBeLessThanOrEqual(0.985);
    expect(metrics.heightUsageRatio).toBeGreaterThanOrEqual(0.87);
    expect(metrics.heightUsageRatio).toBeLessThanOrEqual(0.91);
    expect(metrics.topGap).toBeGreaterThanOrEqual(96);
    expect(metrics.bottomGap).toBeGreaterThanOrEqual(84);
  });

  it("prefers short mechanic labels for the dense left column", () => {
    expect(getMechanicButtonLabel({ title: "Крест Опоры", shortTitle: "Опоры" })).toBe("Опоры");
    expect(getMechanicButtonLabel({ title: "Воздух ЦИ", shortTitle: "Воздух" })).toBe("Воздух");
    expect(getMechanicButtonLabel({ title: "Первая дуга", shortTitle: "" })).toBe("Первая дуга");
  });

  it("renders semantic shelf labels instead of bare numbers around the star", () => {
    expect(getPointLabel("ночь (тайный союз) | Ночь; отсутствие света; тайный союз | Сон; тайный союз; сговор")).toBe("Ночь");
    expect(getPointLabel("грозовое ядро; плотный узел; давление")).toBe("Давление");
    expect(getPointLabel(null)).toBe("Полочка не заполнена");
  });

  it("renders the semantic shelf label inside the actual star overlay button", () => {
    const html = renderToStaticMarkup(
      React.createElement(StarPointLabelOverlay, {
        pointIndex: 6,
        labelLines: ["Ночь"],
        tooltip: "Ночь\nТайный союз",
        isSelected: false,
        hasYasnaData: true,
        alignClass: "items-start text-left",
        style: { left: "10%", top: "20%", width: "12%", minHeight: "8%" },
      }),
    );

    expect(html).toContain(">Ночь<");
    expect(html).toContain("title=\"Ночь\nТайный союз\"");
    expect(html).not.toContain(">6<");
  });

});
