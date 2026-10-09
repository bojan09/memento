import { describe, expect, it } from "vitest";
import { decodeEntities, parsePageMeta } from "@/lib/link-preview/parse";

const PAGE = `<!doctype html><html><head>
<title>Fallback   title</title>
<meta property="og:title" content="How Figma&#39;s multiplayer works">
<meta name="description" content='Central server &amp; per-property conflicts'>
<meta property="og:site_name" content="Figma">
<meta property="og:image" content="/img/cover.png">
</head><body><meta property="og:title" content="ignored body meta"></body></html>`;

describe("parsePageMeta", () => {
  it("prefers Open Graph tags and resolves relative images", () => {
    expect(parsePageMeta(PAGE, "https://www.figma.com/blog/post")).toEqual({
      title: "How Figma's multiplayer works",
      description: "Central server & per-property conflicts",
      siteName: "Figma",
      imageUrl: "https://www.figma.com/img/cover.png",
    });
  });

  it("falls back to <title> and ignores non-http images", () => {
    const meta = parsePageMeta('<head><title> Plain </title><meta property="og:image" content="javascript:alert(1)"></head>', "https://a.com");
    expect(meta.title).toBe("Plain");
    expect(meta.imageUrl).toBeNull();
  });

  it("returns nulls for pages without metadata", () => {
    expect(parsePageMeta("<html><body>hi</body></html>", "https://a.com")).toEqual({
      title: null, description: null, siteName: null, imageUrl: null,
    });
  });

  it("caps very long titles", () => {
    const meta = parsePageMeta(`<title>${"x".repeat(400)}</title>`, "https://a.com");
    expect(meta.title?.length).toBe(300);
  });
});

describe("decodeEntities", () => {
  it("decodes named and numeric entities", () => {
    expect(decodeEntities("a &amp; b &lt;c&gt; &#x41;&#66; &quot;q&quot; &unknown;")).toBe('a & b <c> AB "q" &unknown;');
  });
  it("leaves invalid code points alone", () => {
    expect(decodeEntities("&#0; &#x110000;")).toBe("&#0; &#x110000;");
  });
});
