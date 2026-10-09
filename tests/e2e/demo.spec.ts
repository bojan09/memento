import { expect, test } from "@playwright/test";

// /demo runs the real app screens on an in-browser store, so these cover the UI flows
// (capture, edit, delete, projects, search, palette) without a Supabase account.

test.beforeEach(async ({ page }) => {
  await page.goto("/demo/memories");
  await expect(page.locator(".feed-grid .mcard").first()).toBeVisible();
});

async function openCapture(page: import("@playwright/test").Page) {
  const desktop = (page.viewportSize()?.width ?? 0) > 760;
  await page.locator(desktop ? ".side-capture" : ".tab-capture").click();
  await expect(page.locator("dialog[open] textarea")).toBeVisible();
}

test("captures a note and a link", async ({ page }) => {
  const before = await page.locator(".feed-grid .mcard").count();

  await openCapture(page);
  await page.locator("dialog[open] textarea").fill("Buy sourdough starter\nSaturday market");
  await expect(page.locator("dialog[open] .detect")).toContainText("Note");
  await page.locator("dialog[open] .capture-save").click();
  await expect(page.locator(".feed-grid .mcard")).toHaveCount(before + 1);
  await expect(page.locator(".feed-grid .mcard").first()).toContainText("Buy sourdough starter");

  await openCapture(page);
  await page.locator("dialog[open] textarea").fill("vercel.com/docs");
  await expect(page.locator("dialog[open] .detect")).toContainText("vercel.com");
  await page.locator("dialog[open] .capture-save").click();
  await expect(page.locator(".feed-grid .mcard")).toHaveCount(before + 2);
});

test("edits and deletes a memory", async ({ page }) => {
  const before = await page.locator(".feed-grid .mcard").count();
  await page.locator(".feed-grid .mcard").first().click();
  await page.getByLabel(/Why you saved it/).fill("A better reason");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("button", { name: "Save changes" })).toBeDisabled();

  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.locator("dialog[open] .btn-danger").click();
  await expect(page).toHaveURL(/\/demo\/memories$/);
  await expect(page.locator(".feed-grid .mcard")).toHaveCount(before - 1);
});

test("filters by kind", async ({ page }) => {
  await page.getByRole("link", { name: "Notes", exact: true }).click();
  await expect(page).toHaveURL(/kind=note/);
  for (const card of await page.locator(".feed-grid .mcard .mcard-src").all()) {
    await expect(card).toHaveText("Note");
  }
});

test("creates a project and rejects duplicates", async ({ page }) => {
  await page.goto("/demo/projects");
  await page.getByLabel("New project name").fill("Trip to Ohrid");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.locator(".project-name", { hasText: "Trip to Ohrid" })).toBeVisible();
  await page.getByLabel("New project name").fill("trip to ohrid");
  await page.getByRole("button", { name: "Create" }).click();
  await expect(page.locator(".err")).toContainText("already have a project");
});

test("search matches word prefixes", async ({ page }) => {
  await page.goto("/demo/search?q=fig%20mult");
  await expect(page.locator(".feed-grid .mcard")).toHaveCount(1);
  await expect(page.locator(".feed-grid .mcard")).toContainText("Figma");
});

test("command palette opens a memory", async ({ page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  await page.keyboard.type("stripe");
  await expect(page.locator(".pal-opt").first()).toContainText("idempotency");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo\/memories\/[0-9a-f-]{36}$/);
});
