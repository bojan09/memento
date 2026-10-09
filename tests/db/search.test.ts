import { beforeAll, describe, expect, it } from "vitest";
import { createDb } from "./harness";

const A = "33333333-3333-3333-3333-333333333333";
const B = "44444444-4444-4444-4444-444444444444";

let h: Awaited<ReturnType<typeof createDb>>;
const search = (user: string, q: string) =>
  h.as<{ title: string | null; note: string | null }>(user, "select title, note from public.search_memories($1)", [q]);

beforeAll(async () => {
  h = await createDb();
  await h.addUser(A);
  await h.addUser(B);
  await h.as(A, `insert into public.memories (kind, url, title, site_name, description, why) values
    ('link', 'https://www.figma.com/blog/multiplayer', 'How Figma''s multiplayer technology works', 'Figma', 'Central server, per-property conflicts', 'sync design at work')`);
  await h.as(A, "insert into public.memories (kind, note) values ('note', 'Tile for the backsplash: zellige, matte')");
  await h.as(A, "insert into public.memories (kind, note) values ('note', 'Купи млеко и леб')");
  await h.as(B, "insert into public.memories (kind, note) values ('note', 'Figma is also in B''s notes')");
});

describe("search_memories", () => {
  it("matches word prefixes across title, why and url", async () => {
    expect(await search(A, "fig")).toHaveLength(1);
    expect(await search(A, "multi tech")).toHaveLength(1);
    expect(await search(A, "sync")).toHaveLength(1);
    expect(await search(A, "figma.com")).toHaveLength(1);
  });

  it("requires every word to match", async () => {
    expect(await search(A, "figma zellige")).toHaveLength(0);
  });

  it("finds Cyrillic text", async () => {
    expect(await search(A, "млек")).toHaveLength(1);
  });

  it("only returns the caller's memories", async () => {
    expect(await search(B, "figma")).toHaveLength(1);
    expect((await search(B, "figma"))[0].note).toContain("B's notes");
  });

  it("returns nothing for empty input", async () => {
    expect(await search(A, "")).toHaveLength(0);
    expect(await search(A, "   ")).toHaveLength(0);
  });

  it.each(["&", "| !", "a & (b", "can't", "it's:*", "\\", "x\\y", "'; drop table memories; --", "<->", "foo-bar"])(
    "does not error on %j",
    async (q) => {
      await expect(search(A, q)).resolves.toBeDefined();
    },
  );
});
