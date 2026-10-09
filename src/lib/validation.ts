import { z } from "zod";

// Limits mirror the database constraints (supabase/migrations).
export const LIMITS = { url: 2048, note: 20000, why: 500, title: 300, projectName: 80 } as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v === "" ? null : v))
    .nullish();

export const httpUrl = z
  .string()
  .trim()
  .max(LIMITS.url)
  .pipe(z.url({ protocol: /^https?$/, error: "Only http and https links can be saved." }));

const uuid = z.uuid();

export const captureSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("link"), url: httpUrl, why: optionalText(LIMITS.why), projectId: uuid.nullish() }),
  z.object({
    kind: z.literal("note"),
    note: z.string().trim().min(1, "Write something first.").max(LIMITS.note),
    why: optionalText(LIMITS.why),
    projectId: uuid.nullish(),
  }),
  z.object({
    kind: z.literal("image"),
    imagePath: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(webp|jpg|png)$/, "Invalid upload."),
    why: optionalText(LIMITS.why),
    projectId: uuid.nullish(),
  }),
]);

export const memoryPatchSchema = z.object({
  title: optionalText(LIMITS.title),
  note: optionalText(LIMITS.note),
  why: optionalText(LIMITS.why),
  projectId: uuid.nullish(),
});

export const projectNameSchema = z.string().trim().min(1, "Give the project a name.").max(LIMITS.projectName);

export const idSchema = uuid;
