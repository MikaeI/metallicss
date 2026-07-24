import { expect, test } from "@playwright/test";

async function waitForRenderer(page) {
  await expect(page.locator("html")).toHaveClass(/renderer-loaded/);
  await expect(page.locator("#metal-preview")).toHaveAttribute("data-metallicss-ready", "");
}

async function setInputValue(locator, value) {
  await locator.evaluate((element, nextValue) => {
    element.value = String(nextValue);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}

test("demo loads its local renderer without runtime errors", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  await page.goto("/");

  await expect(page).toHaveTitle(/MetalliCSS/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Metal that behaves like CSS.");
  await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
  await waitForRenderer(page);
  await expect(page.locator("#renderer-status")).toContainText(/Live · Canvas \d+×\d+/);
  await expect(page.locator(".metallicss[data-metallicss-ready]")).toHaveCount(5);
  await expect(page.locator(".metallicss > canvas[data-metallicss-canvas]")).toHaveCount(5);
  await expect(page.locator("#code-output")).toContainText(
    'import { metallicss } from "metallicss"',
  );

  expect(errors).toEqual([]);
});

test("URL state, controls, preview styles, and reset stay synchronized", async ({ page }) => {
  await page.goto("/?metal=custom&color=b87333&convexity=-4&angle=135&size=320");
  await waitForRenderer(page);

  await expect(page.locator("#control-metal")).toHaveValue("custom");
  await expect(page.locator("#control-color")).toHaveValue("#b87333");
  await expect(page.locator("#control-convexity")).toHaveValue("-4");
  await expect(page.locator("#control-angle")).toHaveValue("135");
  await expect(page.locator("#control-size")).toHaveValue("320");

  await page.locator("#control-metal").selectOption("gold");
  await expect(page.locator("#control-color")).toHaveValue("#f5c451");
  await setInputValue(page.locator("#control-color"), "#aa7733");
  await expect(page.locator("#control-metal")).toHaveValue("custom");
  await setInputValue(page.locator("#control-convexity"), "-7");
  await setInputValue(page.locator("#control-intensity"), "1.75");
  await setInputValue(page.locator("#control-radius"), "40");

  await expect.poll(() => new URL(page.url()).searchParams.get("metal")).toBe("custom");
  await expect.poll(() => new URL(page.url()).searchParams.get("color")).toBe("aa7733");
  await expect.poll(() => new URL(page.url()).searchParams.get("convexity")).toBe("-7");
  await expect.poll(() => new URL(page.url()).searchParams.get("intensity")).toBe("1.75");

  const previewState = await page.locator("#metal-preview").evaluate((element) => ({
    color: element.style.getPropertyValue("--metallicss-color"),
    convexity: element.style.getPropertyValue("--convexity"),
    intensity: element.style.getPropertyValue("--metallicss-intensity"),
    material: element.dataset.material,
    preset: element.style.getPropertyValue("--metal"),
    radius: element.style.borderRadius,
  }));
  expect(previewState).toEqual({
    color: "#aa7733",
    convexity: "-7",
    intensity: "1.75",
    material: "custom",
    preset: "",
    radius: "40px",
  });
  await expect(page.locator("#code-output")).toContainText("--metallicss-color: #aa7733");
  await expect(page.locator("#code-output")).not.toContainText("--metal:");
  await expect(page.locator("#code-output")).toContainText("--convexity: -7");
  await expect(page.locator("#value-intensity")).toHaveText("1.75");

  await page.locator("#reset-demo").click();
  await expect(page.locator("#control-metal")).toHaveValue("silver");
  await expect(page.locator("#control-color")).toHaveValue("#f4f7fa");
  await expect(page.locator("#control-convexity")).toHaveValue("5");
  await expect.poll(() => new URL(page.url()).search).toBe("");
  await expect(page.locator("#copy-status")).toContainText("reset to the silver preset");
});

test("demo remains usable at a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ height: 844, width: 390 });
  await page.goto("/");
  await waitForRenderer(page);

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#lab-controls")).toBeVisible();
  await expect(page.locator("#control-metal")).toBeVisible();
  await expect(page.locator("#reset-demo")).toBeVisible();

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
});
