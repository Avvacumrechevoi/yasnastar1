import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Home from "../Home";
import { productFigures } from "./productModules";

describe("home product modules", () => {
  it("uses distinct product names and complete popup copy for every module", () => {
    expect(productFigures).toHaveLength(5);
    expect(new Set(productFigures.map((item) => item.title)).size).toBe(productFigures.length);

    for (const item of productFigures) {
      expect(item.badge.trim().length).toBeGreaterThan(0);
      expect(item.subtitle.trim().length).toBeGreaterThan(0);
      expect(item.summary.trim().length).toBeGreaterThan(30);
      expect(item.useCase.trim().length).toBeGreaterThan(30);
      expect(item.outcome.trim().length).toBeGreaterThan(30);
    }
  });

  it("renders updated product cards on the home page with popup affordance", () => {
    Object.defineProperty(globalThis, "location", {
      value: { pathname: "/", search: "", hash: "" },
      configurable: true,
    });

    const html = renderToStaticMarkup(createElement(Home));

    for (const item of productFigures) {
      expect(html).toContain(item.title);
      expect(html).toContain(item.subtitle);
      expect(html).toContain(`${item.title}: ${item.subtitle}`);
    }

    expect((html.match(/Открыть пояснение/g) ?? []).length).toBe(productFigures.length);
  });
});
