import { transformText } from "../utils/textTransformer.js";

/**
 * Text Transformer & Slugifier Route Handler
 *
 * Endpoint: GET /api/transform/slug
 * Query Params:
 * - text (string, required): Input text to transform.
 * - format (string, optional): Target case format: "slug" | "camel" | "snake" | "pascal". Default: "slug".
 *
 * Execution Flow:
 * 1. Reads 'text' and 'format' from query parameters.
 * 2. Returns 400 Bad Request if 'text' query parameter is missing.
 * 3. Invokes transformText() utility to convert text according to casing rules.
 * 4. Returns transformed result with input and format metadata.
 *
 * @param {import("http").IncomingMessage} req - Incoming HTTP request
 * @param {import("http").ServerResponse} res - Enhanced NodeFrame response
 */
export function handleTransformSlug(req, res) {
  const { text, format = "slug" } = req.query || {};

  // Step 1: Validate presence of required 'text' query parameter
  if (!text) {
    return res.status(400).json({
      success: false,
      error: "Query parameter 'text' is required"
    });
  }

  // Step 2: Perform casing transformation
  const result = transformText(text, format);

  // Step 3: Send back the converted text
  res.status(200).json({
    success: true,
    input: text,
    format,
    result
  });
}
