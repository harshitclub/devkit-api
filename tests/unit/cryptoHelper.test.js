import { describe, it, expect } from "vitest";
import { computeHash, SUPPORTED_ALGOS } from "../../src/utils/cryptoHelper.js";
import crypto from "crypto";

describe("cryptoHelper unit tests", () => {
  it("should list all supported algorithms", () => {
    expect(SUPPORTED_ALGOS).toEqual([
      "sha256",
      "sha512",
      "md5",
      "base64",
      "base64decode"
    ]);
  });

  it("should compute valid SHA-256 hash by default", () => {
    const text = "Hello NodeFrame";
    const expected = crypto.createHash("sha256").update(text).digest("hex");

    const result = computeHash({ text });
    expect(result.algorithm).toBe("sha256");
    expect(result.isHmac).toBe(false);
    expect(result.result).toBe(expected);
  });

  it("should compute valid SHA-512 hash", () => {
    const text = "Hello NodeFrame";
    const expected = crypto.createHash("sha512").update(text).digest("hex");

    const result = computeHash({ text, algo: "sha512" });
    expect(result.algorithm).toBe("sha512");
    expect(result.result).toBe(expected);
  });

  it("should compute valid MD5 hash", () => {
    const text = "Hello NodeFrame";
    const expected = crypto.createHash("md5").update(text).digest("hex");

    const result = computeHash({ text, algo: "md5" });
    expect(result.algorithm).toBe("md5");
    expect(result.result).toBe(expected);
  });

  it("should compute valid Base64 encoding", () => {
    const text = "DevKit Rocks!";
    const expected = Buffer.from(text, "utf8").toString("base64");

    const result = computeHash({ text, algo: "base64" });
    expect(result.algorithm).toBe("base64");
    expect(result.result).toBe(expected);
  });

  it("should decode valid Base64 string", () => {
    const text = "RGV2S2l0IFJvY2tzIQ==";
    const expected = "DevKit Rocks!";

    const result = computeHash({ text, algo: "base64decode" });
    expect(result.algorithm).toBe("base64decode");
    expect(result.result).toBe(expected);
  });

  it("should compute HMAC when secret key is provided", () => {
    const text = "DevKit Payload";
    const secret = "super-secret-key";
    const expected = crypto.createHmac("sha256", secret).update(text).digest("hex");

    const result = computeHash({ text, algo: "sha256", secret });
    expect(result.isHmac).toBe(true);
    expect(result.result).toBe(expected);
  });

  it("should throw error for unsupported algorithm", () => {
    expect(() => {
      computeHash({ text: "test", algo: "unsupported_algo" });
    }).toThrow(/Unsupported algorithm/);
  });

  it("should throw TypeError when text is not a string", () => {
    expect(() => {
      computeHash({ text: 123 });
    }).toThrow(TypeError);
  });
});
