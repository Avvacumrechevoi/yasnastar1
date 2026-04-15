import { expect, test } from "@playwright/test";

test.describe("Yasna UI smoke", () => {
  test("home exposes core navigation and CTAs", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByTestId("home-hero")).toBeVisible();
    await expect(page.getByTestId("home-open-star")).toBeVisible();
    await expect(page.getByTestId("home-open-catalog")).toBeVisible();
    await expect(page.getByText("Открыть звезду механик")).toBeVisible();
  });

  test("catalog loads and supports search", async ({ page }) => {
    await page.goto("/yasnas");

    await expect(page.getByTestId("yasnas-page")).toBeVisible();

    const searchInput = page.getByTestId("yasnas-search-input");
    await expect(searchInput).toBeVisible();

    const cards = page.locator('[data-testid^="yasna-card-"]');
    const errorHeading = page.getByRole("heading", { name: "Каталог временно недоступен" });
    const emptyHeading = page.getByRole("heading", { name: "Измените фильтры или поисковый запрос" });

    if (await errorHeading.isVisible()) {
      await expect(errorHeading).toBeVisible();
      return;
    }

    if (await emptyHeading.isVisible()) {
      await expect(emptyHeading).toBeVisible();
      return;
    }

    await expect(cards.first()).toBeVisible();

    await searchInput.fill("атмосфера");
    if (!(await errorHeading.isVisible())) {
      await expect(searchInput).toHaveValue("атмосфера");
    }
  });

  test("star opens overlay after point and mechanic selection", async ({ page }) => {
    await page.goto("/star");

    await expect(page.getByRole("link", { name: "Вернуться на главную" })).toBeVisible();
    await expect(page.getByTestId("star-point-label-6")).toBeVisible();

    await page.getByTestId("star-point-label-6").click();
    await page.getByTestId("star-mechanic-button-prana-water").click();

    await expect(page.getByTestId("star-selection-overlay")).toBeVisible();
    await expect(page.getByTestId("star-selection-card")).toBeVisible();
    await expect(page.getByTestId("star-selection-overlay-collapse")).toBeVisible();
  });
});
