import { describe, expect, it } from "vitest";
import { detectInput, hostLabel, noteTitle } from "@/lib/capture/detect";

describe("detectInput", () => {
  it.each([
    ["https://www.figma.com/blog/x", "https://www.figma.com/blog/x"],
    ["  http://example.com  ", "http://example.com/"],
    ["stripe.com/blog/idempotency", "https://stripe.com/blog/idempotency"],
    ["news.ycombinator.com", "https://news.ycombinator.com/"],
    ["example.co.uk/a?b=1#c", "https://example.co.uk/a?b=1#c"],
  ])("treats %j as a link", (input, url) => {
    expect(detectInput(input)).toEqual({ kind: "link", url });
  });

  it.each(["remember to call mum", "see https://a.com later", "v1.2", "localhost:3000", "javascript:alert(1)", "file.txt"])(
    "treats %j as a note",
    (input) => {
      expect(detectInput(input).kind).toBe("note");
    },
  );

  it("reports empty input", () => {
    expect(detectInput("   ").kind).toBe("empty");
  });
});

describe("helpers", () => {
  it("strips www from host labels", () => {
    expect(hostLabel("https://www.figma.com/x")).toBe("figma.com");
  });
  it("uses the first non-empty line of a note as its title", () => {
    expect(noteTitle("\n  Tile: zellige\nmatte finish")).toBe("Tile: zellige");
    expect(noteTitle("a".repeat(200)).length).toBe(90);
  });
});
