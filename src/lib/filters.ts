import type { KindFilter } from "@/lib/types";

const KINDS = new Set<KindFilter>(["all", "link", "note", "image"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Raw = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

// Parse feed filters from the URL; anything malformed is ignored rather than trusted.
export function parseFeedParams(params: Raw) {
  const kind = first(params.kind) as KindFilter;
  const project = first(params.project);
  const before = first(params.before);
  return {
    kind: KINDS.has(kind) ? kind : ("all" as KindFilter),
    projectId: UUID.test(project) ? project : null,
    before: before && !Number.isNaN(Date.parse(before)) ? new Date(before).toISOString() : null,
  };
}

export const isUuid = (v: string) => UUID.test(v);
export const queryParam = (params: Raw, key: string) => first(params[key]).slice(0, 200);
