import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLibrary } from "./build.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const EXPECTED_DIR = join(ROOT, "dist");
const FILES = ["metallicss.min.js", "metallicss.min.js.map"];

async function readOptional(path) {
  try {
    return await readFile(path);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

const temporaryDir = await mkdtemp(join(ROOT, ".dist-check-"));
const mismatches = [];

try {
  await buildLibrary(temporaryDir);

  for (const file of FILES) {
    const expected = await readOptional(join(EXPECTED_DIR, file));
    const actual = await readOptional(join(temporaryDir, file));

    if (expected === null) {
      mismatches.push(`${file} is missing from dist`);
    } else if (actual === null) {
      mismatches.push(`${file} was not generated`);
    } else if (!expected.equals(actual)) {
      mismatches.push(`${file} is stale`);
    }
  }
} finally {
  await rm(temporaryDir, { force: true, recursive: true });
}

if (mismatches.length > 0) {
  console.error("Distribution check failed:");
  for (const mismatch of mismatches) {
    console.error(`- ${mismatch}`);
  }
  process.exitCode = 1;
} else {
  console.log("dist matches the reproducible esbuild output");
}
