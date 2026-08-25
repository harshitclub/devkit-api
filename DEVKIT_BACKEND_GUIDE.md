# 🛠️ DevKit API — Developer Utilities & Transformation Backend

> A fast, in-memory developer utility API built purely with **NodeFrame** (`@harshitclub/nodeframe`). Zero database, zero heavy dependencies, 100% compute.

---

## 📌 1. Project Overview

**DevKit API** is an open-source, server-side developer toolset designed for formatting, cryptographic hashing, regular expression testing, text transformations, and ID generation.

### 🌟 Key Highlights
- **Framework**: `@harshitclub/nodeframe` (Built on Node.js core HTTP modules)
- **Runtime**: Node.js `>= 18` (ESM)
- **Database**: None (100% in-memory processing)
- **Dependencies**: Zero external runtime dependencies (`crypto` from Node.js standard library)
- **Features Used**:
  - `parseJsonBody` for JSON stream parsing
  - `logger()` for request duration tracking
  - `rateLimiter()` to protect CPU-intensive compute endpoints
  - `req.query` & `req.params` for parameter parsing
  - `res.status()`, `res.json()`, and `res.cookie()` for chainable responses
  - 4-argument error handling pipeline `(err, req, res, next)`

---

## 📂 2. Project Directory Structure

```text
devkit-api/
├── package.json
├── server.js
├── README.md
└── .gitignore
```

---

## 📦 3. Project Setup

### Step 1: Initialize Project & Install Dependencies
Create a new directory and initialize your project:

```bash
mkdir devkit-api
cd devkit-api
npm init -y
```

### Step 2: Configure `package.json`
Update `package.json` to enable ES Modules (`"type": "module"`) and install `@harshitclub/nodeframe`:

```json
{
  "name": "devkit-api",
  "version": "1.0.0",
  "description": "Developer Utilities & Transformation API powered by NodeFrame",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "dependencies": {
    "@harshitclub/nodeframe": "^1.0.1"
  }
}
```

Run installation:
```bash
npm install
```

---

## 💻 4. Complete Source Code (`server.js`)

Create `server.js` with the full implementation:

```javascript
import crypto from "crypto";
import NodeFrame, {
  parseJsonBody,
  logger,
  rateLimiter
} from "@harshitclub/nodeframe";

// 1. Initialize NodeFrame Application
const app = new NodeFrame();

// 2. Global Middleware
// Logs method, url, status code, and duration
app.use(logger());

// Rate limit to 100 requests per minute per IP
app.use(rateLimiter({ windowMs: 60 * 1000, maxRequests: 100 }));

// Parse incoming JSON body streams
app.use(parseJsonBody);

// ==========================================
// 🚀 Health & Meta Endpoints
// ==========================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "online",
    framework: "@harshitclub/nodeframe",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
  });
});

// ==========================================
// 🛠️ 1. JSON Formatter & Minifier
// POST /api/format/json?minify=true|false
// ==========================================
app.post("/api/format/json", (req, res) => {
  const { data, space = 2 } = req.body;
  const { minify } = req.query;

  if (data === undefined || data === null) {
    return res.status(400).json({
      success: false,
      error: "Missing 'data' field in request body"
    });
  }

  try {
    let rawObj = typeof data === "string" ? JSON.parse(data) : data;
    const isMinify = minify === "true";
    const indent = isMinify ? 0 : Number(space) || 2;
    const result = JSON.stringify(rawObj, null, indent);

    res
      .status(200)
      .cookie("last_tool_used", "json_formatter", { maxAge: 86400000 })
      .json({
        success: true,
        mode: isMinify ? "minified" : "formatted",
        result,
        stats: {
          originalLength: JSON.stringify(rawObj).length,
          outputLength: result.length,
          sizeBytes: Buffer.byteLength(result, "utf8")
        }
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Invalid JSON format provided",
      details: err.message
    });
  }
});

// ==========================================
// 🔒 2. Cryptographic Hash & Encoder
// POST /api/crypto/hash?algo=sha256|sha512|md5|base64
// ==========================================
app.post("/api/crypto/hash", (req, res) => {
  const { text, secret } = req.body;
  const { algo = "sha256" } = req.query;

  if (typeof text !== "string") {
    return res.status(400).json({
      success: false,
      error: "Field 'text' must be a valid string"
    });
  }

  const supportedAlgos = ["sha256", "sha512", "md5", "base64", "base64decode"];
  const normalizedAlgo = algo.toLowerCase();

  if (!supportedAlgos.includes(normalizedAlgo)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported algorithm '${algo}'. Supported: ${supportedAlgos.join(", ")}`
    });
  }

  let result = "";

  if (normalizedAlgo === "base64") {
    result = Buffer.from(text, "utf8").toString("base64");
  } else if (normalizedAlgo === "base64decode") {
    result = Buffer.from(text, "base64").toString("utf8");
  } else if (secret) {
    // HMAC hash if secret is provided
    result = crypto.createHmac(normalizedAlgo, secret).update(text).digest("hex");
  } else {
    // Standard Hash
    result = crypto.createHash(normalizedAlgo).update(text).digest("hex");
  }

  res
    .status(200)
    .cookie("last_tool_used", "crypto_hash", { maxAge: 86400000 })
    .json({
      success: true,
      algorithm: normalizedAlgo,
      isHmac: Boolean(secret),
      inputLength: text.length,
      result
    });
});

// ==========================================
// 🔍 3. Regular Expression Tester
// POST /api/regex/test
// ==========================================
app.post("/api/regex/test", (req, res) => {
  const { pattern, flags = "g", text } = req.body;

  if (!pattern || typeof text !== "string") {
    return res.status(400).json({
      success: false,
      error: "Both 'pattern' and 'text' fields are required"
    });
  }

  try {
    const regex = new RegExp(pattern, flags);
    const matches = [];

    if (flags.includes("g")) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.groups || null
        });
        if (regex.lastIndex === match.index) {
          regex.lastIndex++; // Avoid infinite loops on zero-length matches
        }
      }
    } else {
      const match = text.match(regex);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index || 0,
          groups: match.groups || null
        });
      }
    }

    res
      .status(200)
      .cookie("last_tool_used", "regex_tester", { maxAge: 86400000 })
      .json({
        success: true,
        pattern: `/${pattern}/${flags}`,
        isMatch: matches.length > 0,
        totalMatches: matches.length,
        matches
      });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: "Invalid Regular Expression syntax",
      details: err.message
    });
  }
});

// ==========================================
// 🎲 4. UUID & Random Token Generator
// GET /api/generate/uuid?count=5
// ==========================================
app.get("/api/generate/uuid", (req, res) => {
  const { count = "1" } = req.query;
  const total = Math.min(Math.max(parseInt(count, 10) || 1, 1), 50); // Clamp 1 to 50

  const uuids = [];
  for (let i = 0; i < total; i++) {
    uuids.push(crypto.randomUUID());
  }

  res
    .status(200)
    .cookie("last_generated_count", String(total), { maxAge: 86400000 })
    .json({
      success: true,
      count: total,
      uuids
    });
});

// ==========================================
// 🔤 5. Text Transformer & Slugifier
// GET /api/transform/slug?text=Hello%20World&format=slug|camel|snake
// ==========================================
app.get("/api/transform/slug", (req, res) => {
  const { text, format = "slug" } = req.query;

  if (!text) {
    return res.status(400).json({
      success: false,
      error: "Query parameter 'text' is required"
    });
  }

  let result = "";
  const words = text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split(/[\s_-]+/);

  switch (format.toLowerCase()) {
    case "snake":
      result = words.map((w) => w.toLowerCase()).join("_");
      break;
    case "camel":
      result = words
        .map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
        .join("");
      break;
    case "pascal":
      result = words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");
      break;
    case "slug":
    default:
      result = words.map((w) => w.toLowerCase()).join("-");
      break;
  }

  res.status(200).json({
    success: true,
    input: text,
    format,
    result
  });
});

// ==========================================
// 🛡️ Global Error-Handling Middleware
// (error, req, res, next)
// ==========================================
app.use((err, req, res, next) => {
  console.error(`[Unhandled Error] ${req.method} ${req.url}:`, err.message);

  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message
  });
});

// ==========================================
// ⚡ Start Server
// ==========================================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 DevKit API is running at http://localhost:${PORT}`);
});
```

---

## 📡 5. API Specification & Testing (cURL Commands)

### 1. JSON Formatter & Minifier
- **Endpoint**: `POST /api/format/json`
- **Query Param**: `?minify=true` (optional)
- **cURL Request**:
```bash
curl -X POST http://localhost:4000/api/format/json \
  -H "Content-Type: application/json" \
  -d '{"data": {"name":"DevKit","features":["format","hash","regex"]}, "space": 2}'
```

---

### 2. Cryptographic Hasher
- **Endpoint**: `POST /api/crypto/hash?algo=sha256`
- **Supported Algos**: `sha256`, `sha512`, `md5`, `base64`, `base64decode`
- **cURL Request**:
```bash
curl -X POST "http://localhost:4000/api/crypto/hash?algo=sha256" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello NodeFrame"}'
```

---

### 3. Regular Expression Tester
- **Endpoint**: `POST /api/regex/test`
- **cURL Request**:
```bash
curl -X POST http://localhost:4000/api/regex/test \
  -H "Content-Type: application/json" \
  -d '{"pattern": "(\\w+)@(\\w+\\.\\w+)", "flags": "g", "text": "Contact me at dev@nodeframe.dev or test@example.com"}'
```

---

### 4. UUID Generator
- **Endpoint**: `GET /api/generate/uuid?count=3`
- **cURL Request**:
```bash
curl "http://localhost:4000/api/generate/uuid?count=3"
```

---

### 5. String Transformer & Slugifier
- **Endpoint**: `GET /api/transform/slug?text=My%20Awesome%20Project&format=camel`
- **Formats**: `slug`, `camel`, `snake`, `pascal`
- **cURL Request**:
```bash
curl "http://localhost:4000/api/transform/slug?text=My%20Awesome%20Project&format=camel"
```

---

## 🔮 6. Future Frontend Integration Architecture

When you build the frontend (e.g., using React + Vite, Next.js, or Tailwind):

```text
Frontend (React/Vite) 
  │
  ├──► Tool 1: JSON Beautifier UI (Monaco Editor / Textarea) ──► POST /api/format/json
  ├──► Tool 2: Hash & HMAC Tool UI                           ──► POST /api/crypto/hash
  ├──► Tool 3: Interactive Regex Matcher & Highlighter       ──► POST /api/regex/test
  ├──► Tool 4: 1-Click UUID Generator Box                    ──► GET  /api/generate/uuid
  └──► Tool 5: Case Converter & Slug Generator UI            ──► GET  /api/transform/slug
```

### Enabling CORS in NodeFrame
Add this middleware at the top of your route definitions:

```javascript
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }
  next();
});
```

---

## 🎤 7. How to Talk About This in an Interview

> *"To demonstrate the real-world capabilities of **NodeFrame**, I built **DevKit API**, an in-memory developer utility toolset for formatting JSON, testing regular expressions, computing cryptographic hashes (SHA-256, HMAC, Base64), and generating UUIDs.*
> 
> *Because it requires 0 database setup, it operates with microsecond latency. It leverages NodeFrame's native streaming body parser, per-IP rate limiting to prevent CPU exhaustion on regex/hashing tasks, and custom cookie management to track tool activity."*
