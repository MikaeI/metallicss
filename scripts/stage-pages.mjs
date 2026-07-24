import { access, cp, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = join(ROOT, "_site");
const ENTRIES = [
  ["index.html", "index.html"],
  ["demo", "demo"],
  ["metallicss.js", "metallicss.js"],
  ["dist", "dist"],
];

await rm(SITE, { force: true, recursive: true });
await mkdir(SITE, { recursive: true });

for (const [sourceName, destinationName] of ENTRIES) {
  const source = join(ROOT, sourceName);
  const destination = join(SITE, destinationName);

  try {
    await access(source);
  } catch {
    throw new Error(`Cannot stage missing Pages input: ${sourceName}`);
  }

  await cp(source, destination, { recursive: true });
}

console.log(`Staged GitHub Pages artifact at ${SITE}`);
