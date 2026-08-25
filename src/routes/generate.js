import crypto from "crypto";

/**
 * UUID & Random Token Generator Route Handler
 *
 * Endpoint: GET /api/generate/uuid
 * Query Params:
 * - count (number string, optional): Number of UUIDs to generate (clamped between 1 and 50). Default: 1.
 *
 * Execution Flow:
 * 1. Reads 'count' query parameter from req.query.
 * 2. Parses integer value and clamps it between 1 and 50 to prevent memory/CPU abuse.
 * 3. Generates UUID v4 tokens using Node.js's built-in crypto.randomUUID().
 * 4. Sets 'last_generated_count' cookie.
 * 5. Returns array of generated UUIDs.
 *
 * @param {import("http").IncomingMessage} req - Incoming HTTP request
 * @param {import("http").ServerResponse} res - Enhanced NodeFrame response
 */
export function handleGenerateUuid(req, res) {
  const { count = "1" } = req.query || {};

  // Step 1: Parse and clamp count between 1 (minimum) and 50 (maximum)
  const total = Math.min(Math.max(parseInt(count, 10) || 1, 1), 50);

  // Step 2: Generate cryptographically random UUIDs
  const uuids = [];
  for (let i = 0; i < total; i++) {
    uuids.push(crypto.randomUUID());
  }

  // Step 3: Respond with generated list and cookie tracking
  res
    .status(200)
    .cookie("last_generated_count", String(total), { maxAge: 86400000 })
    .json({
      success: true,
      count: total,
      uuids
    });
}
