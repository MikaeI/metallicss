import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = new URL("../../", import.meta.url);
const packageManifest = JSON.parse(await readFile(new URL("package.json", ROOT), "utf8"));
const lockfile = JSON.parse(await readFile(new URL("package-lock.json", ROOT), "utf8"));

test("publishes typed ESM entry points and the browser bundle", async () => {
  assert.equal(packageManifest.type, "module");
  assert.equal(packageManifest.main, "./dist/metallicss.min.js");
  assert.equal(packageManifest.module, "./metallicss.js");
  assert.equal(packageManifest.browser, "./dist/metallicss.min.js");
  assert.equal(packageManifest.types, "./metallicss.d.ts");
  assert.deepEqual(packageManifest.exports["."], {
    types: "./metallicss.d.ts",
    import: "./metallicss.js",
    default: "./metallicss.js",
  });
  assert.equal(packageManifest.exports["./dist/metallicss.min.js"], "./dist/metallicss.min.js");
  assert.equal(packageManifest.exports["./package.json"], "./package.json");

  for (const relativePath of [
    packageManifest.main,
    packageManifest.module,
    packageManifest.types,
  ]) {
    await access(new URL(relativePath.replace(/^\.\//, ""), ROOT));
  }
});

test("ships only intentional package inputs and no runtime dependencies", () => {
  assert.deepEqual(packageManifest.files, ["dist", "metallicss.js", "metallicss.d.ts"]);
  assert.deepEqual(packageManifest.sideEffects, ["./metallicss.js", "./dist/metallicss.min.js"]);
  assert.equal(Object.hasOwn(packageManifest, "dependencies"), false);
  assert.equal(packageManifest.license, "MIT");
  assert.equal(packageManifest.homepage, "https://mikaei.github.io/metallicss/");
  assert.equal(packageManifest.funding, "https://github.com/sponsors/MikaeI");
  assert.equal(packageManifest.keywords.includes("houdini"), false);
});

test("keeps contributor commands and the lockfile aligned", async () => {
  for (const script of [
    "build",
    "build:check",
    "check:bundle",
    "dev",
    "lint",
    "format:check",
    "test",
    "test:node",
    "test:browser",
    "pages:stage",
  ]) {
    assert.equal(typeof packageManifest.scripts[script], "string", `missing npm script: ${script}`);
  }

  assert.equal(packageManifest.scripts.dev, "node scripts/serve.mjs");
  assert.match(packageManifest.scripts.test, /test:node/);
  assert.match(packageManifest.scripts.test, /test:browser/);
  assert.equal(lockfile.lockfileVersion, 3);
  assert.equal(lockfile.name, packageManifest.name);
  assert.equal(lockfile.version, packageManifest.version);
  assert.equal(lockfile.packages[""].name, packageManifest.name);
  assert.equal(lockfile.packages[""].version, packageManifest.version);
  assert.deepEqual(lockfile.packages[""].devDependencies, packageManifest.devDependencies);
  assert.deepEqual(lockfile.packages[""].engines, packageManifest.engines);

  const funding = await readFile(new URL(".github/FUNDING.yml", ROOT), "utf8");
  assert.match(funding, /^github: \[MikaeI\]\s*$/);
  assert.equal(fileURLToPath(ROOT).endsWith("metallicss/"), true);
});
