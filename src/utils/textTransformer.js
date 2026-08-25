/**
 * Supported string transformation casing formats.
 */
export const SUPPORTED_FORMATS = ["slug", "camel", "snake", "pascal"];

/**
 * Transforms an input string into various casing formats or URL-friendly slugs.
 *
 * Supported formats:
 * - 'slug': lowercase words joined with hyphens (e.g., "my-awesome-project")
 * - 'camel': camelCase format (e.g., "myAwesomeProject")
 * - 'snake': lowercase words joined with underscores (e.g., "my_awesome_project")
 * - 'pascal': PascalCase format (e.g., "MyAwesomeProject")
 *
 * Process:
 * 1. Validates that the input is a valid string.
 * 2. Cleans non-alphanumeric/non-hyphen characters and splits into constituent words.
 * 3. Formats each word according to the requested case standard.
 *
 * @param {string} text - The input string to transform.
 * @param {string} [format="slug"] - Target casing format: "slug" | "camel" | "snake" | "pascal".
 * @returns {string} The transformed string result.
 * @throws {TypeError} If text is not a string.
 */
export function transformText(text, format = "slug") {
  // Step 1: Input type validation
  if (typeof text !== "string") {
    throw new TypeError("Parameter 'text' must be a valid string");
  }

  // Step 2: Strip out punctuation/special symbols and split on spaces, hyphens, and underscores
  const words = text
    .trim()
    .replace(/[^\w\s-]/g, "")
    .split(/[\s_-]+/)
    .filter(Boolean);

  // Step 3: Normalize format parameter (defaults to slug)
  const normalizedFormat = (format || "slug").toLowerCase();

  // Step 4: Apply case conversion strategy
  switch (normalizedFormat) {
    case "snake":
      // All lowercase joined by underscores
      return words.map((w) => w.toLowerCase()).join("_");

    case "camel":
      // First word lowercase, subsequent words capitalized
      return words
        .map((w, i) =>
          i === 0
            ? w.toLowerCase()
            : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        )
        .join("");

    case "pascal":
      // Every word capitalized
      return words
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
        .join("");

    case "slug":
    default:
      // All lowercase joined by hyphens (URL slug)
      return words.map((w) => w.toLowerCase()).join("-");
  }
}
