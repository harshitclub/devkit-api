# 🛠️ DevKit API

Fast, in-memory developer utility API built purely with [@harshitclub/nodeframe](https://www.npmjs.com/package/@harshitclub/nodeframe). Zero database, zero heavy dependencies, 100% compute.

---

## ⚡ Features

- **🚀 100% In-Memory**: Instant compute with sub-millisecond response latency.
- **🛡️ Built-in Security**: CORS preflight enabled, per-IP rate limiting, and strict input validation.
- **🧪 Tested**: Full unit and integration test suite powered by [Vitest](https://vitest.dev/).
- **💻 Zero External Runtime Dependencies**: Powered entirely by Node.js core modules + `@harshitclub/nodeframe`.
- **🐳 Docker Ready**: Containerized with lightweight multi-stage Alpine image and Docker Compose.
- **📮 Postman Collection**: Ready-to-import Postman collection included (`devkit-api.postman_collection.json`).

---

## 🚀 Quick Start

### Installation & Local Run
```bash
# Install dependencies
npm install

# Production mode (Port 4000)
npm start

# Development mode (with auto-reload)
npm run dev
```

### Run Tests
```bash
# Run unit & integration test suite
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 📮 Postman Collection

A complete Postman Collection is included in the root directory:
- File: [`devkit-api.postman_collection.json`](./devkit-api.postman_collection.json)

**How to Import & Test:**
1. Open **Postman**.
2. Click **Import** (top left).
3. Drag & drop or select `devkit-api.postman_collection.json`.
4. Ensure the server is running (`npm start` or `npm run dev`).
5. All requests use the `{{baseUrl}}` variable defaulting to `http://localhost:4000`.

---

## 🐳 Docker Deployment

### Using Docker
```bash
# Build Docker image
docker build -t devkit-api .

# Run container
docker run -d -p 4000:4000 --name devkit-api devkit-api
```

### Using Docker Compose
```bash
# Start container in background
docker compose up -d

# Stop container
docker compose down
```

---

## 📡 API Reference

| Method | Endpoint | Query / Body | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | — | Health check, uptime, and memory metrics |
| `POST` | `/api/format/json` | `?minify=true` <br/> `{ "data": {...}, "space": 2 }` | Beautify or minify JSON with byte stats |
| `POST` | `/api/crypto/hash` | `?algo=sha256` <br/> `{ "text": "...", "secret": "..." }` | Hash, HMAC, or Base64 encode/decode |
| `POST` | `/api/regex/test` | `{ "pattern": "...", "flags": "g", "text": "..." }` | Test regular expressions & extract matches |
| `GET` | `/api/generate/uuid` | `?count=5` | Generate cryptographically random UUIDs (1–50) |
| `GET` | `/api/transform/slug` | `?text=Hello+World&format=camel` | Convert text to `slug`, `camel`, `snake`, or `pascal` |

---

## 🧪 Example Requests

### 1. Format JSON
```bash
curl -X POST http://localhost:4000/api/format/json \
  -H "Content-Type: application/json" \
  -d '{"data": {"project": "DevKit", "framework": "NodeFrame"}, "space": 2}'
```

### 2. Generate Cryptographic Hash / HMAC
```bash
curl -X POST "http://localhost:4000/api/crypto/hash?algo=sha256" \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello NodeFrame", "secret": "optional-hmac-key"}'
```

### 3. Test Regular Expression
```bash
curl -X POST http://localhost:4000/api/regex/test \
  -H "Content-Type: application/json" \
  -d '{"pattern": "(\\w+)@(\\w+\\.\\w+)", "flags": "g", "text": "dev@nodeframe.dev"}'
```

### 4. Generate UUIDs
```bash
curl "http://localhost:4000/api/generate/uuid?count=3"
```

### 5. String Transformer & Slugifier
```bash
curl "http://localhost:4000/api/transform/slug?text=DevKit%20API&format=snake"
```

---

## 📂 Project Structure

```text
devkit-api/
├── src/
│   ├── app.js                          # App initialization, CORS, middleware, and routes
│   ├── routes/                         # Modular route handlers
│   │   ├── health.js
│   │   ├── format.js
│   │   ├── crypto.js
│   │   ├── regex.js
│   │   ├── generate.js
│   │   └── transform.js
│   └── utils/                          # Pure transformation and crypto helpers
│       ├── cryptoHelper.js
│       └── textTransformer.js
├── tests/
│   ├── unit/                           # Pure logic unit tests
│   └── integration/                    # HTTP endpoint & rate-limiting integration tests
├── Dockerfile                          # Production multi-stage Alpine Dockerfile
├── docker-compose.yml                  # Docker compose orchestration
├── devkit-api.postman_collection.json  # Postman collection v2.1.0
├── .dockerignore
├── server.js                           # Server entry point
├── package.json
└── README.md
```
