/**
 * Regular Expression Tester Route Handler
 *
 * Endpoint: POST /api/regex/test
 * Body:
 * - pattern (string, required): The regular expression pattern (e.g. "(\\w+)@(\\w+\\.\\w+)").
 * - flags (string, optional): Regex flags such as "g", "i", "m", "s", "u". Default: "g".
 * - text (string, required): The sample text string to test against the regex.
 *
 * Execution Flow:
 * 1. Validates presence of both 'pattern' and 'text' fields.
 * 2. Compiles pattern and flags into a RegExp instance inside a try/catch to catch syntax errors.
 * 3. If global flag 'g' is active:
 *    - Iterates using RegExp.prototype.exec() to collect all matching substrings, indexes, and named groups.
 *    - Guards against infinite loops when a zero-length match is encountered by incrementing lastIndex.
 * 4. If non-global:
 *    - Evaluates text.match() for the first matching occurrence.
 * 5. Sets a 'last_tool_used' cookie for usage tracking.
 * 6. Returns match summary and detailed match list.
 *
 * @param {import("http").IncomingMessage} req - Incoming HTTP request
 * @param {import("http").ServerResponse} res - Enhanced NodeFrame response
 */
export function handleRegexTest(req, res) {
  const body = req.body || {};
  const { pattern, flags = "g", text } = body;

  // Step 1: Input presence and type checks
  if (!pattern || typeof text !== "string") {
    return res.status(400).json({
      success: false,
      error: "Both 'pattern' and 'text' fields are required"
    });
  }

  try {
    // Step 2: Instantiate RegExp with supplied flags
    const regex = new RegExp(pattern, flags);
    const matches = [];

    // Step 3: Match extraction
    if (flags.includes("g")) {
      // Global mode: extract all occurrences
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          match: match[0],
          index: match.index,
          groups: match.groups || null
        });

        // Defensive guard: advance lastIndex to avoid infinite loops on zero-length matches
        if (regex.lastIndex === match.index) {
          regex.lastIndex++;
        }
      }
    } else {
      // Single match mode
      const match = text.match(regex);
      if (match) {
        matches.push({
          match: match[0],
          index: match.index || 0,
          groups: match.groups || null
        });
      }
    }

    // Step 4: Respond with match details and cookie
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
    // Step 5: Catch invalid regex syntax (e.g. unclosed parenthesis)
    res.status(400).json({
      success: false,
      error: "Invalid Regular Expression syntax",
      details: err.message
    });
  }
}
