// Pull title, description, site name and preview image out of a page's <head>.
// Regex-based on purpose: we only read <meta>/<title>, and never run the page.

export type PageMeta = { title: string | null; description: string | null; siteName: string | null; imageUrl: string | null };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#39": "'" };

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+|#39);/gi, (m, code: string) => {
    const lower = code.toLowerCase();
    if (lower.startsWith("#x")) return safeChar(parseInt(lower.slice(2), 16), m);
    if (lower.startsWith("#") && lower !== "#39") return safeChar(parseInt(lower.slice(1), 10), m);
    return ENTITIES[lower] ?? m;
  });
}

function safeChar(code: number, fallback: string) {
  return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : fallback;
}

function clean(value: string | undefined | null, max: number): string | null {
  if (!value) return null;
  const text = decodeEntities(value).replace(/\s+/g, " ").trim();
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function attributes(tag: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g)) {
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  }
  return attrs;
}

export function parsePageMeta(html: string, pageUrl: string): PageMeta {
  const headEnd = html.search(/<\/head>/i);
  const head = headEnd === -1 ? html : html.slice(0, headEnd);
  const meta = new Map<string, string>();
  for (const m of head.matchAll(/<meta\b[^>]*>/gi)) {
    const a = attributes(m[0]);
    const key = (a.property ?? a.name ?? "").toLowerCase();
    if (key && a.content !== undefined && !meta.has(key)) meta.set(key, a.content);
  }
  const titleTag = head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];

  let imageUrl: string | null = null;
  const rawImage = meta.get("og:image:secure_url") ?? meta.get("og:image") ?? meta.get("twitter:image");
  if (rawImage) {
    try {
      const resolved = new URL(decodeEntities(rawImage.trim()), pageUrl);
      if ((resolved.protocol === "https:" || resolved.protocol === "http:") && resolved.href.length <= 2048) {
        imageUrl = resolved.href;
      }
    } catch {
      imageUrl = null;
    }
  }

  return {
    title: clean(meta.get("og:title") ?? meta.get("twitter:title") ?? titleTag, 300),
    description: clean(meta.get("og:description") ?? meta.get("description") ?? meta.get("twitter:description"), 1000),
    siteName: clean(meta.get("og:site_name") ?? meta.get("application-name"), 120),
    imageUrl,
  };
}
