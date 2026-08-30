var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_http = __toESM(require("http"), 1);
var import_https = __toESM(require("https"), 1);
var httpAgent = new import_http.default.Agent({ keepAlive: true, maxSockets: 60 });
var httpsAgent = new import_https.default.Agent({ keepAlive: true, maxSockets: 60, rejectUnauthorized: false });
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range, Accept-Ranges, Content-Type, Content-Disposition"
    );
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }
    next();
  });
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  const handleProxy = (req, res) => {
    const targetUrl = req.query.url || req.query.stream;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    const proxyUrlRequest = (urlToFetch, redirectCount = 0) => {
      if (redirectCount > 6) {
        if (!res.headersSent) {
          res.status(508).json({ error: "Too many redirects from IPTV stream server" });
        }
        return;
      }
      try {
        const parsedUrl = new URL(urlToFetch);
        const isHttps = parsedUrl.protocol === "https:";
        const client = isHttps ? import_https.default : import_http.default;
        const agent = isHttps ? httpsAgent : httpAgent;
        const userAgent = req.headers["user-agent"] && !req.headers["user-agent"].includes("Mozilla") ? req.headers["user-agent"] : "IPTVSmartersPro/3.1.5 (Linux; Android 12) ExoPlayerLib/2.18.1 VLC/3.0.18";
        const headers = {
          "User-Agent": userAgent,
          Accept: "*/*",
          Connection: "keep-alive"
        };
        if (req.headers["range"]) {
          headers["Range"] = req.headers["range"];
        }
        const request = client.request(
          urlToFetch,
          {
            method: req.method || "GET",
            headers,
            agent,
            rejectUnauthorized: false,
            // Allows self-signed IPTV stream certs
            timeout: 3e4
          },
          (proxyRes) => {
            request.setTimeout(0);
            if (res.socket) {
              res.socket.setTimeout(0);
            }
            if (proxyRes.statusCode && [301, 302, 303, 307, 308].includes(proxyRes.statusCode) && proxyRes.headers.location) {
              const redirectTarget = new URL(proxyRes.headers.location, urlToFetch).toString();
              proxyRes.resume();
              return proxyUrlRequest(redirectTarget, redirectCount + 1);
            }
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader(
              "Access-Control-Expose-Headers",
              "Content-Length, Content-Range, Accept-Ranges, Content-Type, Content-Disposition"
            );
            const contentType = proxyRes.headers["content-type"] || "";
            const isM3u8 = urlToFetch.includes(".m3u8") || contentType.includes("application/vnd.apple.mpegurl") || contentType.includes("application/x-mpegurl") || contentType.includes("audio/x-mpegurl") || contentType.includes("vnd.apple.mpegurl");
            if (proxyRes.headers["content-range"]) {
              res.setHeader("Content-Range", proxyRes.headers["content-range"]);
            }
            if (proxyRes.headers["accept-ranges"]) {
              res.setHeader("Accept-Ranges", proxyRes.headers["accept-ranges"]);
            } else {
              res.setHeader("Accept-Ranges", "bytes");
            }
            if (isM3u8) {
              res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
              res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
              const chunks = [];
              proxyRes.on("data", (chunk) => chunks.push(chunk));
              proxyRes.on("end", () => {
                const bodyStr = Buffer.concat(chunks).toString("utf-8");
                if (bodyStr.trim().startsWith("#EXTM3U")) {
                  const parentUrl = urlToFetch.substring(0, urlToFetch.lastIndexOf("/") + 1);
                  const lines = bodyStr.split("\n");
                  const rewrittenLines = lines.map((line) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith("#")) {
                      if (trimmed.includes('URI="')) {
                        return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
                          const absUri = uri.startsWith("http://") || uri.startsWith("https://") ? uri : new URL(uri, parentUrl).toString();
                          return `URI="/api/proxy?url=${encodeURIComponent(absUri)}"`;
                        });
                      }
                      return line;
                    }
                    const absoluteSegmentUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://") ? trimmed : new URL(trimmed, parentUrl).toString();
                    return `/api/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
                  });
                  const finalPlaylist = rewrittenLines.join("\n");
                  res.setHeader("Content-Length", Buffer.byteLength(finalPlaylist));
                  res.status(proxyRes.statusCode || 200).send(finalPlaylist);
                } else {
                  res.setHeader("Content-Length", Buffer.concat(chunks).length);
                  res.status(proxyRes.statusCode || 200).end(Buffer.concat(chunks));
                }
              });
              return;
            }
            if (contentType && contentType !== "application/octet-stream") {
              res.setHeader("Content-Type", contentType);
            } else if (urlToFetch.includes(".ts")) {
              res.setHeader("Content-Type", "video/mp2t");
            } else if (urlToFetch.includes(".mp4")) {
              res.setHeader("Content-Type", "video/mp4");
            } else if (urlToFetch.includes(".mkv")) {
              res.setHeader("Content-Type", "video/x-matroska");
            } else {
              res.setHeader("Content-Type", contentType || "video/mp4");
            }
            if (proxyRes.headers["content-length"]) {
              res.setHeader("Content-Length", proxyRes.headers["content-length"]);
            }
            res.status(proxyRes.statusCode || 200);
            proxyRes.pipe(res);
          }
        );
        request.on("error", (err) => {
          console.error("Proxy error for URL:", urlToFetch, err.message);
          if (!res.headersSent) {
            res.status(502).json({ error: `Proxy request failed: ${err.message}` });
          }
        });
        request.on("timeout", () => {
          request.destroy();
          if (!res.headersSent) {
            res.status(504).json({ error: "Proxy request timed out" });
          }
        });
        req.on("close", () => {
          request.destroy();
        });
        request.end();
      } catch (err) {
        if (!res.headersSent) {
          res.status(400).json({ error: "Invalid URL provided: " + err.message });
        }
      }
    };
    proxyUrlRequest(targetUrl);
  };
  app.all("/api/proxy", handleProxy);
  app.all("/api/stream", handleProxy);
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Codigo Master IPTV", version: "1.0.0" });
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Codigo Master IPTV server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
