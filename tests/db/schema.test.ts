import { beforeAll, describe, expect, it } from "vitest";
import { createDb } from "./harness";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

let h: Awaited<ReturnType<typeof createDb>>;

beforeAll(async () => {
  h = await createDb();
  await h.addUser(A);
  await h.addUser(B);
});

describe("row level security", () => {
  it("hides one user's memories from another", async () => {
    await h.as(A, "insert into public.memories (kind, note) values ('note', 'private to A')");
    expect(await h.as(B, "select id from public.memories")).toHaveLength(0);
    expect((await h.as(A, "select id from public.memories")).length).toBeGreaterThan(0);
  });

  it("rejects a spoofed user_id", async () => {
    await expect(h.as(B, `insert into public.memories (user_id, kind, note) values ('${A}', 'note', 'spoof')`)).rejects.toThrow();
  });

  it("blocks linking another user's project or tag", async () => {
    const [p] = await h.as<{ id: string }>(A, "insert into public.projects (name) values ('Kitchen') returning id");
    await expect(h.as(B, `insert into public.memories (kind, note, project_id) values ('note', 'x', '${p.id}')`)).rejects.toThrow();

    const [t] = await h.as<{ id: string }>(A, "insert into public.tags (name) values ('realtime') returning id");
    const [m] = await h.as<{ id: string }>(B, "insert into public.memories (kind, note) values ('note', 'mine') returning id");
    await expect(h.as(B, `insert into public.memory_tags (memory_id, tag_id) values ('${m.id}', '${t.id}')`)).rejects.toThrow();
  });
});

describe("memory constraints", () => {
  it("requires the payload that matches the kind", async () => {
    await expect(h.as(A, "insert into public.memories (kind) values ('link')")).rejects.toThrow();
    await expect(h.as(A, "insert into public.memories (kind) values ('image')")).rejects.toThrow();
  });

  it("only accepts http(s) links", async () => {
    await expect(h.as(A, "insert into public.memories (kind, url) values ('link', 'javascript:alert(1)')")).rejects.toThrow();
    await h.as(A, "insert into public.memories (kind, url) values ('link', 'https://example.com/a')");
  });

  it("clears project_id when the project is deleted", async () => {
    const [p] = await h.as<{ id: string }>(A, "insert into public.projects (name) values ('Temp') returning id");
    const [m] = await h.as<{ id: string }>(A, `insert into public.memories (kind, note, project_id) values ('note', 'n', '${p.id}') returning id`);
    await h.as(A, `delete from public.projects where id = '${p.id}'`);
    const [row] = await h.as<{ project_id: string | null }>(A, `select project_id from public.memories where id = '${m.id}'`);
    expect(row.project_id).toBeNull();
  });
});

describe("keepalive", () => {
  it("is callable by anon", async () => {
    await h.db.exec("set role anon;");
    const res = await h.db.query<{ k: number }>("select public.keepalive() as k");
    await h.db.exec("reset role;");
    expect(res.rows[0].k).toBe(1);
  });
});
