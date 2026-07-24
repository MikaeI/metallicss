import { expect, test } from "@playwright/test";

async function openFixture(page) {
  await page.goto("/test/fixtures/lifecycle.html");
  await page.waitForFunction(() => window.fixtureModuleReady === true);
}

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("auto-observes matching elements and preserves their content", async ({ page }) => {
  const target = page.locator("#auto-target");
  const canvas = target.locator(":scope > canvas[data-metallicss-canvas]");

  await expect(target).toHaveAttribute("data-metallicss-ready", "");
  await expect(canvas).toHaveCount(1);
  await expect(target.locator("strong")).toHaveText("Preserved content");

  const state = await target.evaluate((element) => {
    const generated = element.querySelector(":scope > canvas[data-metallicss-canvas]");
    return {
      canvasHeight: generated.height,
      canvasWidth: generated.width,
      exports: Object.keys(window.metallicssApi).sort(),
      isolation: element.style.isolation,
      position: element.style.position,
    };
  });

  expect(state).toEqual({
    canvasHeight: 120,
    canvasWidth: 240,
    exports: ["default", "metallicss", "mount", "observe", "presets", "refresh", "unmount"],
    isolation: "isolate",
    position: "relative",
  });
});

test("re-renders when material inputs change", async ({ page }) => {
  await expect(page.locator("#auto-target")).toHaveAttribute("data-metallicss-ready", "");

  const detail = await page.evaluate(() => {
    const target = document.querySelector("#auto-target");

    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error("render event timed out")), 15_000);
      target.addEventListener(
        "metallicss:render",
        (event) => {
          window.clearTimeout(timeout);
          resolve(event.detail);
        },
        { once: true },
      );
      target.style.setProperty("--metal", "gold");
      target.style.setProperty("--metallicss-resolution", "0.5");
    });
  });

  expect(detail.width).toBe(120);
  expect(detail.height).toBe(60);
  expect(detail.duration).toBeGreaterThanOrEqual(0);

  const canvas = page.locator("#auto-target > canvas[data-metallicss-canvas]");
  await expect.poll(() => canvas.evaluate((element) => element.width)).toBe(120);
  await expect.poll(() => canvas.evaluate((element) => element.height)).toBe(60);
});

test("normalizes equivalent CSS angle units to identical canvas output", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const angles = ["180deg", ".5turn", "3.141592653589793rad", "200grad"];
    const targets = angles.map((angle) => {
      const target = document.createElement("div");
      target.style.cssText = [
        "width: 120px",
        "height: 60px",
        "background: #ffffff",
        "border-radius: 12px",
        "--metal: silver",
        "--metallicss-resolution: 1",
      ].join(";");
      target.style.setProperty("--metallicss-angle", angle);
      document.body.append(target);
      return target;
    });

    try {
      await Promise.all(
        targets.map(
          (target) =>
            new Promise((resolve) => {
              target.addEventListener("metallicss:render", resolve, { once: true });
              window.metallicssApi.metallicss(target);
            }),
        ),
      );

      const canvases = targets.map((target) =>
        target.querySelector(":scope > canvas[data-metallicss-canvas]"),
      );
      return {
        heights: canvases.map((canvas) => canvas.height),
        outputs: canvases.map((canvas) => canvas.toDataURL()),
        widths: canvases.map((canvas) => canvas.width),
      };
    } finally {
      targets.forEach((target) => {
        window.metallicssApi.unmount(target);
        target.remove();
      });
    }
  });

  expect(result.widths).toEqual([120, 120, 120, 120]);
  expect(result.heights).toEqual([60, 60, 60, 60]);
  expect(new Set(result.outputs).size).toBe(1);
});

test("rejects URL-like color input without making an external request", async ({ page }) => {
  const externalRequests = [];
  page.on("request", (request) => {
    if (request.url().startsWith("https://paint.invalid/")) {
      externalRequests.push(request.url());
    }
  });
  await page.route("https://paint.invalid/**", async (route) => {
    await route.abort();
  });

  const result = await page.evaluate(async () => {
    const target = document.createElement("div");
    target.style.cssText = [
      "width: 160px",
      "height: 80px",
      "background: #ffffff",
      "border-radius: 16px",
      "--metal: gold",
      "--metallicss-resolution: 1",
    ].join(";");
    target.style.setProperty(
      "--metallicss-color",
      `url("https://paint.invalid/untrusted-texture.svg")`,
    );
    document.body.append(target);

    const originalCreateObjectURL = URL.createObjectURL;
    let rendererBlob;
    URL.createObjectURL = (blob) => {
      rendererBlob = blob;
      return originalCreateObjectURL.call(URL, blob);
    };

    try {
      const rendered = new Promise((resolve) => {
        target.addEventListener("metallicss:render", resolve, { once: true });
      });
      window.metallicssApi.metallicss(target);
      const targetRendererBlob = rendererBlob;
      await rendered;
      const rendererSource = await targetRendererBlob.text();

      return {
        containsPreset: rendererSource.includes("#f5c451"),
        containsUntrustedUrl: rendererSource.includes("paint.invalid"),
      };
    } finally {
      URL.createObjectURL = originalCreateObjectURL;
      window.metallicssApi.unmount(target);
      target.remove();
    }
  });

  expect(result).toEqual({
    containsPreset: true,
    containsUntrustedUrl: false,
  });
  expect(externalRequests).toEqual([]);
});

test("deduplicates direct renders and managed controllers", async ({ page }) => {
  await expect(page.locator("#auto-target")).toHaveAttribute("data-metallicss-ready", "");

  const result = await page.evaluate(() => {
    const target = document.querySelector("#auto-target");
    const firstCanvas = window.metallicssApi.metallicss(target);
    const secondCanvas = window.metallicssApi.metallicss(target);
    const firstController = window.metallicssApi.mount(target);
    const secondController = window.metallicssApi.mount(target);

    return {
      canvasCount: target.querySelectorAll(":scope > canvas[data-metallicss-canvas]").length,
      sameCanvas: firstCanvas === secondCanvas,
      sameController: firstController === secondController,
      controllerOwnsTarget: firstController.element === target,
    };
  });

  expect(result).toEqual({
    canvasCount: 1,
    sameCanvas: true,
    sameController: true,
    controllerOwnsTarget: true,
  });
});
