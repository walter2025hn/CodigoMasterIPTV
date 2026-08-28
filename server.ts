import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import https from "https";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON parser with generous limit for large M3U playlist uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS Proxy endpoint for IPTV lists and streams when testing in Web browsers
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === "https:";
      const client = isHttps ? https : http;

      const headers: Record<string, string> = {
        "User-Agent": (req.headers["user-agent"] as string) || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
      };

      if (req.headers["range"]) {
        headers["Range"] = req.headers["range"] as string;
      }

      const request = client.request(
        targetUrl,
        {
          method: "GET",
          headers,
          rejectUnauthorized: false, // Allows self-signed IPTV stream certs
          timeout: 20000,
        },
        (proxyRes) => {
          // Set CORS headers
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
    } catch (err: any) {
      console.error("Invalid target URL:", err.message);
      res.status(400).json({ error: "Invalid URL provided" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Codigo Master IPTV", version: "1.0.0" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Codigo Master IPTV server running on port ${PORT}`);
  });
}

startServer();
