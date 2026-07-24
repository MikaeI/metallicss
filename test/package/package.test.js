import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execute = promisify(execFile);
const ROOT = fileURLToPath(new URL("../../", import.meta.url));

async function run(command, arguments_, options = {}) {
  return execute(command, arguments_, {
    cwd: ROOT,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    ...options,
  });
}

test(
  "packs a complete, minimal archive that works for an ESM consumer",
  { timeout: 60_000 },
  async () => {
    const temporaryRoot = await mkdtemp(join(tmpdir(), "metallicss-package-"));
    const archiveDirectory = join(temporaryRoot, "archive");
    const consumerDirectory = join(temporaryRoot, "consumer");

    try {
      await mkdir(archiveDirectory);
      await mkdir(consumerDirectory);

      const { stdout } = await run("npm", [
        "pack",
        "--json",
        "--ignore-scripts",
        "--pack-destination",
        archiveDirectory,
      ]);
      const [packed] = JSON.parse(stdout);
      const packagedFiles = packed.files.map(({ path }) => path).sort();

      for (const expected of [
        "LICENSE",
        "README.md",
        "dist/metallicss.min.js",
        "dist/metallicss.min.js.map",
        "metallicss.d.ts",
        "metallicss.js",
        "package.json",
      ]) {
        assert.ok(packagedFiles.includes(expected), `package is missing ${expected}`);
      }

      for (const excludedPrefix of ["demo/", "scripts/", "test/", ".github/"]) {
        assert.equal(
          packagedFiles.some((path) => path.startsWith(excludedPrefix)),
          false,
          `package should not include ${excludedPrefix}`,
        );
      }

      await writeFile(
        join(consumerDirectory, "package.json"),
        `${JSON.stringify({ private: true, type: "module" }, null, 2)}\n`,
      );

      const archivePath = join(archiveDirectory, packed.filename);
      await run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", archivePath], {
        cwd: consumerDirectory,
      });

      const installedRoot = join(consumerDirectory, "node_modules", "metallicss");
      await access(join(installedRoot, "metallicss.d.ts"));
      const installedManifest = JSON.parse(
        await readFile(join(installedRoot, "package.json"), "utf8"),
      );
      assert.equal(installedManifest.types, "./metallicss.d.ts");

      const consumerProgram = `
        import renderer, * as api from "metallicss";
        if (renderer !== api.metallicss) throw new Error("default export mismatch");
        for (const name of ["mount", "observe", "refresh", "unmount"]) {
          if (typeof api[name] !== "function") throw new Error(\`missing export: \${name}\`);
        }
        if (api.refresh() !== 0) throw new Error("SSR refresh should be a no-op");
      `;
      await run(process.execPath, ["--input-type=module", "--eval", consumerProgram], {
        cwd: consumerDirectory,
      });
    } finally {
      await rm(temporaryRoot, { force: true, recursive: true });
    }
  },
);
