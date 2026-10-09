import type { Memory, Project } from "@/lib/types";

// Sample content for /demo. Dates are offsets from "now" so the feed always looks fresh.

const HOUR = 3600_000;
const DAY = 24 * HOUR;

function screenshot(label: string, a: string, b: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs>
<rect width="800" height="500" fill="url(#g)"/>
<rect x="60" y="60" width="680" height="380" rx="18" fill="#fff" opacity=".92"/>
<rect x="100" y="110" width="320" height="22" rx="6" fill="#1E2433"/>
<rect x="100" y="160" width="520" height="14" rx="5" fill="#9DA3B0"/>
<rect x="100" y="190" width="460" height="14" rx="5" fill="#9DA3B0"/>
<rect x="100" y="250" width="200" height="120" rx="12" fill="#EFECE4"/>
<rect x="320" y="250" width="200" height="120" rx="12" fill="#EFECE4"/>
<text x="100" y="420" font-family="system-ui, sans-serif" font-size="22" fill="#5A6275">${label}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEMO_PROJECTS: (Omit<Project, "memoryCount" | "createdAt"> & { ageDays: number })[] = [
  { id: "dd298c50-7c12-4924-8640-d826e89fd5aa", name: "Kitchen renovation", ageDays: 40 },
  { id: "a2f6cf5e-8734-45cb-83f5-da1063ed9277", name: "Side project", ageDays: 30 },
  { id: "c2ac9b40-08c9-4c9d-8c34-28bd8bbcc8d3", name: "Reading list", ageDays: 20 },
];

type Seed = Omit<Memory, "createdAt" | "updatedAt" | "status" | "imagePath"> & { ago: number };

const SEEDS: Seed[] = [
  {
    id: "c6228710-4755-40ec-a640-764dc14fe015", kind: "link", url: "https://www.figma.com/blog/how-figmas-multiplayer-technology-works/",
    title: "How Figma's multiplayer technology works", siteName: "Figma",
    description: "A central server is the authority, and conflicts are resolved per property, which keeps the system simple to reason about.",
    imageUrl: null, imageSrc: null, note: null, why: "For the sync design at work", projectId: "a2f6cf5e-8734-45cb-83f5-da1063ed9277", ago: 2 * DAY,
  },
  {
    id: "075f10c5-5ac6-49e9-92f3-158740768f43", kind: "note", url: null, title: null, siteName: null, description: null, imageUrl: null, imageSrc: null,
    note: "Tile for the backsplash: zellige, matte, 10×10.\nAsk for samples in white and sage before ordering.",
    why: null, projectId: "dd298c50-7c12-4924-8640-d826e89fd5aa", ago: 5 * DAY,
  },
  {
    id: "f322138a-6ca6-4b4f-8e59-0d8ec3717662", kind: "image", url: null, title: "Linear's onboarding checklist", siteName: null, description: null,
    imageUrl: null, imageSrc: screenshot("linear.app / onboarding", "#5E6AD2", "#1E2433"), note: null,
    why: "Good pattern for first-run setup", projectId: "a2f6cf5e-8734-45cb-83f5-da1063ed9277", ago: 3 * 7 * DAY,
  },
  {
    id: "3b1f3ec8-8c6e-4e7f-9067-19bd37488f47", kind: "link", url: "https://stripe.com/blog/idempotency", title: "Designing robust and predictable APIs with idempotency",
    siteName: "Stripe", description: "How idempotency keys make retries safe, and why every mutating API should support them.",
    imageUrl: null, imageSrc: null, note: null, why: null, projectId: "c2ac9b40-08c9-4c9d-8c34-28bd8bbcc8d3", ago: 6 * HOUR,
  },
  {
    id: "5d90e3ac-dbc5-48de-8d7c-8b12e508d397", kind: "note", url: null, title: null, siteName: null, description: null, imageUrl: null, imageSrc: null,
    note: "Idea: a weekly “rediscover” email with three old memories.", why: "Retention experiment", projectId: "a2f6cf5e-8734-45cb-83f5-da1063ed9277", ago: 40 * 60_000,
  },
  {
    id: "b9750240-84ea-47bf-9405-3d71c23cb968", kind: "link", url: "https://www.alltrails.com/trail/north-macedonia/korab", title: "Korab peak trail",
    siteName: "AllTrails", description: "Hard, 14.5 km out and back. Best from June to September.",
    imageUrl: null, imageSrc: null, note: null, why: "Summer trip with Ana", projectId: null, ago: 9 * DAY,
  },
  {
    id: "26dd3704-d629-41ef-b1a4-3d1bc8b617d5", kind: "image", url: null, title: null, siteName: null, description: null, imageUrl: null,
    imageSrc: screenshot("Faucet, brushed brass", "#E8A33D", "#8A5A12"), note: null, why: "The brass one, not the chrome",
    projectId: "dd298c50-7c12-4924-8640-d826e89fd5aa", ago: 12 * DAY,
  },
  {
    id: "b2c03624-cd71-4be3-aeea-e537a874da86", kind: "link", url: "https://www.postgresql.org/docs/current/textsearch-controls.html",
    title: "Controlling text search", siteName: "PostgreSQL Documentation",
    description: "to_tsvector, to_tsquery, ranking and highlighting search results.",
    imageUrl: null, imageSrc: null, note: null, why: null, projectId: "c2ac9b40-08c9-4c9d-8c34-28bd8bbcc8d3", ago: 60 * DAY,
  },
  {
    id: "94be54d1-13f5-43fc-8bdd-bbaf8e90a322", kind: "note", url: null, title: null, siteName: null, description: null, imageUrl: null, imageSrc: null,
    note: "“Make it work, make it right, make it fast.” Kent Beck", why: null, projectId: null, ago: 200 * DAY,
  },
];

export function demoSeed(now: number) {
  const iso = (ago: number) => new Date(now - ago).toISOString();
  const memories: Memory[] = SEEDS.map(({ ago, ...m }) => ({
    ...m,
    status: "ready",
    imagePath: null,
    createdAt: iso(ago),
    updatedAt: iso(ago),
  }));
  const projects = DEMO_PROJECTS.map(({ ageDays, ...p }) => ({ ...p, createdAt: iso(ageDays * DAY) }));
  return { memories, projects };
}
