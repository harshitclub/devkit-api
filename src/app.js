import NodeFrame, {
  parseJsonBody,
  logger,
  rateLimiter
} from "@harshitclub/nodeframe";

import { handleHealth } from "./routes/health.js";
import { handleFormatJson } from "./routes/format.js";
import { handleCryptoHash } from "./routes/crypto.js";
import { handleRegexTest } from "./routes/regex.js";
import { handleGenerateUuid } from "./routes/generate.js";
import { handleTransformSlug } from "./routes/transform.js";

/**
 * Creates and configures the NodeFrame application instance.
 *
 * Middleware Pipeline Configuration:
 * 1. CORS Preflight & Headers: Handles cross-origin requests & OPTIONS preflight.
 * 2. Request Logger: Logs HTTP method, URL, status code, and duration in ms.
 * 3. Rate Limiter: Protects compute-heavy endpoints against burst traffic.
 * 4. JSON Body Parser: Parses streaming JSON request bodies into req.body.
 * 5. Route Handlers: Mounts health check and developer tool endpoints.
 * 6. Global Error Handler: 4-argument error middleware (err, req, res, next).
 *
 * @param {Object} [options={}] - App configuration options.
 * @param {boolean} [options.enableLogger=true] - Toggle request logger middleware.
 * @param {boolean} [options.enableRateLimiter=true] - Toggle rate limiter middleware.
 * @param {Object} [options.rateLimitOptions] - Rate limiter window and limit settings.
 * @returns {NodeFrame} Fully configured NodeFrame application.
 */
export function createApp(options = {}) {
  const {
    enableLogger = true,
    enableRateLimiter = true,
    rateLimitOptions = { windowMs: 60 * 1000, maxRequests: 100 }
  } = options;

  // Initialize fresh NodeFrame instance
  const app = new NodeFrame();

  // ==========================================
  // 1. Global CORS Middleware
  // ==========================================
  app.use((req, res, next) => {
    // Allow any origin for client consumption (e.g., React/Vite/Next.js)
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );

    // Short-circuit OPTIONS preflight requests with HTTP 204 No Content
    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      return res.end();
    }

    next();
  });

  // ==========================================
  // 2. Request Logger Middleware
  // ==========================================
  if (enableLogger) {
    app.use(logger());
  }

  // ==========================================
  // 3. Rate Limiter Middleware
  // ==========================================
  if (enableRateLimiter) {
    app.use(rateLimiter(rateLimitOptions));
  }

  // ==========================================
  // 4. JSON Request Body Parser Middleware
  // ==========================================
  app.use(parseJsonBody);

  // ==========================================
  // 5. Application Route Registrations
  // ==========================================
  app.get("/api/health", handleHealth);
  app.post("/api/format/json", handleFormatJson);
  app.post("/api/crypto/hash", handleCryptoHash);
  app.post("/api/regex/test", handleRegexTest);
  app.get("/api/generate/uuid", handleGenerateUuid);
  app.get("/api/transform/slug", handleTransformSlug);

  // ==========================================
  // 6. Global Error-Handling Middleware (4-arguments)
  // ==========================================
  app.use((err, req, res, next) => {
    if (process.env.NODE_ENV !== "test") {
      console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err.message || err);
    }

    res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: err.message || "An unexpected error occurred"
    });
  });

  return app;
}

export default createApp;
