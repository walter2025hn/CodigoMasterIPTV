import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import http from "http";
import https from "https";

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 60 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 60, rejectUnauthorized: false });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS middleware for all API requests
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

  // JSON parser with generous limit for large M3U playlist uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // CORS Proxy endpoint for IPTV lists and streams when testing in Web browsers
  const handleProxy = (req: express.Request, res: express.Response) => {
    const targetUrl = (req.query.url as string) || (req.query.stream as string);
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    const proxyUrlRequest = (urlToFetch: string, redirectCount = 0) => {
      if (redirectCount > 6) {
        if (!res.headersSent) {
          res.status(508).json({ error: "Too many redirects from IPTV stream server" });
        }
        return;
      }

      try {
        const parsedUrl = new URL(urlToFetch);
        const isHttps = parsedUrl.protocol === "https:";
        const client = isHttps ? https : http;
        const agent = isHttps ? httpsAgent : httpAgent;

        const headers: Record<string, string> = {
          "User-Agent":
            (req.headers["user-agent"] as string) ||
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 IPTVPlayer/2.0",
          Accept: "*/*",
        };

        if (req.headers["range"]) {
          headers["Range"] = req.headers["range"] as string;
        }

        const request = client.request(
          urlToFetch,
          {
            method: req.method || "GET",
            headers,
            agent,
            rejectUnauthorized: false, // Allows self-signed IPTV stream certs
            timeout: 30000,
          },
          (proxyRes) => {
            // Follow HTTP 301, 302, 303, 307, 308 redirects automatically on server-side
            if (
              proxyRes.statusCode &&
              [301, 302, 303, 307, 308].includes(proxyRes.statusCode) &&
              proxyRes.headers.location
            ) {
              const redirectTarget = new URL(proxyRes.headers.location, urlToFetch).toString();
              proxyRes.resume(); // discard unused socket body
              return proxyUrlRequest(redirectTarget, redirectCount + 1);
            }

            // Set CORS headers for browser
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "*");
            res.setHeader(
              "Access-Control-Expose-Headers",
              "Content-Length, Content-Range, Accept-Ranges, Content-Type, Content-Disposition"
            );

            // Forward video/audio content type or infer appropriate mime
            const contentType = proxyRes.headers["content-type"];
            if (contentType && contentType !== "application/octet-stream") {
              res.setHeader("Content-Type", contentType);
            } else if (urlToFetch.includes(".m3u8")) {
              res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
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
            if (proxyRes.headers["content-range"]) {
              res.setHeader("Content-Range", proxyRes.headers["content-range"]);
            }
            if (proxyRes.headers["accept-ranges"]) {
              res.setHeader("Accept-Ranges", proxyRes.headers["accept-ranges"]);
            } else {
              res.setHeader("Accept-Ranges", "bytes");
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
      } catch (err: any) {
        if (!res.headersSent) {
          res.status(400).json({ error: "Invalid URL provided: " + err.message });
        }
      }
    };

    proxyUrlRequest(targetUrl);
  };

  app.all("/api/proxy", handleProxy);
  app.all("/api/stream", handleProxy);

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
