import type { Metadata } from "next";
import { SearchView } from "@/components/views/search-view";
import { searchMemories } from "@/lib/data";
import { queryParam } from "@/lib/filters";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage(props: PageProps<"/search">) {
  const q = queryParam(await props.searchParams, "q").trim();
  const results = q ? await searchMemories(q) : [];
  return <SearchView key={q} query={q} results={results} />;
}
