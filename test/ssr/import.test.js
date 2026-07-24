import assert from "node:assert/strict";
import test from "node:test";

const moduleUrl = new URL("../../metallicss.js", import.meta.url);

test("imports without browser globals or side effects", async () => {
  assert.equal("document" in globalThis, false);
  assert.equal("window" in globalThis, false);

  const imported = await import(`${moduleUrl.href}?ssr=${Date.now()}`);

  assert.equal(imported.default, imported.metallicss);
  assert.equal(typeof imported.mount, "function");
  assert.equal(typeof imported.observe, "function");
  assert.equal("document" in globalThis, false);
  assert.equal("window" in globalThis, false);
});

test("defers browser auto-observation until DOMContentLoaded", async () => {
  let registration;
  globalThis.document = {
    readyState: "loading",
    addEventListener(name, listener, options) {
      registration = { listener, name, options };
    },
  };

  try {
    await import(`${moduleUrl.href}?loading=${Date.now()}`);
    assert.equal(registration.name, "DOMContentLoaded");
    assert.deepEqual(registration.options, { once: true });
    assert.doesNotThrow(registration.listener);
  } finally {
    delete globalThis.document;
  }
});
