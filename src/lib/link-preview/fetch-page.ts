import "server-only";
import { lookup as dnsLookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import type { LookupFunction } from "node:net";
import zlib from "node:zlib";
import { isAllowedUrl, isPublicAddress } from "./ssrf";

const MAX_BYTES = 512 * 1024;
const TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;
const USER_AGENT = "Mozilla/5.0 (compatible; MementoBot/1.0; link previews)";

export class FetchBlockedError extends Error {}

// DNS lookup that refuses to connect when the name resolves to any non-public address.
// Runs at connect time, so a DNS-rebinding answer can't slip past an earlier check.
const safeLookup: LookupFunction = (hostname, options, callback) => {
  dnsLookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err, "", 4);
    const list = addresses as unknown as LookupAddress[];
    if (!list.length || list.some((a) => !isPublicAddress(a.address))) {
      return callback(new FetchBlockedError(`Blocked address for ${hostname}`), "", 4);
    }
    if ((options as { all?: boolean }).all) return (callback as unknown as (e: null, a: LookupAddress[]) => void)(null, list);
    callback(null, list[0].address, list[0].family);
  });
};

type Page = { url: string; html: string };

function requestOnce(url: URL, signal: AbortSignal): Promise<{ status: number; location?: string; html?: string }> {
  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const req = client.request(
      url,
      {
        method: "GET",
        lookup: safeLookup,
        signal,
        headers: { "user-agent": USER_AGENT, accept: "text/html,application/xhtml+xml", "accept-encoding": "gzip, deflate, br" },
      },
      (res) => {
        const status = res.statusCode ?? 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          res.resume();
          return resolve({ status, location: res.headers.location });
        }
        const type = String(res.headers["content-type"] ?? "");
        if (status < 200 || status >= 300 || !/text\/html|application\/xhtml/i.test(type)) {
          res.resume();
          return resolve({ status });
        }

        const encoding = String(res.headers["content-encoding"] ?? "").toLowerCase();
        const stream =
          encoding === "gzip" ? res.pipe(zlib.createGunzip()) :
          encoding === "deflate" ? res.pipe(zlib.createInflate()) :
          encoding === "br" ? res.pipe(zlib.createBrotliDecompress()) : res;

        const chunks: Buffer[] = [];
        let size = 0;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          res.destroy();
          resolve({ status, html: Buffer.concat(chunks).toString("utf8") });
        };
        stream.on("data", (chunk: Buffer) => {
          chunks.push(chunk);
          size += chunk.length;
          // We only need <head>; stop at the size cap or once it has closed.
          if (size >= MAX_BYTES || /<\/head>/i.test(chunk.toString("latin1"))) finish();
        });
        stream.on("end", finish);
        stream.on("error", (e) => (done ? undefined : reject(e)));
      },
    );
    req.on("error", reject);
    req.end();
  });
}

// Fetch a page's HTML for metadata, following at most 3 redirects, each re-validated.
export async function fetchPage(input: string): Promise<Page | null> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);
  let url = new URL(input);
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    if (!isAllowedUrl(url)) throw new FetchBlockedError(`Blocked URL ${url.href}`);
    const res = await requestOnce(url, signal);
    if (res.location) {
      url = new URL(res.location, url);
      continue;
    }
    return res.html ? { url: url.href, html: res.html } : null;
  }
  return null;
}
