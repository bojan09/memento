import { describe, expect, it } from "vitest";
import { fetchPage, FetchBlockedError } from "@/lib/link-preview/fetch-page";
import { isAllowedUrl, isPublicAddress } from "@/lib/link-preview/ssrf";

describe("isPublicAddress", () => {
  it.each([
    "127.0.0.1", "10.1.2.3", "172.16.0.1", "172.31.255.255", "192.168.1.1", "169.254.169.254", "100.64.0.1",
    "0.0.0.0", "224.0.0.1", "255.255.255.255", "::1", "::", "fe80::1", "fd00::1", "fc00::abcd",
    "::ffff:127.0.0.1", "::ffff:7f00:1", "::ffff:169.254.169.254", "::127.0.0.1", "64:ff9b::a9fe:a9fe", "2002:7f00:1::",
  ])("blocks %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(false);
  });

  it.each(["8.8.8.8", "1.1.1.1", "151.101.1.69", "2606:4700:4700::1111", "2a00:1450:4001:80b::200e"])("allows %s", (ip) => {
    expect(isPublicAddress(ip)).toBe(true);
  });

  it("rejects garbage", () => {
    expect(isPublicAddress("not-an-ip")).toBe(false);
  });
});

describe("isAllowedUrl", () => {
  it.each([
    "http://localhost/", "http://127.0.0.1/", "http://[::1]/", "http://169.254.169.254/latest/meta-data/",
    "https://example.com:8443/", "ftp://example.com/", "http://user:pass@example.com/", "http://intranet/",
    "http://printer.local/", "http://db.internal/",
  ])("blocks %s", (url) => {
    expect(isAllowedUrl(new URL(url))).toBe(false);
  });

  it.each(["https://example.com/", "http://example.com:80/x", "https://8.8.8.8/"])("allows %s", (url) => {
    expect(isAllowedUrl(new URL(url))).toBe(true);
  });
});

describe("fetchPage", () => {
  it.each(["http://127.0.0.1/", "http://169.254.169.254/latest/meta-data/", "http://[::1]/", "http://10.0.0.1/"])(
    "refuses %s before connecting",
    async (url) => {
      await expect(fetchPage(url)).rejects.toBeInstanceOf(FetchBlockedError);
    },
  );
});
