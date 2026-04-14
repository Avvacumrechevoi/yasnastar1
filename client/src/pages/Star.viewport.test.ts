// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockStarData = vi.hoisted(() => {
  const pointTexts = [
    "Перенос облаков",
    "Туча и",
    "Дождь",
    "Касание земли",
    "Стекание и",
    "Лужа и",
    "Растекание",
    "Болото и",
    "Река",
    "Поверхность водоёма",
    "Испарение",
    "Облако",
  ];

  const waterMechanic = {
    id: "water-flow",
    title: "Вода",
    shortTitle: "Вода",
    alias: "Прана воды",
    description: "Показывает, как поток темы растекается и собирает вокруг точки дополнительные следствия.",
    kind: "line",
    points: [4, 5, 6, 7],
    stroke: "#6cc6ff",
    fill: "rgba(108, 198, 255, 0.16)",
    glow: "rgba(108, 198, 255, 0.42)",
  };

  const activeYasna = {
    id: "water-cycle",
    title: "Круговорот воды",
    family: "Домашние животные",
    summary: "Неуправляемые течения и грязь в разговоре.",
    notes: [],
    mechanics: [waterMechanic],
    points: pointTexts.map((rawText, index) => ({
      index,
      label: rawText,
      rawText,
      essence: rawText,
      tooltip: rawText,
    })),
  };

  const catalogData = {
    defaultYasnaId: activeYasna.id,
    yasnas: [
      {
        id: activeYasna.id,
        title: activeYasna.title,
        family: activeYasna.family,
        summary: activeYasna.summary,
      },
    ],
    mechanics: [waterMechanic],
    mechanicGroups: [
      {
        title: "Праны",
        ids: [waterMechanic.id],
      },
    ],
    analysisModes: [
      {
        id: "free",
        title: "Свободный режим",
      },
    ],
  };

  const buildComputedState = (input: {
    yasnaId: string | null;
    selectedPoint: number | null;
    activeMechanicIds: string[];
  }) => {
    const selectedPoint = input.selectedPoint;
    const selectedText = selectedPoint === null ? null : pointTexts[selectedPoint] ?? `Полочка ${selectedPoint}`;
    const activeMechanics = input.activeMechanicIds.includes(waterMechanic.id)
      ? [
          {
            ...waterMechanic,
            contextText:
              selectedText === null
                ? "Выберите полочку, чтобы увидеть ход механики."
                : `Для полочки «${selectedText}» механика воды показывает дальнейшее растекание темы и накопление следствий.`,
          },
        ]
      : [];

    return {
      activeYasna,
      activeMechanics,
      latestMechanic: activeMechanics[0] ?? null,
      selectedPoint:
        selectedPoint === null || selectedText === null
          ? null
          : {
              index: selectedPoint,
              label: "Выбранная полочка",
              rawText: selectedText,
              essence: selectedText,
              tooltip: selectedText,
            },
      oppositePoint: null,
      highlightedPointIndices: selectedPoint === null ? [] : [selectedPoint],
      negotiation: {
        presets: [],
      },
      inspector: {
        primaryText: selectedText ? `${selectedText}.` : "",
        activeMechanics,
        lessonFocus: null,
        lessonPreviews: [],
      },
    };
  };

  return {
    catalogData,
    buildComputedState,
  };
});

vi.mock("@/lib/trpc", () => ({
  trpc: {
    yasna: {
      catalog: {
        useQuery: () => ({
          data: mockStarData.catalogData,
          isLoading: false,
        }),
      },
      computeState: {
        useQuery: (input: { yasnaId: string | null; selectedPoint: number | null; activeMechanicIds: string[] }) => ({
          data: input?.yasnaId ? mockStarData.buildComputedState(input) : undefined,
          isLoading: false,
        }),
      },
    },
  },
}));

import Star from "./Star";

function setViewport(width: number, height: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });

  Object.defineProperty(window, "innerHeight", {
    configurable: true,
    writable: true,
    value: height,
  });
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
  });
}

function findButtonByText(container: HTMLElement, text: string) {
  return Array.from(container.querySelectorAll("button")).find((button) => button.textContent?.includes(text)) as HTMLButtonElement | undefined;
}

function findPointLabelButtons(container: HTMLElement) {
  return Array.from(container.querySelectorAll("button")).filter((button) => {
    const element = button as HTMLButtonElement;
    return element.style.top.includes("%") && element.style.left.includes("%") && element.style.width.includes("%");
  }) as HTMLButtonElement[];
}

function getLabelCloudDomMetrics(container: HTMLElement) {
  const pointLabelButtons = findPointLabelButtons(container);
  const items = pointLabelButtons.map((button) => {
    const left = Number.parseFloat(button.style.left || "NaN");
    const top = Number.parseFloat(button.style.top || "NaN");
    const width = Number.parseFloat(button.style.width || "NaN");
    const height = Number.parseFloat(button.style.minHeight || "NaN");

    return {
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
    };
  });

  const left = Math.min(...items.map((item) => item.left));
  const top = Math.min(...items.map((item) => item.top));
  const right = Math.max(...items.map((item) => item.right));
  const bottom = Math.max(...items.map((item) => item.bottom));
  const spanWidth = right - left;
  const spanHeight = bottom - top;
  const centerX = left + spanWidth / 2;
  const centerY = top + spanHeight / 2;

  return {
    count: pointLabelButtons.length,
    left,
    top,
    right,
    bottom,
    spanWidth,
    spanHeight,
    centerX,
    centerY,
    horizontalMarginImbalance: Math.abs(left - (100 - right)),
    verticalMarginImbalance: Math.abs(top - (100 - bottom)),
  };
}

describe("Star reduced desktop viewport interactions", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(async () => {
    setViewport(1365, 768);
    Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", {
      configurable: true,
      writable: true,
      value: true,
    });

    if (!("ResizeObserver" in globalThis)) {
      class ResizeObserverMock {
        observe() {}
        unobserve() {}
        disconnect() {}
      }
      Object.defineProperty(globalThis, "ResizeObserver", {
        configurable: true,
        writable: true,
        value: ResizeObserverMock,
      });
    }

    if (!("matchMedia" in window)) {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: (query: string) => ({
          matches: false,
          media: query,
          onchange: null,
          addListener() {},
          removeListener() {},
          addEventListener() {},
          removeEventListener() {},
          dispatchEvent() {
            return false;
          },
        }),
      });
    }

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);

    await act(async () => {
      root.render(React.createElement(Star));
    });

    await flush();
    await flush();
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = "";
  });

  it("keeps the lowest visible point label inside the reduced desktop safe zone with explicit inline metrics", () => {
    const pointLabelButtons = findPointLabelButtons(container);
    const lowestVisibleLabel = pointLabelButtons.reduce((lowest, current) => {
      const currentTop = Number.parseFloat(current.style.top || "-Infinity");
      const lowestTop = Number.parseFloat(lowest.style.top || "-Infinity");
      return currentTop > lowestTop ? current : lowest;
    });

    expect(pointLabelButtons).toHaveLength(12);
    expect(lowestVisibleLabel).toBeTruthy();
    expect(lowestVisibleLabel.style.top).toContain("%");
    expect(lowestVisibleLabel.style.width).toContain("%");
    expect(lowestVisibleLabel.style.minHeight).toContain("%");

    const top = Number.parseFloat(lowestVisibleLabel.style.top || "NaN");
    const width = Number.parseFloat(lowestVisibleLabel.style.width || "NaN");
    const minHeight = Number.parseFloat(lowestVisibleLabel.style.minHeight || "NaN");

    expect(Number.isFinite(top)).toBe(true);
    expect(Number.isFinite(width)).toBe(true);
    expect(Number.isFinite(minHeight)).toBe(true);
    expect(top).toBeGreaterThan(60);
    expect(top).toBeLessThan(92);
    expect(width).toBeGreaterThan(8);
    expect(width).toBeLessThan(28);
    expect(minHeight).toBeGreaterThan(4);
    expect(minHeight).toBeLessThan(18);
    expect(top + minHeight).toBeLessThan(98);
  });

  it("keeps the rendered label cloud centered and dense on the reduced desktop viewport", () => {
    const metrics = getLabelCloudDomMetrics(container);

    expect(metrics.count).toBe(12);
    expect(metrics.left).toBeGreaterThanOrEqual(1.2);
    expect(metrics.right).toBeLessThanOrEqual(98.8);
    expect(metrics.top).toBeGreaterThanOrEqual(6);
    expect(metrics.bottom).toBeLessThanOrEqual(95.4);
    expect(metrics.spanWidth).toBeGreaterThanOrEqual(97);
    expect(metrics.spanWidth).toBeLessThanOrEqual(97.5);
    expect(metrics.spanHeight).toBeGreaterThanOrEqual(88.6);
    expect(metrics.spanHeight).toBeLessThanOrEqual(89.4);
    expect(metrics.centerX).toBeGreaterThanOrEqual(49.8);
    expect(metrics.centerX).toBeLessThanOrEqual(50.2);
    expect(metrics.centerY).toBeGreaterThanOrEqual(50.4);
    expect(metrics.centerY).toBeLessThanOrEqual(51);
    expect(metrics.horizontalMarginImbalance).toBeLessThanOrEqual(0.2);
    expect(metrics.verticalMarginImbalance).toBeLessThanOrEqual(1.6);
  });

  it("preserves reduced-desktop label metrics while point selection and mechanic activation open the overlay card", async () => {
    const initialLabelButton = findButtonByText(container, "Растекание");

    expect(initialLabelButton).toBeTruthy();

    const initialTop = initialLabelButton?.style.top;
    const initialWidth = initialLabelButton?.style.width;
    const initialMinHeight = initialLabelButton?.style.minHeight;

    await act(async () => {
      initialLabelButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    const overlayAfterPoint = container.querySelector('[data-testid="star-selection-overlay"]') as HTMLDivElement | null;
    expect(overlayAfterPoint).toBeTruthy();
    expect(overlayAfterPoint?.className).toContain("absolute");
    expect(overlayAfterPoint?.className).toContain("lg:right-5");
    expect(overlayAfterPoint?.className).toContain("lg:top-5");
    expect(overlayAfterPoint?.textContent).toContain("Растекание");

    const waterMechanicButton = findButtonByText(container, "Вода");
    expect(waterMechanicButton).toBeTruthy();

    await act(async () => {
      waterMechanicButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    const overlayWindow = container.querySelector('[data-testid="star-selection-overlay-window"]') as HTMLElement | null;
    const overlayDragHandle = container.querySelector('[data-testid="star-selection-overlay-drag-handle"]') as HTMLButtonElement | null;
    const overlayCollapseButton = container.querySelector('[data-testid="star-selection-overlay-collapse"]') as HTMLButtonElement | null;
    const overlayResetButton = container.querySelector('[data-testid="star-selection-overlay-reset"]') as HTMLButtonElement | null;
    const overlayResizeHandle = container.querySelector('[data-testid="star-selection-overlay-resize-handle"]') as HTMLButtonElement | null;
    const overlayCard = container.querySelector('[data-testid="star-selection-card"]') as HTMLElement | null;
    const mechanicBlock = container.querySelector('[data-testid="star-selection-card-mechanic"]') as HTMLElement | null;
    const labelAfterMechanic = findButtonByText(container, "Растекание");

    expect(overlayWindow).toBeTruthy();
    expect(overlayDragHandle?.textContent).toContain("Переместить");
    expect(overlayCollapseButton?.textContent).toContain("Свернуть");
    expect(overlayResetButton?.textContent).toContain("Сбросить");
    expect(overlayResizeHandle).toBeTruthy();
    expect(overlayCard).toBeTruthy();
    expect(overlayCard?.className).toContain("lg:w-[32rem]");
    expect(overlayCard?.textContent).toContain("Растекание");
    expect(overlayCard?.textContent).toContain("Круговорот воды");
    expect(mechanicBlock).toBeTruthy();
    expect(mechanicBlock?.textContent).toContain("Вода");
    expect(labelAfterMechanic?.style.top).toBe(initialTop);
    expect(labelAfterMechanic?.style.width).toBe(initialWidth);
    expect(labelAfterMechanic?.style.minHeight).toBe(initialMinHeight);

    await act(async () => {
      overlayCollapseButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    const collapsedCard = container.querySelector('[data-testid="star-selection-card"]') as HTMLElement | null;
    const expandButton = container.querySelector('[data-testid="star-selection-overlay-collapse"]') as HTMLButtonElement | null;

    expect(collapsedCard).toBeNull();
    expect(expandButton?.textContent).toContain("Развернуть");

    await act(async () => {
      expandButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    await flush();

    const reopenedCard = container.querySelector('[data-testid="star-selection-card"]') as HTMLElement | null;
    const overlayWindowAfterExpand = container.querySelector('[data-testid="star-selection-overlay-window"]') as HTMLElement | null;
    const dragHandleAfterExpand = container.querySelector('[data-testid="star-selection-overlay-drag-handle"]') as HTMLButtonElement | null;
    const resizeHandleAfterExpand = container.querySelector('[data-testid="star-selection-overlay-resize-handle"]') as HTMLButtonElement | null;

    expect(reopenedCard).toBeTruthy();
    expect(overlayWindowAfterExpand?.style.width).toBe("512px");
    expect(overlayWindowAfterExpand?.style.height).toBe("560px");

    await act(async () => {
      dragHandleAfterExpand?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, pointerId: 1, clientX: 100, clientY: 120, button: 0 }),
      );
      window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 1, clientX: 148, clientY: 176 }));
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 1 }));
    });
    await flush();

    const overlayWindowAfterDrag = container.querySelector('[data-testid="star-selection-overlay-window"]') as HTMLElement | null;
    expect(overlayWindowAfterDrag?.style.left).toBe("48px");
    expect(overlayWindowAfterDrag?.style.top).toBe("56px");

    await act(async () => {
      resizeHandleAfterExpand?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, pointerId: 2, clientX: 400, clientY: 500, button: 0 }),
      );
      window.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, pointerId: 2, clientX: 460, clientY: 540 }));
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 2 }));
    });
    await flush();

    const overlayWindowAfterResize = container.querySelector('[data-testid="star-selection-overlay-window"]') as HTMLElement | null;
    expect(overlayWindowAfterResize?.style.width).toBe("572px");
    expect(overlayWindowAfterResize?.style.height).toBe("600px");
  });
});
