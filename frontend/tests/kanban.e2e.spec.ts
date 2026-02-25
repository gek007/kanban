import { expect, test, type Page } from "@playwright/test";

async function dragCard(page: Page, sourceTestId: string, targetTestId: string) {
  const source = page.getByTestId(sourceTestId);
  const target = page.getByTestId(targetTestId);
  const sourceBox = await source.boundingBox();
  const targetBox = await target.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error("Failed to resolve drag source/target positions.");
  }

  await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
}

test("loads with seeded data", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Team Flow Board" })).toBeVisible();
  await expect(page.getByTestId("column-col-1")).toBeVisible();
  await expect(page.getByTestId("column-col-5")).toBeVisible();
  await expect(page.getByText("Define release scope")).toBeVisible();
});

test("renames all five columns", async ({ page }) => {
  await page.goto("/");
  const names = ["Ideas", "Next Up", "Building", "Quality", "Released"];

  for (let index = 0; index < names.length; index += 1) {
    const columnId = `col-${index + 1}`;
    await page.getByTestId(`rename-column-${columnId}`).click();
    const input = page.getByTestId(`rename-input-${columnId}`);
    await input.fill(names[index]);
    await input.press("Enter");
    await expect(page.getByTestId(`column-title-${columnId}`)).toHaveText(names[index]);
  }
});

test("adds and deletes a card", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("add-title-col-2").fill("Verify drag interactions");
  await page.getByTestId("add-details-col-2").fill("Cross-column and same-column ordering");
  await page.getByTestId("add-submit-col-2").click();
  await expect(page.getByText("Verify drag interactions")).toBeVisible();

  const card = page.locator(".card", { hasText: "Verify drag interactions" });
  await card.getByRole("button", { name: "Delete" }).click();
  await expect(page.locator(".card", { hasText: "Verify drag interactions" })).toHaveCount(0);
});

test("moves card across columns and reorders within same column", async ({ page, isMobile }) => {
  test.skip(isMobile, "Precise pointer reordering is covered on desktop Chromium.");
  await page.goto("/");

  await dragCard(page, "card-task-1", "column-col-2");
  await expect(page.getByTestId("column-col-2")).toContainText("Define release scope");

  await dragCard(page, "card-task-5", "card-task-4");
  const firstCardInProgress = page.locator("[data-testid='column-col-3'] .card").first();
  await expect(firstCardInProgress).toContainText("Refine card visual style");
});

test("mobile viewport is usable", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("board")).toBeVisible();
  await expect(page.getByTestId("column-col-1")).toBeVisible();
  await page.getByTestId("add-title-col-1").fill("Mobile smoke");
  await page.getByTestId("add-submit-col-1").click();
  await expect(page.getByText("Mobile smoke")).toBeVisible();
});
