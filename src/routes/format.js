/**
 * JSON Formatter & Minifier Route Handler
 *
 * Endpoint: POST /api/format/json
 * Query Params:
 * - minify (boolean string, e.g., "true" or "false"): When "true", compacts JSON with 0 whitespace.
 * Body:
 * - data (Object|Array|string, required): The JSON object or JSON string to format.
 * - space (number, optional): Custom indentation space count (default: 2).
 *
 * Execution Flow:
 * 1. Validates that the 'data' field is present in the request body.
 * 2. If 'data' is passed as a string, parses it with JSON.parse to validate syntax.
 * 3. Applies indentation logic based on the 'minify' flag or 'space' parameter.
 * 4. Serializes the parsed data back to a formatted/minified string.
 * 5. Sets a 'last_tool_used' cookie for usage analytics.
 * 6. Returns output string alongside size statistics (originalLength, outputLength, sizeBytes).
 *
 * @param {import("http").IncomingMessage} req - Incoming HTTP request
 * @param {import("http").ServerResponse} res - Enhanced NodeFrame response
 */
export function handleFormatJson(req, res) {
  const body = req.body || {};
  const { data, space = 2 } = body;
  const { minify } = req.query || {};

  // Step 1: Validate presence of 'data' payload
  if (data === undefined || data === null) {
    return res.status(400).json({
      success: false,
      error: "Missing 'data' field in request body"
    });
  }

  try {
    // Step 2: Parse raw input if provided as a serialized JSON string
    const rawObj = typeof data === "string" ? JSON.parse(data) : data;

    // Step 3: Determine indentation spacing
    const isMinify = minify === "true";
    const indent = isMinify ? 0 : Number(space) || 2;

    // Step 4: Stringify using target indentation
    const result = JSON.stringify(rawObj, null, indent);

    // Step 5: Send response with cookie tracking and byte size stats
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
    // Step 6: Handle JSON syntax parsing errors gracefully
    res.status(400).json({
      success: false,
      error: "Invalid JSON format provided",
      details: err.message
    });
  }
}
