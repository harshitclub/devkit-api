import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createApp } from "../../src/app.js";

describe("DevKit API Integration Tests", () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const app = createApp({
      enableLogger: false,
      enableRateLimiter: false
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

  // ==========================================
  // 1. Health & Meta Endpoint
  // ==========================================
  describe("GET /api/health", () => {
    it("should return online status and framework metadata", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("online");
      expect(data.framework).toBe("@harshitclub/nodeframe");
      expect(typeof data.uptimeSeconds).toBe("number");
      expect(typeof data.memoryUsageMB).toBe("number");
      expect(typeof data.timestamp).toBe("string");
    });
  });

  // ==========================================
  // 2. CORS Preflight & Headers
  // ==========================================
  describe("CORS Support", () => {
    it("should respond to OPTIONS preflight with 204 and CORS headers", async () => {
      const res = await fetch(`${baseUrl}/api/format/json`, {
        method: "OPTIONS"
      });
      expect(res.status).toBe(204);
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
      expect(res.headers.get("access-control-allow-methods")).toContain("POST");
      expect(res.headers.get("access-control-allow-headers")).toContain("Content-Type");
    });

    it("should include CORS headers in GET/POST responses", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.headers.get("access-control-allow-origin")).toBe("*");
    });
  });

  // ==========================================
  // 3. JSON Formatter & Minifier
  // ==========================================
  describe("POST /api/format/json", () => {
    it("should format a JSON object with default 2-space indentation", async () => {
      const payload = { data: { name: "DevKit", fast: true } };
      const res = await fetch(`${baseUrl}/api/format/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.mode).toBe("formatted");
      expect(json.result).toBe(JSON.stringify(payload.data, null, 2));
      expect(json.stats.outputLength).toBeGreaterThan(0);
      expect(res.headers.get("set-cookie")).toContain("last_tool_used=json_formatter");
    });

    it("should format stringified JSON with custom indentation", async () => {
      const payload = { data: '{"version":1,"enabled":true}', space: 4 };
      const res = await fetch(`${baseUrl}/api/format/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result).toBe(JSON.stringify({ version: 1, enabled: true }, null, 4));
    });

    it("should minify JSON when ?minify=true", async () => {
      const payload = { data: { a: 1, b: [2, 3] } };
      const res = await fetch(`${baseUrl}/api/format/json?minify=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.mode).toBe("minified");
      expect(json.result).toBe('{"a":1,"b":[2,3]}');
    });

    it("should return 400 when 'data' field is missing", async () => {
      const res = await fetch(`${baseUrl}/api/format/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Missing 'data' field");
    });

    it("should return 400 for invalid JSON string", async () => {
      const res = await fetch(`${baseUrl}/api/format/json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: "{ invalid json ... " })
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Invalid JSON format provided");
    });
  });

  // ==========================================
  // 4. Cryptographic Hash & Encoder
  // ==========================================
  describe("POST /api/crypto/hash", () => {
    it("should compute SHA-256 hash by default", async () => {
      const res = await fetch(`${baseUrl}/api/crypto/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Hello NodeFrame" })
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.algorithm).toBe("sha256");
      expect(json.isHmac).toBe(false);
      expect(typeof json.result).toBe("string");
      expect(res.headers.get("set-cookie")).toContain("last_tool_used=crypto_hash");
    });

    it("should compute SHA-512, MD5, and Base64", async () => {
      const text = "DevKit Secure API";

      const algos = ["sha512", "md5", "base64", "base64decode"];
      for (const algo of ["sha512", "md5", "base64"]) {
        const res = await fetch(`${baseUrl}/api/crypto/hash?algo=${algo}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.algorithm).toBe(algo);
      }
    });

    it("should compute HMAC when secret key is provided", async () => {
      const res = await fetch(`${baseUrl}/api/crypto/hash?algo=sha256`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "secure payload", secret: "super-key" })
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isHmac).toBe(true);
      expect(typeof json.result).toBe("string");
    });

    it("should return 400 for unsupported algorithm", async () => {
      const res = await fetch(`${baseUrl}/api/crypto/hash?algo=unknown_algo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "test" })
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Unsupported algorithm");
    });

    it("should return 400 when text is not a string", async () => {
      const res = await fetch(`${baseUrl}/api/crypto/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: 12345 })
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("must be a valid string");
    });
  });

  // ==========================================
  // 5. Regular Expression Tester
  // ==========================================
  describe("POST /api/regex/test", () => {
    it("should find multiple matches with global flag", async () => {
      const payload = {
        pattern: "(\\w+)@(\\w+\\.\\w+)",
        flags: "g",
        text: "Contact me at dev@nodeframe.dev or test@example.com"
      };

      const res = await fetch(`${baseUrl}/api/regex/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isMatch).toBe(true);
      expect(json.totalMatches).toBe(2);
      expect(json.matches[0].match).toBe("dev@nodeframe.dev");
      expect(json.matches[1].match).toBe("test@example.com");
      expect(res.headers.get("set-cookie")).toContain("last_tool_used=regex_tester");
    });

    it("should find single match without global flag", async () => {
      const payload = {
        pattern: "DevKit",
        flags: "i",
        text: "devkit is fast"
      };

      const res = await fetch(`${baseUrl}/api/regex/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.isMatch).toBe(true);
      expect(json.totalMatches).toBe(1);
    });

    it("should return 400 for invalid regular expression syntax", async () => {
      const res = await fetch(`${baseUrl}/api/regex/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern: "(unclosed group", text: "sample text" })
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Invalid Regular Expression syntax");
    });

    it("should return 400 when pattern or text is missing", async () => {
      const res = await fetch(`${baseUrl}/api/regex/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pattern: "abc" })
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toContain("Both 'pattern' and 'text' fields are required");
    });
  });

  // ==========================================
  // 6. UUID & Random Token Generator
  // ==========================================
  describe("GET /api/generate/uuid", () => {
    it("should generate 1 UUID by default", async () => {
      const res = await fetch(`${baseUrl}/api/generate/uuid`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(1);
      expect(json.uuids.length).toBe(1);
      expect(json.uuids[0]).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
      expect(res.headers.get("set-cookie")).toContain("last_generated_count=1");
    });

    it("should generate multiple UUIDs with count query", async () => {
      const res = await fetch(`${baseUrl}/api/generate/uuid?count=5`);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.count).toBe(5);
      expect(json.uuids.length).toBe(5);
      expect(res.headers.get("set-cookie")).toContain("last_generated_count=5");
    });

    it("should clamp count between 1 and 50", async () => {
      const resMax = await fetch(`${baseUrl}/api/generate/uuid?count=100`);
      const jsonMax = await resMax.json();
      expect(jsonMax.count).toBe(50);
      expect(jsonMax.uuids.length).toBe(50);

      const resMin = await fetch(`${baseUrl}/api/generate/uuid?count=-5`);
      const jsonMin = await resMin.json();
      expect(jsonMin.count).toBe(1);
      expect(jsonMin.uuids.length).toBe(1);
    });
  });

  // ==========================================
  // 7. Text Transformer & Slugifier
  // ==========================================
  describe("GET /api/transform/slug", () => {
    it("should convert text to slug by default", async () => {
      const res = await fetch(
        `${baseUrl}/api/transform/slug?text=${encodeURIComponent("My Awesome Project")}`
      );
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.result).toBe("my-awesome-project");
    });

    it("should convert text to camel, snake, and pascal formats", async () => {
      const text = encodeURIComponent("My Awesome Project");

      const camelRes = await fetch(`${baseUrl}/api/transform/slug?text=${text}&format=camel`);
      const camelJson = await camelRes.json();
      expect(camelJson.result).toBe("myAwesomeProject");

      const snakeRes = await fetch(`${baseUrl}/api/transform/slug?text=${text}&format=snake`);
      const snakeJson = await snakeRes.json();
      expect(snakeJson.result).toBe("my_awesome_project");

      const pascalRes = await fetch(`${baseUrl}/api/transform/slug?text=${text}&format=pascal`);
      const pascalJson = await pascalRes.json();
      expect(pascalJson.result).toBe("MyAwesomeProject");
    });

    it("should return 400 when text parameter is missing", async () => {
      const res = await fetch(`${baseUrl}/api/transform/slug`);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error).toBe("Query parameter 'text' is required");
    });
  });

  // ==========================================
  // 8. 404 & Unmatched Routes
  // ==========================================
  describe("404 Unmatched Routes", () => {
    it("should return 404 for unknown endpoints", async () => {
      const res = await fetch(`${baseUrl}/api/non-existent-route`);
      expect(res.status).toBe(404);
    });
  });
});
