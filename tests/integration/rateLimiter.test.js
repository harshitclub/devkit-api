import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../../src/app.js";

describe("Rate Limiter Integration Tests", () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    // Create an app instance with a strict limit: max 2 requests per 2000ms window
    const app = createApp({
      enableLogger: false,
      enableRateLimiter: true,
      rateLimitOptions: { windowMs: 2000, maxRequests: 2 }
    });

    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("should allow requests up to the max limit and block subsequent requests with 429", async () => {
    // Request 1: OK
    const res1 = await fetch(`${baseUrl}/api/health`);
    expect(res1.status).toBe(200);

    // Request 2: OK
    const res2 = await fetch(`${baseUrl}/api/health`);
    expect(res2.status).toBe(200);

    // Request 3: Rate limited
    const res3 = await fetch(`${baseUrl}/api/health`);
    expect(res3.status).toBe(429);
    const json3 = await res3.json();
    expect(json3.success).toBe(false);
    expect(json3.message).toBe("Too many requests");
  });
});
