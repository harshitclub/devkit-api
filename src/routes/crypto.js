import { computeHash, SUPPORTED_ALGOS } from "../utils/cryptoHelper.js";

/**
 * Cryptographic Hash & Encoder Route Handler
 *
 * Endpoint: POST /api/crypto/hash
 * Query Params:
 * - algo (string, optional): Algorithm name ("sha256" | "sha512" | "md5" | "base64" | "base64decode"). Default: "sha256".
 * Body:
 * - text (string, required): Text payload to hash, encode, or decode.
 * - secret (string, optional): Secret key for HMAC message signing.
 *
 * Execution Flow:
 * 1. Validates that 'text' is a valid string.
 * 2. Checks that the requested algorithm is supported.
 * 3. Calls computeHash() helper to perform the cryptographic calculation.
 * 4. Sets a 'last_tool_used' cookie for usage analytics.
 * 5. Returns the hash/encoded result along with metadata (algorithm, isHmac, inputLength).
 *
 * @param {import("http").IncomingMessage} req - Incoming HTTP request
 * @param {import("http").ServerResponse} res - Enhanced NodeFrame response
 */
export function handleCryptoHash(req, res) {
  const body = req.body || {};
  const { text, secret } = body;
  const { algo = "sha256" } = req.query || {};

  // Step 1: Validate input text type
  if (typeof text !== "string") {
    return res.status(400).json({
      success: false,
      error: "Field 'text' must be a valid string"
    });
  }

  // Step 2: Validate algorithm support
  const normalizedAlgo = (algo || "sha256").toLowerCase();
  if (!SUPPORTED_ALGOS.includes(normalizedAlgo)) {
    return res.status(400).json({
      success: false,
      error: `Unsupported algorithm '${algo}'. Supported: ${SUPPORTED_ALGOS.join(", ")}`
    });
  }

  try {
    // Step 3: Compute the cryptographic hash / encoding
    const { result, isHmac } = computeHash({
      text,
      algo: normalizedAlgo,
      secret
    });

    // Step 4: Respond with cookie tracking and calculation results
    res
      .status(200)
      .cookie("last_tool_used", "crypto_hash", { maxAge: 86400000 })
      .json({
        success: true,
        algorithm: normalizedAlgo,
        isHmac,
        inputLength: text.length,
        result
      });
  } catch (err) {
    // Step 5: Handle unforeseen runtime errors
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
}
