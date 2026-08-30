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

        const userAgent =
          (req.headers["user-agent"] as string && !req.headers["user-agent"].includes("Mozilla"))
            ? (req.headers["user-agent"] as string)
            : "IPTVSmartersPro/3.1.5 (Linux; Android 12) ExoPlayerLib/2.18.1 VLC/3.0.18";

        const headers: Record<string, string> = {
          "User-Agent": userAgent,
          Accept: "*/*",
          Connection: "keep-alive",
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
            // Once data starts flowing, disable socket timeout so full movies/series stream without interruption
            request.setTimeout(0);
            if (res.socket) {
              res.socket.setTimeout(0);
            }

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

            const contentType = proxyRes.headers["content-type"] || "";
            const isM3u8 =
              urlToFetch.includes(".m3u8") ||
              contentType.includes("application/vnd.apple.mpegurl") ||
              contentType.includes("application/x-mpegurl") ||
              contentType.includes("audio/x-mpegurl") ||
              contentType.includes("vnd.apple.mpegurl");

            if (proxyRes.headers["content-range"]) {
              res.setHeader("Content-Range", proxyRes.headers["content-range"]);
            }
            if (proxyRes.headers["accept-ranges"]) {
              res.setHeader("Accept-Ranges", proxyRes.headers["accept-ranges"]);
            } else {
              res.setHeader("Accept-Ranges", "bytes");
            }

            // If it is an M3U8 playlist, buffer and rewrite relative chunk URLs to proxy URLs
            if (isM3u8) {
              res.setHeader("Content-Type", "application/vnd.apple.mpegurl");
              res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
              const chunks: Buffer[] = [];
              proxyRes.on("data", (chunk) => chunks.push(chunk));
              proxyRes.on("end", () => {
                const bodyStr = Buffer.concat(chunks).toString("utf-8");
                if (bodyStr.trim().startsWith("#EXTM3U")) {
                  // Resolve relative URLs in playlist
                  const parentUrl = urlToFetch.substring(0, urlToFetch.lastIndexOf("/") + 1);
                  const lines = bodyStr.split("\n");
                  const rewrittenLines = lines.map((line) => {
                    const trimmed = line.trim();
                    if (!trimmed || trimmed.startsWith("#")) {
                      // Check for URI in tags like #EXT-X-KEY or #EXT-X-MAP
                      if (trimmed.includes('URI="')) {
                        return trimmed.replace(/URI="([^"]+)"/g, (match, uri) => {
                          const absUri = uri.startsWith("http://") || uri.startsWith("https://")
                            ? uri
                            : new URL(uri, parentUrl).toString();
                          return `URI="/api/proxy?url=${encodeURIComponent(absUri)}"`;
                        });
                      }
                      return line;
                    }
                    // This is a segment or sub-playlist URL
                    const absoluteSegmentUrl =
                      trimmed.startsWith("http://") || trimmed.startsWith("https://")
                        ? trimmed
                        : new URL(trimmed, parentUrl).toString();
                    return `/api/proxy?url=${encodeURIComponent(absoluteSegmentUrl)}`;
                  });

                  const finalPlaylist = rewrittenLines.join("\n");
                  res.setHeader("Content-Length", Buffer.byteLength(finalPlaylist));
                  res.status(proxyRes.statusCode || 200).send(finalPlaylist);
                } else {
                  // Not an EXTM3U body, send as binary/standard stream
                  res.setHeader("Content-Length", Buffer.concat(chunks).length);
                  res.status(proxyRes.statusCode || 200).end(Buffer.concat(chunks));
                }
              });
              return;
            }

            // Forward video/audio content type or infer appropriate mime for binary streaming
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
