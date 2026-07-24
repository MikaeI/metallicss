import { createReadStream } from "node:fs";
import { createServer } from "node:http";
import { stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

const portFlag = process.argv.indexOf("--port");
const requestedPort = portFlag === -1 ? (process.env.PORT ?? "4173") : process.argv[portFlag + 1];
const port = Number.parseInt(requestedPort, 10);
if (!Number.isInteger(port) || port < 1 || port > 65_535) {
  throw new Error(`Invalid port: ${requestedPort}`);
}

function respond(response, status, body) {
  response.writeHead(status, { "content-type": "text/plain; charset=utf-8" });
  response.end(body);
}

function requestPath(requestUrl) {
  const url = new URL(requestUrl ?? "/", "http://localhost");
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
  const candidate = resolve(ROOT, relative || "index.html");

  if (candidate !== ROOT && !candidate.startsWith(`${ROOT}${sep}`)) {
    return null;
  }

  return candidate;
}

const server = createServer(async (request, response) => {
  try {
    let path = requestPath(request.url);
    if (path === null) {
      respond(response, 403, "Forbidden");
      return;
    }

    let information = await stat(path);
    if (information.isDirectory()) {
      path = join(path, "index.html");
      information = await stat(path);
    }

    if (!information.isFile()) {
      respond(response, 404, "Not found");
      return;
    }

    const contentType = MIME_TYPES.get(extname(path)) ?? "application/octet-stream";
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": contentType,
    });
    createReadStream(path).pipe(response);
  } catch (error) {
    if (error.code === "ENOENT") {
      respond(response, 404, "Not found");
    } else {
      console.error(error);
      respond(response, 500, "Internal server error");
    }
  }
});

await new Promise((resolveListening) => {
  server.listen(port, "127.0.0.1", resolveListening);
});
console.log(`Serving ${ROOT} at http://127.0.0.1:${port}`);

function close() {
  server.close(() => process.exit());
}

process.once("SIGINT", close);
process.once("SIGTERM", close);
