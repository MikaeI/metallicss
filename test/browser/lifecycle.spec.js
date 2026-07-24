import { expect, test } from "@playwright/test";

async function openFixture(page) {
  await page.goto("/test/fixtures/lifecycle.html");
  await page.waitForFunction(() => window.fixtureModuleReady === true);
}

test.beforeEach(async ({ page }) => {
  await openFixture(page);
});

test("mount is idempotent and unmount restores the element", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const host = document.querySelector("#lifecycle-host");
    const surface = document.createElement("section");
    surface.innerHTML = "<strong>Managed content</strong>";
    surface.style.cssText = [
      "width: 200px",
      "height: 100px",
      "background: #d9e0e7",
      "border-radius: 20px",
      "--metal: steel",
      "--metallicss-resolution: 1",
    ].join(";");
    host.append(surface);

    const rendered = new Promise((resolve) => {
      surface.addEventListener("metallicss:render", resolve, { once: true });
    });
    const controller = window.metallicssApi.mount(surface, { observe: false });
    const duplicate = window.metallicssApi.mount(surface, { observe: false });
    await rendered;

    const mounted = {
      canvasCount: surface.querySelectorAll(":scope > canvas[data-metallicss-canvas]").length,
      isolation: surface.style.isolation,
      position: surface.style.position,
      ready: surface.hasAttribute("data-metallicss-ready"),
      sameController: controller === duplicate,
    };

    const rerendered = new Promise((resolve) => {
      surface.addEventListener("metallicss:render", resolve, { once: true });
    });
    const returnedCanvas = controller.render();
    await rerendered;

    const removed = window.metallicssApi.unmount(surface);
    controller.destroy();

    return {
      mounted,
      removed,
      returnedCanvasWasGenerated: returnedCanvas.hasAttribute("data-metallicss-canvas"),
      restored: {
        canvasCount: surface.querySelectorAll(":scope > canvas[data-metallicss-canvas]").length,
        content: surface.textContent,
        isolation: surface.style.isolation,
        position: surface.style.position,
        ready: surface.hasAttribute("data-metallicss-ready"),
      },
      secondUnmount: window.metallicssApi.unmount(surface),
    };
  });

  expect(result.mounted).toEqual({
    canvasCount: 1,
    isolation: "isolate",
    position: "relative",
    ready: true,
    sameController: true,
  });
  expect(result.removed).toBe(true);
  expect(result.returnedCanvasWasGenerated).toBe(true);
  expect(result.restored).toEqual({
    canvasCount: 0,
    content: "Managed content",
    isolation: "",
    position: "",
    ready: false,
  });
  expect(result.secondUnmount).toBe(false);
});

test("observe owns dynamic shadow-root matches and disconnect cleans them up", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const host = document.querySelector("#lifecycle-host");
    const shadowHost = document.createElement("div");
    host.append(shadowHost);
    const root = shadowHost.attachShadow({ mode: "open" });
    const surface = document.createElement("div");
    surface.className = "metallicss";
    surface.textContent = "Dynamic content";
    surface.style.cssText = [
      "display: block",
      "width: 180px",
      "height: 90px",
      "background: #f5c451",
      "border-radius: 18px",
      "--metal: gold",
      "--metallicss-resolution: 1",
    ].join(";");

    const disconnect = window.metallicssApi.observe(root, {
      debounce: 0,
      visibility: false,
    });
    const firstRender = new Promise((resolve) => {
      surface.addEventListener("metallicss:render", resolve, { once: true });
    });
    root.append(surface);
    await firstRender;

    const refreshedRender = new Promise((resolve) => {
      surface.addEventListener("metallicss:render", resolve, { once: true });
    });
    const refreshCount = window.metallicssApi.refresh(root);
    await refreshedRender;

    surface.classList.remove("metallicss");
    await new Promise((resolve) => {
      window.setTimeout(resolve, 50);
    });
    const removedAfterClassChange =
      surface.querySelector(":scope > canvas[data-metallicss-canvas]") === null;

    const secondRender = new Promise((resolve) => {
      surface.addEventListener("metallicss:render", resolve, { once: true });
    });
    surface.classList.add("metallicss");
    await secondRender;

    disconnect();
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0);
    });

    return {
      content: surface.textContent,
      refreshCount,
      removedAfterClassChange,
      removedAfterDisconnect:
        surface.querySelector(":scope > canvas[data-metallicss-canvas]") === null,
      readyAfterDisconnect: surface.hasAttribute("data-metallicss-ready"),
    };
  });

  expect(result).toEqual({
    content: "Dynamic content",
    refreshCount: 1,
    removedAfterClassChange: true,
    removedAfterDisconnect: true,
    readyAfterDisconnect: false,
  });
});

test("auto-observation defers offscreen work until the element is visible", async ({ page }) => {
  const target = page.locator("#offscreen-target");

  await page.evaluate(() => {
    const surface = document.createElement("div");
    surface.id = "offscreen-target";
    surface.className = "metallicss";
    surface.textContent = "Render when visible";
    surface.style.cssText = [
      "display: block",
      "width: 180px",
      "height: 90px",
      "margin-top: 3000px",
      "background: #a7a9b4",
      "border-radius: 18px",
      "--metal: titanium",
      "--metallicss-resolution: 1",
    ].join(";");
    document.body.append(surface);
  });

  await page.waitForTimeout(100);
  await expect(target).not.toHaveAttribute("data-metallicss-ready");
  await expect(target.locator(":scope > canvas[data-metallicss-canvas]")).toHaveCount(0);

  await target.scrollIntoViewIfNeeded();
  await expect(target).toHaveAttribute("data-metallicss-ready", "");
  await expect(target.locator(":scope > canvas[data-metallicss-canvas]")).toHaveCount(1);
});

test("bulk removal avoids cross-product containment scans", async ({ page }) => {
  const containsCalls = await page.evaluate(async () => {
    const container = document.createElement("div");
    const surfaces = Array.from({ length: 200 }, (_, index) => {
      const surface = document.createElement("span");
      surface.className = "metallicss";
      surface.textContent = String(index);
      surface.style.display = "none";
      return surface;
    });
    container.append(...surfaces);
    document.body.append(container);

    await new Promise((resolve) => {
      window.setTimeout(resolve, 0);
    });

    let calls = 0;
    surfaces.forEach((surface) => {
      const nativeContains = surface.contains;
      surface.contains = function (...args) {
        calls += 1;
        return nativeContains.apply(this, args);
      };
    });

    container.replaceChildren();
    await new Promise((resolve) => {
      window.setTimeout(resolve, 0);
    });
    container.remove();

    return calls;
  });

  expect(containsCalls).toBeLessThan(400);
});
