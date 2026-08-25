import crypto from "crypto";

/**
 * Supported cryptographic algorithms and encoding schemes.
 */
export const SUPPORTED_ALGOS = ["sha256", "sha512", "md5", "base64", "base64decode"];

/**
 * Computes a cryptographic hash, HMAC digest, or Base64 encoding/decoding.
 *
 * Execution flow:
 * 1. Validates that the input payload 'text' is a valid string.
 * 2. Normalizes algorithm string to lowercase (defaults to sha256).
 * 3. Verifies that the requested algorithm is supported.
 * 4. Dispatches to the appropriate operation:
 *    - Base64 encoding: encodes UTF-8 text into a base64 string.
 *    - Base64 decoding: decodes base64 string back into UTF-8 text.
 *    - HMAC computation: generates a keyed-hash message authentication code using the provided secret.
 *    - Standard hashing: generates a hex-encoded cryptographic digest (SHA-256, SHA-512, MD5).
 *
 * @param {Object} options
 * @param {string} options.text - The plain text or string payload to process.
 * @param {string} [options.algo="sha256"] - The target algorithm or encoding format.
 * @param {string} [options.secret] - Optional secret key used for HMAC hash computation.
 * @returns {{ result: string, algorithm: string, isHmac: boolean }} An object containing computed result, algorithm, and HMAC flag.
 * @throws {TypeError} If the input 'text' is not a string.
 * @throws {Error} If the algorithm is not supported.
 */
export function computeHash({ text, algo = "sha256", secret }) {
  // Step 1: Enforce strict input validation
  if (typeof text !== "string") {
    throw new TypeError("Field 'text' must be a valid string");
  }

  // Step 2: Normalize algorithm name
  const normalizedAlgo = (algo || "sha256").toLowerCase();

  // Step 3: Validate algorithm against supported list
  if (!SUPPORTED_ALGOS.includes(normalizedAlgo)) {
    throw new Error(
      `Unsupported algorithm '${algo}'. Supported: ${SUPPORTED_ALGOS.join(", ")}`
    );
  }

  let result = "";

  // Step 4: Perform the transformation / cryptographic computation
  if (normalizedAlgo === "base64") {
    // Convert UTF-8 string to Base64 format
    result = Buffer.from(text, "utf8").toString("base64");
  } else if (normalizedAlgo === "base64decode") {
    // Decode Base64 string back to standard UTF-8 text
    result = Buffer.from(text, "base64").toString("utf8");
  } else if (secret) {
    // If a secret is supplied, compute HMAC with the selected algorithm
    result = crypto.createHmac(normalizedAlgo, secret).update(text).digest("hex");
  } else {
    // Otherwise compute a standard cryptographic hash digest
    result = crypto.createHash(normalizedAlgo).update(text).digest("hex");
  }

  return {
    result,
    algorithm: normalizedAlgo,
    isHmac: Boolean(secret)
  };
}
