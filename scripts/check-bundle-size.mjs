import { readFile } from "node:fs/promises";
import { brotliCompress, gzip } from "node:zlib";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ARTIFACT = new URL("../dist/metallicss.min.js", import.meta.url);
const BUDGETS = {
  raw: 42_000,
  gzip: 28_500,
  brotli: 27_000,
};

// The v4.0.3 baseline was 31,543 bytes raw and 23,003 bytes with gzip -9.
const compressGzip = promisify(gzip);
const compressBrotli = promisify(brotliCompress);

const source = await readFile(ARTIFACT);
const measurements = {
  raw: source.byteLength,
  gzip: (await compressGzip(source, { level: 9 })).byteLength,
  brotli: (await compressBrotli(source)).byteLength,
};

let failed = false;
console.log(`Bundle: ${fileURLToPath(ARTIFACT).replace(`${ROOT}/`, "")}`);
for (const [encoding, budget] of Object.entries(BUDGETS)) {
  const bytes = measurements[encoding];
  const overBudget = bytes > budget;
  const marker = overBudget ? "FAIL" : "OK";
  console.log(`${marker.padEnd(4)} ${encoding.padEnd(6)} ${bytes} / ${budget} bytes`);
  failed ||= overBudget;
}

if (failed) {
  console.error("Bundle budget exceeded. Explain intentional growth before raising a limit.");
  process.exitCode = 1;
}
