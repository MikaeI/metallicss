import assert from "node:assert/strict";
import test from "node:test";

import defaultRenderer, * as api from "../../metallicss.js";

const PUBLIC_EXPORTS = [
  "default",
  "metallicss",
  "mount",
  "observe",
  "presets",
  "refresh",
  "unmount",
];

test("exposes the documented public API", () => {
  assert.deepEqual(Object.keys(api).sort(), PUBLIC_EXPORTS);
  assert.equal(defaultRenderer, api.metallicss);

  for (const name of PUBLIC_EXPORTS.filter((name) => name !== "default" && name !== "presets")) {
    assert.equal(typeof api[name], "function", `${name} should be a function`);
  }
});

test("publishes immutable built-in material presets", () => {
  assert.deepEqual(api.presets, {
    silver: "#f4f7fa",
    steel: "#d9e0e7",
    chrome: "#ffffff",
    gold: "#f5c451",
    copper: "#cf7546",
    lead: "#77818d",
    titanium: "#a7a9b4",
    gunmetal: "#53606d",
  });
  assert.equal(Object.isFrozen(api.presets), true);
  assert.throws(() => {
    api.presets.gold = "#000000";
  }, TypeError);
});

test("validates element-oriented entry points", () => {
  assert.throws(() => api.metallicss(), {
    name: "TypeError",
    message: "metallicss() expects an Element",
  });
  assert.throws(() => api.mount(null), {
    name: "TypeError",
    message: "mount() expects an Element",
  });
  assert.throws(() => api.mount({ nodeType: 1 }), /connected to a Window/);
});

test("keeps non-browser helpers safe without a DOM", () => {
  assert.equal(api.metallicss({ nodeType: 1 }), null);
  assert.equal(api.refresh(), 0);

  const disconnect = api.observe();
  assert.equal(typeof disconnect, "function");
  assert.doesNotThrow(disconnect);
});
