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
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }
    try {
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === "https:";
      const client = isHttps ? import_https.default : import_http.default;
      const headers = {
        "User-Agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*"
      };
      if (req.headers["range"]) {
        headers["Range"] = req.headers["range"];
      }
      const request = client.request(
        targetUrl,
        {
          method: "GET",
          headers,
          rejectUnauthorized: false,
          // Allows self-signed IPTV stream certs
          timeout: 2e4
        },
        (proxyRes) => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
          res.setHeader("Access-Control-Allow-Headers", "*");
          if (proxyRes.headers["content-type"]) {
            res.setHeader("Content-Type", proxyRes.headers["content-type"]);
          }
          if (proxyRes.headers["content-length"]) {
            res.setHeader("Content-Length", proxyRes.headers["content-length"]);
          }
          if (proxyRes.headers["content-range"]) {
            res.setHeader("Content-Range", proxyRes.headers["content-range"]);
          }
          if (proxyRes.headers["accept-ranges"]) {
            res.setHeader("Accept-Ranges", proxyRes.headers["accept-ranges"]);
          }
          res.status(proxyRes.statusCode || 200);
          proxyRes.pipe(res);
        }
      );
      request.on("error", (err) => {
        console.error("Proxy error:", err.message);
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
      request.end();
    } catch (err) {
      console.error("Invalid target URL:", err.message);
      res.status(400).json({ error: "Invalid URL provided" });
    }
  });
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
