import "server-only";
import { hostLabel } from "@/lib/capture/detect";
import { fetchPage } from "./fetch-page";
import { parsePageMeta, type PageMeta } from "./parse";

export type LinkPreview = PageMeta & { ok: boolean };

// Never throws: a failed preview just leaves the link with its hostname as title.
export async function getLinkPreview(url: string): Promise<LinkPreview> {
  try {
    const page = await fetchPage(url);
    if (!page) return { ok: false, title: null, description: null, siteName: hostLabel(url), imageUrl: null };
    const meta = parsePageMeta(page.html, page.url);
    return { ok: true, ...meta, siteName: meta.siteName ?? hostLabel(page.url) };
  } catch {
    return { ok: false, title: null, description: null, siteName: hostLabel(url), imageUrl: null };
  }
}
