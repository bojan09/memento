// Decide what the user is capturing from what they typed or pasted.
// A single URL (with or without scheme) is a link; anything else is a note.

export type Detected = { kind: "link"; url: string } | { kind: "note"; note: string } | { kind: "empty" };

const BARE_DOMAIN = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+([a-z]{2,24})(?::\d{2,5})?(?:[/?#]\S*)?$/i;
// "notes.txt" is a filename, not a website: these endings are only links when typed with http(s)://.
const FILE_EXTENSIONS = new Set(
  "txt pdf doc docx xls xlsx csv ppt pptx jpg jpeg png gif webp heic svg mp3 mp4 mov wav zip json js ts tsx jsx py rb java cpp h css html md log".split(" "),
);

export function detectInput(raw: string): Detected {
  const text = raw.trim();
  if (!text) return { kind: "empty" };
  if (/\s/.test(text)) return { kind: "note", note: text };

  const bare = text.match(BARE_DOMAIN);
  const candidate = /^https?:\/\//i.test(text)
    ? text
    : bare && !FILE_EXTENSIONS.has(bare[1].toLowerCase())
      ? `https://${text}`
      : null;
  if (candidate) {
    try {
      const url = new URL(candidate);
      if ((url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".")) {
        return { kind: "link", url: url.toString() };
      }
    } catch {
      // not a URL; fall through to note
    }
  }
  return { kind: "note", note: text };
}

export function hostLabel(url: string | null): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

// Notes have no title: the first line stands in for one.
export function noteTitle(note: string | null, max = 90): string {
  const first = (note ?? "").split("\n").find((l) => l.trim()) ?? "";
  const line = first.trim();
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}
