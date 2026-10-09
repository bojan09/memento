import { expect, test, type Page } from "@playwright/test";

async function noHorizontalScroll(page: Page) {
  const { sw, vw } = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    vw: document.documentElement.clientWidth,
  }));
  expect(sw).toBeLessThanOrEqual(vw);
}

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  return errors;
}

test("landing page renders and links to sign in", async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Capture now.");
  await expect(page.getByRole("link", { name: "Get started" }).first()).toHaveAttribute("href", "/login");
  await noHorizontalScroll(page);
  expect(errors).toEqual([]);
});

test("signed-out visitors are sent to /login", async ({ page }) => {
  for (const path of ["/memories", "/settings", "/projects"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login$/);
  }
});

test("login page renders", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("button", { name: /send code/i })).toBeVisible();
  await noHorizontalScroll(page);
});

test("offline page is public", async ({ page }) => {
  await page.goto("/offline");
  await expect(page.getByRole("heading", { name: "You're offline" })).toBeVisible();
});

test("unknown pages show the 404 screen", async ({ page }) => {
  const res = await page.goto("/login/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Nothing kept here" })).toBeVisible();
});

test("manifest and service worker are served correctly", async ({ request }) => {
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.display).toBe("standalone");
  expect(manifest.icons.some((i: { purpose: string }) => i.purpose === "maskable")).toBe(true);

  const sw = await request.get("/sw.js");
  expect(sw.headers()["cache-control"]).toContain("no-store");
  expect(sw.headers()["content-type"]).toContain("javascript");
});
