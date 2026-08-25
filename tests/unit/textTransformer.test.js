import { describe, it, expect } from "vitest";
import { transformText, SUPPORTED_FORMATS } from "../../src/utils/textTransformer.js";

describe("textTransformer unit tests", () => {
  it("should list supported formats", () => {
    expect(SUPPORTED_FORMATS).toEqual(["slug", "camel", "snake", "pascal"]);
  });

  it("should transform string to slug by default", () => {
    expect(transformText("Hello World Project")).toBe("hello-world-project");
    expect(transformText("  My Awesome Project!  ")).toBe("my-awesome-project");
  });

  it("should transform string to camelCase", () => {
    expect(transformText("Hello World Project", "camel")).toBe("helloWorldProject");
    expect(transformText("my_awesome_project", "camel")).toBe("myAwesomeProject");
  });

  it("should transform string to snake_case", () => {
    expect(transformText("Hello World Project", "snake")).toBe("hello_world_project");
    expect(transformText("My-Awesome-Project", "snake")).toBe("my_awesome_project");
  });

  it("should transform string to PascalCase", () => {
    expect(transformText("hello world project", "pascal")).toBe("HelloWorldProject");
    expect(transformText("my_awesome_project", "pascal")).toBe("MyAwesomeProject");
  });

  it("should strip punctuation and special characters cleanly", () => {
    expect(transformText("Hello, World! @2026 #DevKit", "slug")).toBe("hello-world-2026-devkit");
  });

  it("should throw TypeError when input is not a string", () => {
    expect(() => transformText(null)).toThrow(TypeError);
    expect(() => transformText(undefined)).toThrow(TypeError);
    expect(() => transformText(12345)).toThrow(TypeError);
  });
});
