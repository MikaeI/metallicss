import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:http";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));

async function reservePort() {
  const reservation = createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const address = reservation.address();
  const port = address.port;
  await new Promise((resolve, reject) => {
    reservation.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
  return port;
}

async function waitForResponse(url, child) {
  let lastError;

  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) {
      throw new Error(`demo server exited before becoming ready (${child.exitCode})`);
    }

    try {
      return await fetch(url);
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => {
        setTimeout(resolve, 20);
      });
    }
  }

  throw lastError || new Error("demo server did not become ready");
}

test("demo server serves repository assets and blocks path traversal", async () => {
  const port = await reservePort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const child = spawn(process.execPath, ["scripts/serve.mjs", "--port", String(port)], {
    cwd: ROOT,
    stdio: "ignore",
  });

  try {
    const rootResponse = await waitForResponse(`${baseUrl}/`, child);
    assert.equal(rootResponse.status, 200);
    assert.equal(rootResponse.headers.get("cache-control"), "no-store");
    assert.match(rootResponse.headers.get("content-type"), /^text\/html/);
    assert.match(await rootResponse.text(), /<title>MetalliCSS/);

    const moduleResponse = await fetch(`${baseUrl}/metallicss.js`);
    assert.equal(moduleResponse.status, 200);
    assert.match(moduleResponse.headers.get("content-type"), /^text\/javascript/);

    const missingResponse = await fetch(`${baseUrl}/does-not-exist`);
    assert.equal(missingResponse.status, 404);

    const traversalResponse = await fetch(`${baseUrl}/..%2Fpackage.json`);
    assert.equal(traversalResponse.status, 403);
  } finally {
    if (child.exitCode === null) {
      const exited = once(child, "exit");
      child.kill("SIGTERM");
      await exited;
    }
  }
});
