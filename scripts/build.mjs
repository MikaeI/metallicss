import { mkdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const DEFAULT_OUTDIR = join(ROOT, "dist");

export async function buildLibrary(outdir = DEFAULT_OUTDIR) {
  await mkdir(outdir, { recursive: true });

  const outfile = join(outdir, "metallicss.min.js");
  await build({
    absWorkingDir: ROOT,
    bundle: true,
    charset: "utf8",
    entryPoints: ["metallicss.js"],
    format: "esm",
    legalComments: "none",
    minify: true,
    outfile,
    platform: "browser",
    sourcemap: "external",
    target: ["es2020"],
    treeShaking: true,
  });

  return {
    outfile,
    sourcemap: `${outfile}.map`,
  };
}

function readOutdirArgument() {
  const flagIndex = process.argv.indexOf("--outdir");
  if (flagIndex === -1) return DEFAULT_OUTDIR;

  const outdir = process.argv[flagIndex + 1];
  if (!outdir) throw new Error("--outdir requires a directory");

  return resolve(ROOT, outdir);
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  await buildLibrary(readOutdirArgument());
}
